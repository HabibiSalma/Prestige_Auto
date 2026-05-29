<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

/**
 * DocumentController — upload + verify identity documents.
 *
 * Clients can list & upload their own files; staff (gestionnaire,
 * proprietaire) can list everyone's and flip the `verified` boolean.
 */
class DocumentController extends Controller
{
    /**
     * GET /api/documents — auth required.
     *
     * Per-role visibility:
     *   - client       : own documents only
     *   - gestionnaire : documents of clients who have at least ONE
     *                    reservation linked to this gestionnaire's agency
     *   - proprietaire : everything (no scope)
     *
     * The gestionnaire scope is enforced with a SQL subquery so we don't
     * pull a huge user_id list into PHP memory just to feed a whereIn.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user  = $request->user();
        $query = Document::with('user')->latest();

        // ?mine=1 means "show only the documents I uploaded myself".
        // This overrides role-based scoping so the Documents block on the
        // personal Profile page behaves identically for clients,
        // gestionnaires and the proprietaire — each sees only their own
        // papers, never anyone else's.
        if ($request->boolean('mine')) {
            $query->where('user_id', $user->id);
        } elseif ($user->isClient()) {
            // Safety net: even without ?mine=1, a client only ever sees
            // their own documents.
            $query->where('user_id', $user->id);
        } elseif ($user->isGestionnaire()) {
            // Dashboard view for staff: documents of clients who have at
            // least one reservation in this gestionnaire's agency.
            $agencyId = User::myAgencyId();
            $query->whereIn('user_id', function ($sub) use ($agencyId) {
                $sub->select('user_id')
                    ->from('reservations')
                    ->where('agency_id', $agencyId);
            });
        }
        // proprietaire (without ?mine=1): no scope — global dashboard view.

        return DocumentResource::collection($query->paginate(30));
    }

    /**
     * POST /api/documents — auth required.
     *
     * The uploaded file is stored on the "public" disk so it can be
     * served via /storage/... once `php artisan storage:link` has run.
     */
    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $path = $request->file('file')->store('documents', 'public');

        $document = Document::create([
            'user_id'    => $request->user()->id,
            'type'       => $request->type,
            'file_path'  => $path,
            'expires_at' => $request->expires_at,
            'verified'   => false,
        ]);

        return response()->json(new DocumentResource($document), 201);
    }

    /**
     * POST /api/documents/{document}/verify — staff only.
     *
     * A gestionnaire can only verify documents of clients who have a
     * reservation in their agency. A proprietaire can verify anyone's.
     */
    public function verify(Document $document): JsonResponse
    {
        $user = auth()->user();

        if ($user->isGestionnaire()) {
            $agencyId = User::myAgencyId();
            $belongs  = $document->user->reservations()
                ->where('agency_id', $agencyId)
                ->exists();
            abort_unless(
                $belongs,
                403,
                "Ce client n'a aucune réservation dans votre agence."
            );
        }

        $document->update(['verified' => true]);
        return response()->json(new DocumentResource($document->load('user')));
    }

    /**
     * DELETE /api/documents/{document} — owner or staff.
     */
    public function destroy(Request $request, Document $document): JsonResponse
    {
        $user = $request->user();
        $allowed = $document->user_id === $user->id || $user->hasStaffAccess();
        abort_unless($allowed, 403, 'Action non autorisée.');

        // Best-effort cleanup of the file from disk.
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json(['message' => 'Document supprimé.']);
    }
}
