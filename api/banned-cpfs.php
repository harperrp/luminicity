<?php
declare(strict_types=1);

require __DIR__ . '/common.php';
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = require_login();

if ($method === 'GET') {
    $params = [];
    $where = 'WHERE active = 1';
    if (($user['role'] ?? '') !== 'ADMIN') {
        $where .= ' AND city_hall_id = ?';
        $params[] = (int) ($user['cityHallId'] ?? 0);
    } elseif (!empty($_GET['cityHallId'])) {
        $where .= ' AND city_hall_id = ?';
        $params[] = (int) $_GET['cityHallId'];
    }

    $stmt = $pdo->prepare("SELECT * FROM banned_cpfs $where ORDER BY created_at DESC");
    $stmt->execute($params);
    $items = array_map(static fn ($row) => [
        'id' => (string) $row['id'],
        'cityHallId' => (string) $row['city_hall_id'],
        'cpf' => $row['cpf'],
        'name' => $row['citizen_name'],
        'reason' => $row['reason'],
        'bannedAt' => normalize_date($row['created_at']),
        'complaintsCount' => 1,
    ], $stmt->fetchAll());

    json_response(['ok' => true, 'bannedCpfs' => $items]);
}

if ($method === 'POST') {
    $data = get_json_input();
    $cityHallId = (string) ($data['cityHallId'] ?? $user['cityHallId'] ?? '');
    ensure_city_scope($user, $cityHallId);

    $stmt = $pdo->prepare(
        'INSERT INTO banned_cpfs (city_hall_id, cpf, citizen_name, reason, banned_by_user_id, active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE citizen_name = VALUES(citizen_name), reason = VALUES(reason), active = 1'
    );
    $stmt->execute([
        (int) $cityHallId,
        trim((string) ($data['cpf'] ?? '')),
        $data['name'] ?? $data['citizenName'] ?? null,
        $data['reason'] ?? 'Bloqueado pela triagem',
        (int) ($user['id'] ?? 0),
    ]);

    json_response(['ok' => true]);
}

if ($method === 'DELETE') {
    $cpf = trim((string) ($_GET['cpf'] ?? ''));
    $cityHallId = (string) ($_GET['cityHallId'] ?? $user['cityHallId'] ?? '');
    ensure_city_scope($user, $cityHallId);

    $stmt = $pdo->prepare('UPDATE banned_cpfs SET active = 0 WHERE city_hall_id = ? AND cpf = ?');
    $stmt->execute([(int) $cityHallId, $cpf]);
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Metodo invalido'], 405);
