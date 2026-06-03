<?php
declare(strict_types=1);

require __DIR__ . '/common.php';
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sessionUser = $_SESSION['user'] ?? null;
    if (!$sessionUser || empty($sessionUser['id'])) {
        json_response(['authenticated' => false, 'user' => null]);
    }

    $user = fetch_user_payload($pdo, (int) $sessionUser['id']);
    if (!$user) {
        unset($_SESSION['user']);
        json_response(['authenticated' => false, 'user' => null]);
    }

    $_SESSION['user'] = $user;
    json_response(['authenticated' => true, 'user' => $user]);
}

if ($method === 'POST') {
    $data = get_json_input();
    $email = trim((string) ($data['email'] ?? ''));
    $password = (string) ($data['password'] ?? '');

    $stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = ? AND active = 1 LIMIT 1');
    $stmt->execute([$email]);
    $row = $stmt->fetch();

    if (!$row || !password_verify($password, $row['password_hash'])) {
        json_response(['ok' => false, 'error' => 'Credenciais invalidas'], 401);
    }

    $user = fetch_user_payload($pdo, (int) $row['id']);
    if (!$user) {
        json_response(['ok' => false, 'error' => 'Usuario indisponivel'], 403);
    }

    session_regenerate_id(true);
    $_SESSION['user'] = $user;
    json_response(['ok' => true, 'user' => $user]);
}

if ($method === 'DELETE') {
    $_SESSION = [];
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Metodo invalido'], 405);
