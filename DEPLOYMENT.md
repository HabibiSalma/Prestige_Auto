# Prestige Auto — Production Deployment Guide

Project-specific guide for this repository.

- **Frontend** (`/frontend`): React 18 + Vite 5 SPA → **Vercel**
- **Backend** (`/backend`): Laravel 12 + Sanctum (bearer-token auth) → **Render** (Docker)
- **Database**: **Render PostgreSQL** (free; Render does not offer managed MySQL)
- **Media uploads**: **Cloudinary** (free tier; Render's disk is ephemeral)

> Architecture note: auth is pure **bearer token** (token in `localStorage`, sent
> as `Authorization: Bearer`). There are **no session cookies and no CSRF**, so the
> Vercel ↔ Render cross-origin split works without `SANCTUM_STATEFUL_DOMAINS`.

---

## 1. Is it production-ready?

Mostly yes, after the changes already applied in this repo:

| Area | Status | Notes |
|------|--------|-------|
| Auth (token) | ✅ Ready | Cross-origin safe, no cookie/CSRF coupling |
| API base URL | ✅ Ready | Frontend reads `VITE_API_URL` everywhere |
| DB driver | ✅ Ready | Switched to `pgsql`; migrations are vendor-neutral |
| CORS | ✅ Fixed | Now env-driven (`FRONTEND_URL`) + `*.vercel.app` |
| Uploads persistence | ✅ Fixed | Routed to Cloudinary via `CloudinaryStorage` |
| Avatar URL | ✅ Fixed | New `avatar_url` field, frontend updated |
| Web server | ✅ Added | `Dockerfile` (PHP 8.2 + Apache) for Render |
| Migrations/seed | ✅ Automated | Run from the Docker entrypoint |

---

## 2. Code changes already made (in this commit)

**Backend**
- `composer.json` / `composer.lock` — added `cloudinary/cloudinary_php`.
- `app/Support/CloudinaryStorage.php` — **new**. Stores to Cloudinary when
  `CLOUDINARY_URL` is set, else falls back to the local `public` disk.
- `config/services.php` — added `cloudinary.url`.
- `app/Http/Controllers/ProfileController.php`, `VehicleController.php`,
  `DocumentController.php` — uploads/deletes now go through `CloudinaryStorage`.
- `app/Http/Resources/UserResource.php` — added ready-to-render `avatar_url`.
- `config/cors.php` — `allowed_origins` reads `FRONTEND_URL`; allows `*.vercel.app`.
- `Dockerfile`, `docker/entrypoint.sh`, `.dockerignore`, `.env.production.example` — **new**.

**Frontend**
- `src/components/Navbar.jsx`, `src/pages/Profile.jsx` — use `user.avatar_url`.
- `vercel.json`, `.env.example` — **new**.

> Local dev is unaffected: with no `CLOUDINARY_URL` and `DB_CONNECTION=mysql`,
> everything behaves as before.

---

## 3. Environment variables

### Backend (Render → Environment)

| Key | Value |
|-----|-------|
| `APP_NAME` | `Prestige Auto` |
| `APP_ENV` | `production` |
| `APP_KEY` | `base64:...` (run `php artisan key:generate --show` locally, paste) |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://<your-api>.onrender.com` |
| `LOG_CHANNEL` | `stderr` |
| `LOG_LEVEL` | `error` |
| `DB_CONNECTION` | `pgsql` |
| `DB_URL` | Render Postgres **Internal Database URL** |
| `SESSION_DRIVER` | `cookie` |
| `CACHE_STORE` | `database` |
| `QUEUE_CONNECTION` | `sync` |
| `SANCTUM_STATEFUL_DOMAINS` | *(leave empty)* |
| `FILESYSTEM_DISK` | `public` |
| `CLOUDINARY_URL` | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` |
| `FRONTEND_URL` | `https://<your-app>.vercel.app` |
| `MAIL_MAILER` | `log` |
| `RUN_SEED` | `true` for the **first** deploy only, then delete it |

### Frontend (Vercel → Settings → Environment Variables)

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://<your-api>.onrender.com/api` (note the `/api`, no trailing slash) |

---

## 4. Build & Start commands

### Render (Backend) — runtime: **Docker**
- Root Directory: `backend`
- Dockerfile Path: `backend/Dockerfile` (auto-detected)
- Build Command: *(none — handled by the Dockerfile)*
- Start Command: *(none — `ENTRYPOINT` runs migrations then `apache2-foreground`)*

### Vercel (Frontend)
- Root Directory: `frontend`
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `dist`

---

## 5. First-time deployment — step by step

### A. Cloudinary (media storage)
1. Create a free account at cloudinary.com.
2. Dashboard → copy the **API environment variable**:
   `cloudinary://<api_key>:<api_secret>@<cloud_name>`. Keep it for `CLOUDINARY_URL`.

### B. Render PostgreSQL (database)
1. Render Dashboard → **New** → **PostgreSQL** → free plan → pick a region.
2. After it provisions, open it and copy the **Internal Database URL**
   (starts with `postgresql://`). Keep it for `DB_URL`.

### C. Generate the app key
Locally, in `backend/`:
```
php artisan key:generate --show
```
Copy the full `base64:...` string for `APP_KEY`.

### D. Push the code
Commit everything and push to `https://github.com/HabibiSalma/Prestige_Auto`.

### E. Render Web Service (backend API)
1. Render → **New** → **Web Service** → connect the GitHub repo.
2. **Root Directory** = `backend`. Render detects the `Dockerfile` (runtime: Docker).
3. Same **region** as the database (so the Internal DB URL works).
4. Add all backend env vars from §3 (set `RUN_SEED=true` for now).
   - For `APP_URL`, you can deploy once, copy the assigned `.onrender.com`
     URL, then set `APP_URL` to it and redeploy.
5. Create the service and wait for the build. The entrypoint auto-runs
   `migrate --force` and (because `RUN_SEED=true`) `db:seed --force`.
6. Verify: open `https://<your-api>.onrender.com/up` → should return healthy,
   and `https://<your-api>.onrender.com/api/vehicles` → JSON list of cars.
7. **Remove `RUN_SEED`** (or set it to `false`) and trigger a redeploy so future
   deploys don't reseed.

### F. Vercel (frontend SPA)
1. vercel.com → **Add New** → **Project** → import the same repo.
2. **Root Directory** = `frontend`. Framework auto-detects as Vite.
3. Add env var `VITE_API_URL = https://<your-api>.onrender.com/api`.
4. Deploy. Copy the resulting `https://<your-app>.vercel.app` URL.

### G. Close the loop (CORS)
1. Back in Render, set `FRONTEND_URL` to the Vercel URL → redeploy the backend.
2. Open the Vercel site, log in with a seeded account
   (`owner@prestige-auto.ma` / `password`), upload an avatar, confirm it shows.

---

## 6. Possible errors in THIS project & fixes

| Symptom | Cause | Fix |
|--------|-------|-----|
| `CORS policy` blocked in browser console | `FRONTEND_URL` not set / wrong on Render | Set it to the exact Vercel origin (no trailing slash), redeploy backend |
| Frontend calls `http://localhost:8000/api` in prod | `VITE_API_URL` missing on Vercel **at build time** | Vite inlines envs at build — set the var, then **redeploy** |
| `SQLSTATE[08006] could not connect` | Using External URL, or service in a different region than DB | Use the **Internal Database URL**, same region |
| Build fails: `could not find driver` (pgsql) | Not using the provided Dockerfile | Deploy via Docker; the Dockerfile installs `pdo_pgsql` |
| `No application encryption key` | `APP_KEY` not set | Set `APP_KEY=base64:...` env var |
| Uploaded images vanish after a redeploy | `CLOUDINARY_URL` not set → files went to ephemeral disk | Set `CLOUDINARY_URL`, redeploy; re-upload |
| Avatar/photo broken in prod | Old client cached, or `APP_URL` wrong | Hard-refresh; ensure `avatar_url` is used (already wired) and `APP_URL` is the Render URL |
| `entrypoint.sh: no such file` / `bad interpreter` | CRLF line endings on the script | `.gitattributes` forces LF — re-clone/re-commit if it slipped in |
| `Unable to prepare route [/] ... Closure` | Someone added `route:cache` | Don't cache routes (web `/` is a closure); entrypoint only does `config:cache` |
| Seed data duplicated | `RUN_SEED` left enabled | Remove the var after the first successful deploy |
| First request after idle is slow / 502 | Render free tier spins the service down after 15 min | Expected on free tier; first hit cold-starts (~30–60s) |

---

## 7. Deployment checklist

**Prep**
- [ ] Cloudinary account created; `CLOUDINARY_URL` copied
- [ ] Render PostgreSQL created; **Internal Database URL** copied
- [ ] `php artisan key:generate --show` run; `APP_KEY` copied
- [ ] All changes committed & pushed to GitHub

**Backend (Render)**
- [ ] New Web Service, Root Directory = `backend`, runtime Docker
- [ ] Same region as the database
- [ ] All env vars from §3 added (incl. `RUN_SEED=true`)
- [ ] Build succeeds; `/up` healthy; `/api/vehicles` returns JSON
- [ ] `APP_URL` set to the real `.onrender.com` URL (redeploy if needed)
- [ ] `RUN_SEED` removed/false after first deploy

**Frontend (Vercel)**
- [ ] New Project, Root Directory = `frontend`, preset Vite
- [ ] `VITE_API_URL = https://<api>.onrender.com/api` set
- [ ] Deployed; site loads the car catalogue

**Wire-up & verify**
- [ ] `FRONTEND_URL` on Render = Vercel URL; backend redeployed
- [ ] Login works (`owner@prestige-auto.ma` / `password`)
- [ ] Avatar upload persists and displays
- [ ] Vehicle photo upload persists after a redeploy (Cloudinary)
- [ ] No CORS errors in the browser console
