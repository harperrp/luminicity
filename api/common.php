<?php
declare(strict_types=1);

$configFile = __DIR__ . '/config.php';
$exampleConfigFile = __DIR__ . '/config.example.php';
$config = file_exists($configFile) ? require $configFile : require $exampleConfigFile;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    $allowedOrigins = $config['allowed_origins'] ?? [];
    $originHost = parse_url($origin, PHP_URL_HOST);
    $requestHost = explode(':', $_SERVER['HTTP_HOST'] ?? '')[0];
    $sameHost = $originHost && $requestHost && strcasecmp($originHost, $requestHost) === 0;

    if ($sameHost || in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    session_name($config['session_name'] ?? 'luminicity_admin');
    ini_set('session.use_strict_mode', '1');
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    } else {
        session_set_cookie_params(0, '/', '', $secure, true);
    }
    session_start();
}

function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function get_json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function current_user(): ?array {
    return !empty($_SESSION['user']) && is_array($_SESSION['user']) ? $_SESSION['user'] : null;
}

function require_login(): array {
    $user = current_user();
    if ($user === null) {
        json_response(['ok' => false, 'error' => 'Nao autenticado'], 401);
    }
    return $user;
}

function require_roles(array $roles): array {
    $user = require_login();
    if (!in_array($user['role'] ?? '', $roles, true)) {
        json_response(['ok' => false, 'error' => 'Sem permissao para esta acao'], 403);
    }
    return $user;
}

function current_user_can_manage_users(array $user): bool {
    return in_array($user['role'] ?? '', ['ADMIN', 'CITY_HALL_ADMIN'], true);
}

function current_user_can_manage_city_halls(array $user): bool {
    return ($user['role'] ?? '') === 'ADMIN';
}

function ensure_city_scope(array $user, ?string $cityHallId): void {
    if (($user['role'] ?? '') === 'ADMIN') {
        return;
    }

    $userCityHallId = isset($user['cityHallId']) ? (string) $user['cityHallId'] : null;
    if (!$userCityHallId || !$cityHallId || $userCityHallId !== (string) $cityHallId) {
        json_response(['ok' => false, 'error' => 'Registro fora da prefeitura do usuario'], 403);
    }
}

function normalize_bool($value): bool {
    return (bool) (int) $value;
}

function normalize_date($value): ?string {
    return $value ? date(DATE_ATOM, strtotime((string) $value)) : null;
}

function map_permission_row(?array $row, array $modules): array {
    return [
        'modules' => $modules,
        'canApproveComplaints' => $row ? normalize_bool($row['can_approve_complaints']) : false,
        'canManageMaintenance' => $row ? normalize_bool($row['can_manage_maintenance']) : false,
        'canManageUsers' => $row ? normalize_bool($row['can_manage_users']) : false,
        'canManageCityHalls' => $row ? normalize_bool($row['can_manage_city_halls']) : false,
        'canViewReports' => $row ? normalize_bool($row['can_view_reports']) : false,
        'fieldOnly' => $row ? normalize_bool($row['field_only']) : false,
    ];
}

function fetch_user_payload(PDO $pdo, int $userId): ?array {
    $stmt = $pdo->prepare('SELECT id, city_hall_id, name, email, role, cpf, created_at FROM users WHERE id = ? AND active = 1 LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) {
        return null;
    }

    $permStmt = $pdo->prepare('SELECT * FROM user_permissions WHERE user_id = ? LIMIT 1');
    $permStmt->execute([$userId]);
    $permissions = $permStmt->fetch() ?: null;

    $moduleStmt = $pdo->prepare('SELECT module_id FROM user_permission_modules WHERE user_id = ? ORDER BY module_id');
    $moduleStmt->execute([$userId]);
    $modules = array_map(static fn ($row) => $row['module_id'], $moduleStmt->fetchAll());

    return [
        'id' => (string) $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'cpf' => $user['cpf'],
        'cityHallId' => $user['city_hall_id'] !== null ? (string) $user['city_hall_id'] : null,
        'createdAt' => normalize_date($user['created_at']),
        'permissions' => map_permission_row($permissions, $modules),
    ];
}

function set_user_permissions(PDO $pdo, int $userId, array $permissions): void {
    $modules = $permissions['modules'] ?? [];
    if (!is_array($modules)) {
        $modules = [];
    }

    $stmt = $pdo->prepare(
        'INSERT INTO user_permissions (
          user_id, can_approve_complaints, can_manage_maintenance, can_manage_users,
          can_manage_city_halls, can_view_reports, field_only
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          can_approve_complaints = VALUES(can_approve_complaints),
          can_manage_maintenance = VALUES(can_manage_maintenance),
          can_manage_users = VALUES(can_manage_users),
          can_manage_city_halls = VALUES(can_manage_city_halls),
          can_view_reports = VALUES(can_view_reports),
          field_only = VALUES(field_only)'
    );
    $stmt->execute([
        $userId,
        !empty($permissions['canApproveComplaints']) ? 1 : 0,
        !empty($permissions['canManageMaintenance']) ? 1 : 0,
        !empty($permissions['canManageUsers']) ? 1 : 0,
        !empty($permissions['canManageCityHalls']) ? 1 : 0,
        !empty($permissions['canViewReports']) ? 1 : 0,
        !empty($permissions['fieldOnly']) ? 1 : 0,
    ]);

    $pdo->prepare('DELETE FROM user_permission_modules WHERE user_id = ?')->execute([$userId]);
    $insert = $pdo->prepare('INSERT INTO user_permission_modules (user_id, module_id) VALUES (?, ?)');
    foreach ($modules as $moduleId) {
        $insert->execute([$userId, $moduleId]);
    }
}

function map_city_hall(array $row): array {
    return [
        'id' => (string) $row['id'],
        'name' => $row['name'],
        'city' => $row['city'],
        'state' => $row['state'],
        'cnpj' => $row['cnpj'],
        'status' => $row['status'],
        'planId' => $row['plan_id'],
        'poleLimit' => (int) $row['pole_limit'],
        'latitude' => (float) $row['latitude'],
        'longitude' => (float) $row['longitude'],
        'usersCount' => (int) ($row['users_count'] ?? 0),
        'polesCount' => (int) ($row['poles_count'] ?? 0),
        'createdAt' => normalize_date($row['created_at']),
    ];
}

function map_pole(array $row): array {
    return [
        'id' => $row['pole_code'],
        'databaseId' => (string) $row['id'],
        'cityHallId' => (string) $row['city_hall_id'],
        'latitude' => (float) $row['latitude'],
        'longitude' => (float) $row['longitude'],
        'status' => $row['status'],
        'neighborhood' => $row['neighborhood'],
        'address' => $row['address'],
        'observations' => $row['observations'],
        'createdAt' => normalize_date($row['created_at']),
        'updatedAt' => normalize_date($row['updated_at']),
    ];
}

function map_complaint(array $row): array {
    return [
        'id' => (string) $row['id'],
        'moduleId' => $row['module_id'],
        'poleId' => $row['pole_code'],
        'cityHallId' => (string) $row['city_hall_id'],
        'latitude' => (float) $row['latitude'],
        'longitude' => (float) $row['longitude'],
        'description' => $row['description'],
        'photoUrl' => $row['photo_url'],
        'status' => $row['status'],
        'occurrenceType' => $row['occurrence_type'],
        'rejectionReason' => $row['rejection_reason'],
        'secretaryObservations' => $row['secretary_observations'],
        'citizenCpf' => $row['citizen_cpf'],
        'citizenName' => $row['citizen_name'],
        'citizenPhone' => $row['citizen_phone'],
        'createdAt' => normalize_date($row['created_at']),
        'updatedAt' => normalize_date($row['updated_at']),
    ];
}
