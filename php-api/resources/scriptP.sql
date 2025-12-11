-- Base de datos: inventario_db
-- Motor: PostgreSQL 15

CREATE TABLE IF NOT EXISTS computadoras (
    id CHAR(36) PRIMARY KEY,          
    tipo_equipo VARCHAR(50),          
    marca VARCHAR(50),
    modelo VARCHAR(100),
    numero_serie VARCHAR(100) UNIQUE NOT NULL,
    procesador VARCHAR(100),
    ram_gb INTEGER,
    almacenamiento_gb INTEGER,
    fecha_compra DATE,
    estado VARCHAR(30),               
    
   
    usuario_registro CHAR(36),       
    usuario_nombre VARCHAR(100),      
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);