<?php
declare(strict_types=1);

require __DIR__ . '/common.php';
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = require_login();

if ($method === 'GET') {
    $params = [];
    $where = ['m.status <> "RESOLVIDA"'];
    if (($user['role'] ?? '') !== 'ADMIN') {
        $where[] = 'm.city_hall_id = ?';
        $params[] = (int) ($user['cityHallId'] ?? 0);
    } elseif (!empty($_GET['cityHallId'])) {
        $where[] = 'm.city_hall_id = ?';
        $params[] = (int) $_GET['cityHallId'];
    }

    if (!empty($_GET['moduleId'])) {
        $where[] = 'm.module_id = ?';
        $params[] = $_GET['moduleId'];
    }

    $stmt = $pdo->prepare(
        'SELECT m.*, p.pole_code
         FROM maintenance_orders m
         LEFT JOIN poles p ON p.id = m.pole_id
         WHERE ' . implode(' AND ', $where) . '
         ORDER BY FIELD(m.priority, "alta", "media", "baixa"), m.created_at DESC'
    );
    $stmt->execute($params);

    $items = array_map(static fn ($row) => [
        'id' => (string) $row['id'],
        'cityHallId' => (string) $row['city_hall_id'],
        'moduleId' => $row['module_id'],
        'poleId' => $row['pole_code'],
        'complaintId' => $row['complaint_id'] ? (string) $row['complaint_id'] : null,
        'status' => $row['status'],
        'priority' => $row['priority'],
        'address' => $row['address'],
        'latitude' => (float) $row['latitude'],
        'longitude' => (float) $row['longitude'],
        'description' => $row['description'],
        'createdAt' => normalize_date($row['created_at']),
        'updatedAt' => normalize_date($row['updated_at']),
    ], $stmt->fetchAll());

    json_response(['ok' => true, 'maintenanceOrders' => $items]);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $id = (int) ($_GET['id'] ?? 0);
    $data = get_json_input();
    if ($id <= 0) {
        json_response(['ok' => false, 'error' => 'ID invalido'], 422);
    }

    $stmt = $pdo->prepare('SELECT city_hall_id, pole_id FROM maintenance_orders WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $order = $stmt->fetch();
    if (!$order) {
        json_response(['ok' => false, 'error' => 'Ordem nao encontrada'], 404);
    }
    ensure_city_scope($user, (string) $order['city_hall_id']);

    $pdo->prepare(
        'UPDATE maintenance_orders
         SET status = "RESOLVIDA", resolution = ?, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?'
    )->execute([$data['resolution'] ?? null, $id]);

    if (!empty($order['pole_id'])) {
        $pdo->prepare('UPDATE poles SET status = "FUNCIONANDO", updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            ->execute([(int) $order['pole_id']]);
    }

    json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Metodo invalido'], 405);
