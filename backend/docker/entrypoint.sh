#!/usr/bin/env bash
set -e

# -----------------------------------------------------------------------------
# Render injects PORT (default 10000 for Docker web services). Apache listens
# on 80 by default, so rewrite it to the assigned port at container start.
# -----------------------------------------------------------------------------
PORT="${PORT:-80}"
sed -ri "s/^Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Clear any stale cached config baked into the image.
php artisan config:clear || true

# Run database migrations against Render PostgreSQL.
php artisan migrate --force

# Seed demo data ONCE. Set RUN_SEED=true for the very first deploy, then remove
# the variable so later deploys don't duplicate rows.
if [ "${RUN_SEED}" = "true" ]; then
    php artisan db:seed --force
fi

# Cache config for performance. We deliberately do NOT route:cache because
# routes/web.php contains a closure ('/'), which is not cacheable.
php artisan config:cache

exec apache2-foreground
