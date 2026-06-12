<?php
declare(strict_types=1);

require __DIR__ . '/common.php';
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user = current_user();
    $params = [];
    $where = [];

    if ($user !== null && ($user['role'] ?? '') !== 'ADMIN') {
        $where[] = 'city_hall_id = ?';
        $params[] = (int) ($user['cityHallId'] ?? 0);
    } elseif (!empty($_GET['cityHallId'])) {
        $where[] = 'city_hall_id = ?';
        $params[] = (int) $_GET['cityHallId'];
    }

    $sqlWhere = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $stmt = $pdo->prepare("SELECT * FROM poles $sqlWhere ORDER BY pole_code");
    $stmt->execute($params);
    json_response(['ok' => true, 'poles' => array_map('map_pole', $stmt->fetchAll())]);
}

if ($method === 'POST') {
    $user = require_login();
    $data = get_json_input();
    $items = isset($data['poles']) && is_array($data['poles']) ? $data['poles'] : [$data];
    $created = [];

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO poles (city_hall_id, pole_code, latitude, longitude, status, neighborhood, address, observations)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               latitude = VALUES(latitude),
               longitude = VALUES(longitude),
               status = VALUES(status),
               neighborhood = VALUES(neighborhood),
               address = VALUES(address),
               observations = VALUES(observations)'
        );

        foreach ($items as $item) {
            $cityHallId = (string) ($item['cityHallId'] ?? $user['cityHallId'] ?? '');
            ensure_city_scope($user, $cityHallId);

            $stmt->execute([
                (int) $cityHallId,
                trim((string) ($item['id'] ?? $item['poleCode'] ?? '')),
                (float) ($item['latitude'] ?? 0),
                (float) ($item['longitude'] ?? 0),
                $item['status'] ?? 'FUNCIONANDO',
                $item['neighborhood'] ?? null,
                $item['address'] ?? null,
                $item['observations'] ?? null,
            ]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Save pole error: ' . $e->getMessage());
        json_response(['ok' => false, 'error' => 'Nao foi possivel salvar poste(s)'], 500);
    }

    foreach ($items as $item) {
        $stmt = $pdo->prepare('SELECT * FROM poles WHERE city_hall_id = ? AND pole_code = ? LIMIT 1');
        $stmt->execute([(int) ($item['cityHallId'] ?? $user['cityHallId'] ?? 0), trim((string) ($item['id'] ?? $item['poleCode'] ?? ''))]);
        $row = $stmt->fetch();
        if ($row) {
            $created[] = map_pole($row);
        }
    }

    json_response(['ok' => true, 'poles' => $created], 201);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $user = require_login();
    $data = get_json_input();
    $poleCode = trim((string) ($_GET['id'] ?? $data['id'] ?? ''));
    $cityHallId = (string) ($data['cityHallId'] ?? $_GET['cityHallId'] ?? $user['cityHallId'] ?? '');
    ensure_city_scope($user, $cityHallId);

    if (!$poleCode || !$cityHallId) {
        json_response(['ok' => false, 'error' => 'Poste invalido'], 422);
    }

    $stmt = $pdo->prepare(
        'UPDATE poles
         SET status = COALESCE(?, status),
             address = COALESCE(?, address),
             neighborhood = COALESCE(?, neighborhood),
             observations = COALESCE(?, observations),
             updated_at = CURRENT_TIMESTAMP
         WHERE city_hall_id = ? AND pole_code = ?'
    );
    $stmt->execute([
        $data['status'] ?? null,
        $data['address'] ?? null,
        $data['neighborhood'] ?? null,
        $data['observations'] ?? null,
        (int) $cityHallId,
        $poleCode,
    ]);

    $stmt = $pdo->prepare('SELECT * FROM poles WHERE city_hall_id = ? AND pole_code = ? LIMIT 1');
    $stmt->execute([(int) $cityHallId, $poleCode]);
    $row = $stmt->fetch();
    if (!$row) {
        json_response(['ok' => false, 'error' => 'Poste nao encontrado'], 404);
    }

    json_response(['ok' => true, 'pole' => map_pole($row)]);
}

if ($method === 'DELETE') {
    $user = require_login();
    $poleCode = trim((string) ($_GET['id'] ?? ''));
    $cityHallId = (string) ($_GET['cityHallId'] ?? $user['cityHallId'] ?? '');
    ensure_city_scope($user, $cityHallId);

    $stmt = $pdo->prepare('DELETE FROM poles WHERE city_hall_id = ? AND pole_code = ?');
    $stmt->execute([(int) $cityHallId, $poleCode]);
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Metodo invalido'], 405);
