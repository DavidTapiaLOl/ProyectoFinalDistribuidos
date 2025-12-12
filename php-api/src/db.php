<?php

function getDB() {

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
       
        die("Error de conexión a Postgres: " . $e->getMessage());
    }
}
?>