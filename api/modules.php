<?php
declare(strict_types=1);

require __DIR__ . '/common.php';
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $isPublicRequest = ($_GET['public'] ?? '') === '1';
    $user = $isPublicRequest ? null : require_login();
    $params = [];
    $where = ['enabled = 1'];

    if ($isPublicRequest) {
        $cityHallId = (int) ($_GET['cityHallId'] ?? 0);
        if ($cityHallId > 0) {
            $where[] = 'city_hall_id = ?';
            $params[] = $cityHallId;
        }
    } elseif (($user['role'] ?? '') !== 'ADMIN') {
        $where[] = 'city_hall_id = ?';
        $params[] = (int) ($user['cityHallId'] ?? 0);
    }

    $sqlWhere = 'WHERE ' . implode(' AND ', $where);
    $stmt = $pdo->prepare(
        "SELECT city_hall_id, module_id
         FROM city_hall_modules
         $sqlWhere
         ORDER BY city_hall_id, module_id"
    );
    $stmt->execute($params);

    $activeModules = [];
    foreach ($stmt->fetchAll() as $row) {
        $cityHallId = (string) $row['city_hall_id'];
        $activeModules[$cityHallId] ??= [];
        $activeModules[$cityHallId][] = $row['module_id'];
    }

    json_response(['ok' => true, 'activeModules' => $activeModules]);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $user = require_login();
    require_roles(['ADMIN']);
    $data = get_json_input();
    $cityHallId = (int) ($data['cityHallId'] ?? 0);
    $modules = $data['modules'] ?? [];

    if ($cityHallId <= 0 || !is_array($modules) || count($modules) === 0) {
        json_response(['ok' => false, 'error' => 'Dados invalidos'], 422);
    }

    $pdo->beginTransaction();
    try {
        $pdo->prepare('DELETE FROM city_hall_modules WHERE city_hall_id = ?')->execute([$cityHallId]);
        $insert = $pdo->prepare('INSERT INTO city_hall_modules (city_hall_id, module_id, enabled) VALUES (?, ?, 1)');
        foreach ($modules as $moduleId) {
            $insert->execute([$cityHallId, $moduleId]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Update modules error: ' . $e->getMessage());
        json_response(['ok' => false, 'error' => 'Nao foi possivel atualizar modulos'], 500);
    }

    json_response(['ok' => true, 'cityHallId' => (string) $cityHallId, 'modules' => $modules]);
}

json_response(['ok' => false, 'error' => 'Metodo invalido'], 405);
