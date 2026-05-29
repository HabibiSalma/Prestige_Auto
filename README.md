# Prestige Auto

Plateforme de location de voitures de luxe et sportives.
**Backend** : Laravel 11 (PHP 8.2+) + MySQL 8 + Sanctum.
**Frontend** : React 18 (Vite) + Bootstrap 5 + Leaflet + Chart.js.

```
prestige-auto/
├── backend/    Laravel 11 API
└── frontend/   React SPA (Vite)
```

---

## 1. Installation du backend

Les fichiers livrés ici (`app/`, `database/`, `routes/`, `bootstrap/app.php`,
`config/cors.php`, `config/sanctum.php`, `.env.example`) doivent être copiés
**par-dessus** un projet Laravel 11 fraîchement créé.

```bash
# 1) Créer un projet Laravel vierge
composer create-project laravel/laravel backend

# 2) Copier le contenu de ce dépôt par-dessus
#    (sur Windows : faites simplement glisser les dossiers en validant le remplacement)
#    Sur macOS/Linux :
cp -r prestige-auto/backend/* backend/
cp prestige-auto/backend/.env.example backend/.env.example

# 3) Installer Sanctum
cd backend
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 4) Préparer l'environnement
cp .env.example .env
php artisan key:generate
# -> Créer une base MySQL "prestige_auto" puis adapter DB_USERNAME/DB_PASSWORD dans .env

# 5) Migrer + remplir avec les données de démo
php artisan migrate
php artisan db:seed

# 6) Permettre le téléchargement des fichiers (avatars, documents, photos)
php artisan storage:link

# 7) Lancer l'API
php artisan serve
# -> http://localhost:8000
```

### Comptes de démonstration

Tous les comptes sont créés avec le mot de passe **`password`**.

| Email                                         | Rôle           |
|-----------------------------------------------|----------------|
| `owner@prestige-auto.ma`                      | Propriétaire   |
| `gestionnaire.casa@prestige-auto.ma`          | Gestionnaire (Casablanca) |
| `gestionnaire.marrakech@prestige-auto.ma`     | Gestionnaire (Marrakech)  |
| `client@prestige-auto.ma`                     | Client         |

---

## 2. Installation du frontend

```bash
# 1) Créer un projet Vite vierge
npm create vite@latest frontend -- --template react

# 2) Copier le contenu de ce dépôt par-dessus
cp -r prestige-auto/frontend/* frontend/

# 3) Installer les dépendances
cd frontend
npm install

# 4) Lancer le serveur de dev
npm run dev
# -> http://localhost:5173
```

> **Note** : si vous hébergez l'API ailleurs que `http://localhost:8000`,
> créez un fichier `frontend/.env` :
>
> ```env
> VITE_API_URL=http://votre-domaine/api
> ```

---

## 3. Lancement quotidien

```bash
# Terminal 1 — backend
cd backend && php artisan serve

# Terminal 2 — frontend
cd frontend && npm run dev
```

Ouvrez ensuite **http://localhost:5173** dans votre navigateur.

---

## 4. Photos des véhicules

Les seeders utilisent des photos placeholder (Unsplash). Pour mettre les
vraies photos :

- Connectez-vous en tant que **gestionnaire** ou **propriétaire**.
- Allez dans **Tableau de bord → Flotte → Modifier** un véhicule.
- L'endpoint `POST /api/vehicles/{id}/images` accepte un upload multiple
  (voir `VehicleController::uploadImages`). Vous pouvez aussi remplacer
  manuellement les URLs placeholder dans `database/seeders/DatabaseSeeder.php`.

Les images uploadées sont stockées dans `storage/app/public/vehicles/` et
servies via `/storage/...` après `php artisan storage:link`.

---

## 5. Architecture résumée

### Backend
- **Modèles Eloquent** dans `app/Models/` (relations belongsTo / hasMany).
- **Validation** via Form Requests dans `app/Http/Requests/`.
- **Réponses JSON** via API Resources dans `app/Http/Resources/`.
- **Autorisation par rôle** via `RoleMiddleware` (`role:gestionnaire,proprietaire`).
- **Routes** regroupées par niveau d'accès dans `routes/api.php`.

### Frontend
- **API** : un fichier par ressource dans `src/api/` (auth, vehicles, …).
- **Auth** : `AuthContext` (token Sanctum dans localStorage + interceptor axios).
- **Routes** : `App.jsx` (publiques / authentifiées / staff).
- **Composants** réutilisables dans `src/components/`.
- **Pages** dans `src/pages/` (+ dashboards dans `src/pages/dashboard/`).
- **Styles** dans `src/styles/app.css` (palette crème + or + noir).

---

## 6. Extensions futures (faciles à ajouter)

- Notifications par email (Laravel `Mail::to(...)->send(new ReservationConfirmed())`).
- Tâche planifiée `php artisan schedule:run` pour notifier les pickups à J-1.
- Tests Feature avec Pest sur l'API.
- Paiement Stripe lors de la confirmation.
