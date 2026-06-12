<?php
declare(strict_types=1);

require __DIR__ . '/common.php';
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = require_login();

if (!current_user_can_manage_users($user)) {
    json_response(['ok' => false, 'error' => 'Sem permissao para gerenciar usuarios'], 403);
}

if ($method === 'GET') {
    $params = [];
    $where = 'WHERE active = 1';
    if (($user['role'] ?? '') !== 'ADMIN') {
        $where .= ' AND city_hall_id = ?';
        $params[] = (int) ($user['cityHallId'] ?? 0);
    }

    $stmt = $pdo->prepare("SELECT id FROM users $where ORDER BY name");
    $stmt->execute($params);
    $items = [];
    foreach ($stmt->fetchAll() as $row) {
        $payload = fetch_user_payload($pdo, (int) $row['id']);
        if ($payload) {
            $items[] = $payload;
        }
    }

    json_response(['ok' => true, 'users' => $items]);
}

if ($method === 'POST') {
    $data = get_json_input();
    $cityHallId = (string) ($data['cityHallId'] ?? $user['cityHallId'] ?? '');
    ensure_city_scope($user, $cityHallId);

    $password = (string) ($data['password'] ?? '');
    if (strlen($password) < 6) {
        json_response(['ok' => false, 'error' => 'Senha deve ter pelo menos 6 caracteres'], 422);
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO users (city_hall_id, name, email, password_hash, role, cpf, active)
             VALUES (?, ?, ?, ?, ?, ?, 1)'
        );
        $stmt->execute([
            $cityHallId !== '' ? (int) $cityHallId : null,
            trim((string) ($data['name'] ?? '')),
            strtolower(trim((string) ($data['email'] ?? ''))),
            password_hash($password, PASSWORD_DEFAULT),
            $data['role'] ?? 'FIELD_LIGHTING',
            $data['cpf'] ?? null,
        ]);
        $id = (int) $pdo->lastInsertId();
        set_user_permissions($pdo, $id, $data['permissions'] ?? []);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Create user error: ' . $e->getMessage());
        json_response(['ok' => false, 'error' => 'Nao foi possivel criar usuario'], 500);
    }

    json_response(['ok' => true, 'user' => fetch_user_payload($pdo, $id)], 201);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        json_response(['ok' => false, 'error' => 'ID invalido'], 422);
    }

    $existing = fetch_user_payload($pdo, $id);
    if (!$existing) {
        json_response(['ok' => false, 'error' => 'Usuario nao encontrado'], 404);
    }
    ensure_city_scope($user, $existing['cityHallId'] ?? null);

    $data = get_json_input();
    $stmt = $pdo->prepare(
        'UPDATE users
         SET name = COALESCE(?, name),
             email = COALESCE(?, email),
             role = COALESCE(?, role),
             cpf = COALESCE(?, cpf)
         WHERE id = ?'
    );
    $stmt->execute([
        isset($data['name']) ? trim((string) $data['name']) : null,
        isset($data['email']) ? strtolower(trim((string) $data['email'])) : null,
        $data['role'] ?? null,
        $data['cpf'] ?? null,
        $id,
    ]);

    if (!empty($data['password'])) {
        if (strlen((string) $data['password']) < 6) {
            json_response(['ok' => false, 'error' => 'Senha deve ter pelo menos 6 caracteres'], 422);
        }
        $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
            ->execute([password_hash((string) $data['password'], PASSWORD_DEFAULT), $id]);
    }

    if (isset($data['permissions']) && is_array($data['permissions'])) {
        set_user_permissions($pdo, $id, $data['permissions']);
    }

    json_response(['ok' => true, 'user' => fetch_user_payload($pdo, $id)]);
}

if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    $existing = $id > 0 ? fetch_user_payload($pdo, $id) : null;
    if (!$existing) {
        json_response(['ok' => false, 'error' => 'Usuario nao encontrado'], 404);
    }
    ensure_city_scope($user, $existing['cityHallId'] ?? null);

    $pdo->prepare('UPDATE users SET active = 0 WHERE id = ?')->execute([$id]);
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Metodo invalido'], 405);
