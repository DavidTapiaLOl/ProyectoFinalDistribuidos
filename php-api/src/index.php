<?php
// 1. Configuración de CORS (Vital para que Angular no te bloquee)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de la solicitud OPTIONS (Pre-flight request de Angular)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db.php';
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Leer el cuerpo JSON de la solicitud (para POST y PUT)
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Obtener una computadora específica
                $stmt = $db->prepare("SELECT * FROM computadoras WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
            } else {
                // Listar todas las computadoras (ordenadas por fecha)
                $stmt = $db->query("SELECT * FROM computadoras ORDER BY fecha_creacion DESC");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;

       case 'POST':
            // Crear computadora
            $uuid = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4));

            // AÑADIMOS usuario_nombre A LA CONSULTA
            $sql = "INSERT INTO computadoras 
                    (id, tipo_equipo, marca, modelo, numero_serie, procesador, ram_gb, almacenamiento_gb, fecha_compra, estado, usuario_registro, usuario_nombre) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $uuid,
                $input['tipo_equipo'],
                $input['marca'],
                $input['modelo'],
                $input['numero_serie'],
                $input['procesador'],
                $input['ram_gb'],
                $input['almacenamiento_gb'],
                $input['fecha_compra'],
                $input['estado'],
                $input['usuario_registro'],
                $input['usuario_nombre'] // <--- NUEVO CAMPO
            ]);
            
            echo json_encode(['message' => 'Computadora creada exitosamente', 'id' => $uuid]);
            break;

        case 'PUT':
            // Actualizar computadora
            $sql = "UPDATE computadoras SET 
                    tipo_equipo=?, marca=?, modelo=?, numero_serie=?, 
                    procesador=?, ram_gb=?, almacenamiento_gb=?, 
                    fecha_compra=?, estado=?, fecha_actualizacion=NOW() 
                    WHERE id=?";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $input['tipo_equipo'],
                $input['marca'],
                $input['modelo'],
                $input['numero_serie'],
                $input['procesador'],
                $input['ram_gb'],
                $input['almacenamiento_gb'],
                $input['fecha_compra'],
                $input['estado'],
                $input['id'] // El ID va al final por el WHERE
            ]);
            
            echo json_encode(['message' => 'Computadora actualizada']);
            break;

        case 'DELETE':
            // Eliminar computadora
            if (isset($_GET['id'])) {
                $stmt = $db->prepare("DELETE FROM computadoras WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                echo json_encode(['message' => 'Computadora eliminada']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ID es requerido para eliminar']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
            break;
    }
} catch (PDOException $e) {
    // Si hay error de SQL (ej. Numero de serie duplicado)
    http_response_code(500);
    echo json_encode(['error' => 'Error de Base de Datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>