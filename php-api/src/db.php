<?php
// Archivo: php-api/src/db.php
function getDB() {
    // En Docker, el host es el NOMBRE DEL SERVICIO definido en docker-compose
    $host = 'db-postgres'; 
    $db = 'inventario_db';
    $user = 'admin';
    $pass = 'password123';
    $port = "5432";

    try {
        $dsn = "pgsql:host=$host;port=$port;dbname=$db;";
        $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        return $pdo;
    } catch (PDOException $e) {
        // Si falla, imprime el error (útil para depurar)
        die("Error de conexión a Postgres: " . $e->getMessage());
    }
}
?>