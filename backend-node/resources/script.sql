CREATE DATABASE IF NOT EXISTS distribuida_db;
USE distribuida_db;

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,          -- UUID generado por el backend
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,   -- Contraseña encriptada (Bcrypt)
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);