<?php
declare(strict_types=1);

require __DIR__ . '/common.php';
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user = require_login();
    $params = [];
    $where = [];

    if (($user['role'] ?? '') !== 'ADMIN') {
        $where[] = 'c.city_hall_id = ?';
        $params[] = (int) ($user['cityHallId'] ?? 0);
    } elseif (!empty($_GET['cityHallId'])) {
        $where[] = 'c.city_hall_id = ?';
        $params[] = (int) $_GET['cityHallId'];
    }

    if (!empty($_GET['moduleId'])) {
        $where[] = 'c.module_id = ?';
        $params[] = $_GET['moduleId'];
    }

    if (!empty($_GET['status'])) {
        $where[] = 'c.status = ?';
        $params[] = $_GET['status'];
    }

    $sqlWhere = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $stmt = $pdo->prepare(
        "SELECT c.*, p.pole_code
         FROM complaints c
         LEFT JOIN poles p ON p.id = c.pole_id " . pole_active_join_clause($pdo, 'p') . "
         $sqlWhere
         ORDER BY c.created_at DESC"
    );
    $stmt->execute($params);
    json_response(['ok' => true, 'complaints' => array_map('map_complaint', $stmt->fetchAll())]);
}

if ($method === 'POST') {
    $data = get_json_input();
    $cityHallId = (int) ($data['cityHallId'] ?? 0);
    $moduleId = (string) ($data['moduleId'] ?? $data['moduleType'] ?? 'ILUMINACAO');
    $cpf = trim((string) ($data['citizenCpf'] ?? $data['cpf'] ?? ''));

    if ($cityHallId <= 0 || !$cpf) {
        json_response(['ok' => false, 'error' => 'Dados obrigatorios ausentes'], 422);
    }

    $banStmt = $pdo->prepare('SELECT id FROM banned_cpfs WHERE city_hall_id = ? AND cpf = ? AND active = 1 LIMIT 1');
    $banStmt->execute([$cityHallId, $cpf]);
    if ($banStmt->fetch()) {
        json_response(['ok' => false, 'error' => 'CPF bloqueado para envio de denuncias'], 403);
    }

    $poleId = null;
    if (!empty($data['poleId'])) {
        $poleWhere = array_merge(['city_hall_id = ?', 'pole_code = ?'], pole_active_conditions($pdo, 'poles'));
        $poleStmt = $pdo->prepare('SELECT id FROM poles WHERE ' . implode(' AND ', $poleWhere) . ' LIMIT 1');
        $poleStmt->execute([$cityHallId, (string) $data['poleId']]);
        $pole = $poleStmt->fetch();
        $poleId = $pole ? (int) $pole['id'] : null;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO complaints (
          city_hall_id, module_id, pole_id, status, occurrence_type, description,
          citizen_cpf, citizen_name, citizen_phone, latitude, longitude, photo_url
        ) VALUES (?, ?, ?, "PENDENTE", ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $cityHallId,
        $moduleId,
        $poleId,
        $data['occurrenceType'] ?? null,
        trim((string) ($data['description'] ?? $data['observations'] ?? '')),
        $cpf,
        trim((string) ($data['citizenName'] ?? $data['name'] ?? '')),
        $data['citizenPhone'] ?? $data['phone'] ?? null,
        (float) ($data['latitude'] ?? 0),
        (float) ($data['longitude'] ?? 0),
        $data['photoUrl'] ?? null,
    ]);

    $id = (int) $pdo->lastInsertId();
    $stmt = $pdo->prepare(
        'SELECT c.*, p.pole_code FROM complaints c LEFT JOIN poles p ON p.id = c.pole_id ' . pole_active_join_clause($pdo, 'p') . ' WHERE c.id = ? LIMIT 1'
    );
    $stmt->execute([$id]);
    json_response(['ok' => true, 'complaint' => map_complaint($stmt->fetch())], 201);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $user = require_login();
    $id = (int) ($_GET['id'] ?? 0);
    $data = get_json_input();
    $action = (string) ($_GET['action'] ?? $data['action'] ?? '');
    if ($id <= 0 || !in_array($action, ['approve', 'reject'], true)) {
        json_response(['ok' => false, 'error' => 'Acao invalida'], 422);
    }

    $stmt = $pdo->prepare('SELECT city_hall_id FROM complaints WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $existing = $stmt->fetch();
    if (!$existing) {
        json_response(['ok' => false, 'error' => 'Denuncia nao encontrada'], 404);
    }
    ensure_city_scope($user, (string) $existing['city_hall_id']);

    if ($action === 'approve') {
        $stmt = $pdo->prepare(
            'UPDATE complaints
             SET status = "APROVADA", secretary_observations = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?'
        );
        $stmt->execute([$data['secretaryObservations'] ?? $data['observations'] ?? null, $id]);

        $orderStmt = $pdo->prepare(
            'INSERT INTO maintenance_orders (
              city_hall_id, module_id, pole_id, complaint_id, priority, address, latitude, longitude, description
            )
            SELECT city_hall_id, module_id, pole_id, id, "media", NULL, latitude, longitude, description
            FROM complaints
            WHERE id = ?
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP'
        );
        try {
            $orderStmt->execute([$id]);
        } catch (Throwable $e) {
            error_log('Maintenance order creation skipped: ' . $e->getMessage());
        }

        $pdo->prepare(
            'UPDATE poles p
             JOIN complaints c ON c.pole_id = p.id
             SET p.status = "QUEIMADO", p.updated_at = CURRENT_TIMESTAMP
             WHERE c.id = ? AND c.pole_id IS NOT NULL' . pole_active_join_clause($pdo, 'p')
        )->execute([$id]);
    } else {
        $stmt = $pdo->prepare(
            'UPDATE complaints
             SET status = "REJEITADA", rejection_reason = ?, secretary_observations = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?'
        );
        $stmt->execute([
            $data['rejectionReason'] ?? null,
            $data['secretaryObservations'] ?? $data['observations'] ?? null,
            $id,
        ]);
    }

    $stmt = $pdo->prepare(
        'SELECT c.*, p.pole_code FROM complaints c LEFT JOIN poles p ON p.id = c.pole_id ' . pole_active_join_clause($pdo, 'p') . ' WHERE c.id = ? LIMIT 1'
    );
    $stmt->execute([$id]);
    json_response(['ok' => true, 'complaint' => map_complaint($stmt->fetch())]);
}

json_response(['ok' => false, 'error' => 'Metodo invalido'], 405);
