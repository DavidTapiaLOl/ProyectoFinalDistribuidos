FROM php:8.2-apache

# Instalar dependencias para Postgres
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Habilitar mod_rewrite de Apache (útil para APIs)
RUN a2enmod rewrite