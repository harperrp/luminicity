<?php
declare(strict_types=1);

require __DIR__ . '/common.php';
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = require_login();

if ($method === 'GET') {
    $params = [];
    $where = '';
    if (($user['role'] ?? '') !== 'ADMIN') {
        $where = 'WHERE ch.id = ?';
        $params[] = (int) ($user['cityHallId'] ?? 0);
    }

    $stmt = $pdo->prepare(
        "SELECT
          ch.*,
          COUNT(DISTINCT u.id) AS users_count,
          COUNT(DISTINCT p.id) AS poles_count
        FROM city_halls ch
        LEFT JOIN users u ON u.city_hall_id = ch.id AND u.active = 1
        LEFT JOIN poles p ON p.city_hall_id = ch.id
        $where
        GROUP BY ch.id
        ORDER BY ch.name"
    );
    $stmt->execute($params);
    $items = array_map('map_city_hall', $stmt->fetchAll());
    json_response(['ok' => true, 'cityHalls' => $items]);
}

if ($method === 'POST') {
    require_roles(['ADMIN']);
    $data = get_json_input();
    $modules = $data['modules'] ?? [];
    if (!is_array($modules) || count($modules) === 0) {
        $modules = ['ILUMINACAO'];
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO city_halls (name, city, state, cnpj, status, plan_id, pole_limit, latitude, longitude)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            trim((string) ($data['name'] ?? '')),
            trim((string) ($data['city'] ?? '')),
            strtoupper(trim((string) ($data['state'] ?? ''))),
            $data['cnpj'] ?? null,
            $data['status'] ?? 'ATIVO',
            $data['planId'] ?? 'STARTER',
            (int) ($data['poleLimit'] ?? 500),
            (float) ($data['latitude'] ?? 0),
            (float) ($data['longitude'] ?? 0),
        ]);
        $id = (int) $pdo->lastInsertId();

        $insertModule = $pdo->prepare('INSERT INTO city_hall_modules (city_hall_id, module_id, enabled) VALUES (?, ?, 1)');
        foreach ($modules as $moduleId) {
            $insertModule->execute([$id, $moduleId]);
        }

        $pdo->commit();
        $stmt = $pdo->prepare(
            'SELECT ch.*, 0 AS users_count, 0 AS poles_count FROM city_halls ch WHERE ch.id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        json_response(['ok' => true, 'cityHall' => map_city_hall($stmt->fetch())], 201);
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Create city hall error: ' . $e->getMessage());
        json_response(['ok' => false, 'error' => 'Nao foi possivel cadastrar a prefeitura'], 500);
    }
}

if ($method === 'PUT' || $method === 'PATCH') {
    require_roles(['ADMIN']);
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        json_response(['ok' => false, 'error' => 'ID invalido'], 422);
    }

    $data = get_json_input();
    $stmt = $pdo->prepare(
        'UPDATE city_halls
         SET name = COALESCE(?, name),
             city = COALESCE(?, city),
             state = COALESCE(?, state),
             cnpj = ?,
             status = COALESCE(?, status),
             plan_id = COALESCE(?, plan_id),
             pole_limit = COALESCE(?, pole_limit),
             latitude = COALESCE(?, latitude),
             longitude = COALESCE(?, longitude)
         WHERE id = ?'
    );
    $stmt->execute([
        isset($data['name']) ? trim((string) $data['name']) : null,
        isset($data['city']) ? trim((string) $data['city']) : null,
        isset($data['state']) ? strtoupper(trim((string) $data['state'])) : null,
        array_key_exists('cnpj', $data) ? $data['cnpj'] : null,
        $data['status'] ?? null,
        $data['planId'] ?? null,
        isset($data['poleLimit']) ? (int) $data['poleLimit'] : null,
        isset($data['latitude']) ? (float) $data['latitude'] : null,
        isset($data['longitude']) ? (float) $data['longitude'] : null,
        $id,
    ]);

    $stmt = $pdo->prepare(
        'SELECT ch.*, COUNT(DISTINCT u.id) AS users_count, COUNT(DISTINCT p.id) AS poles_count
         FROM city_halls ch
         LEFT JOIN users u ON u.city_hall_id = ch.id AND u.active = 1
         LEFT JOIN poles p ON p.city_hall_id = ch.id
         WHERE ch.id = ?
         GROUP BY ch.id'
    );
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) {
        json_response(['ok' => false, 'error' => 'Prefeitura nao encontrada'], 404);
    }

    json_response(['ok' => true, 'cityHall' => map_city_hall($row)]);
}

json_response(['ok' => false, 'error' => 'Metodo invalido'], 405);
