# syntax=docker/dockerfile:1
# -----------------------------------------------------------------------------
# Prestige Auto — Laravel 12 API image for Render (PHP 8.2 + Apache).
# Build context / Render "Root Directory" must be: backend
# -----------------------------------------------------------------------------
FROM php:8.2-apache

# --- System packages + PHP extensions ----------------------------------------
#   pdo_pgsql / pgsql : Render PostgreSQL driver
#   gd / exif         : image handling
#   zip / unzip       : composer dist installs
RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip libzip-dev libpq-dev \
        libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql gd zip bcmath exif \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# --- Apache: enable rewrite + point the docroot at /public --------------------
RUN a2enmod rewrite headers \
    && sed -ri 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
    && printf '<Directory /var/www/html/public>\n    AllowOverride All\n    Require all granted\n</Directory>\n' \
        > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel

# --- Composer -----------------------------------------------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP deps first for better layer caching (no scripts/autoload yet).
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# Copy the rest of the app and build the optimised autoloader.
COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
