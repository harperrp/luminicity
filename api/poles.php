<?php
declare(strict_types=1);

require __DIR__ . '/common.php';
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

function normalize_pole_status($status): string {
    return in_array($status, ['FUNCIONANDO', 'QUEIMADO'], true) ? $status : 'FUNCIONANDO';
}

if ($method === 'GET') {
    $isPublicRequest = ($_GET['public'] ?? '') === '1';
    $user = $isPublicRequest ? null : require_login();
    $params = [];
    $where = pole_active_conditions($pdo, 'poles');

    if ($isPublicRequest) {
        $cityHallId = (int) ($_GET['cityHallId'] ?? 0);
        if ($cityHallId <= 0) {
            json_response(['ok' => false, 'error' => 'Prefeitura obrigatoria'], 422);
        }
        $where[] = 'city_hall_id = ?';
        $params[] = $cityHallId;
    } elseif (($user['role'] ?? '') !== 'ADMIN') {
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
        $columns = 'city_hall_id, pole_code, latitude, longitude, status, neighborhood, address, observations';
        $values = '?, ?, ?, ?, ?, ?, ?, ?';
        $updates = [
            'latitude = VALUES(latitude)',
            'longitude = VALUES(longitude)',
            'status = VALUES(status)',
            'neighborhood = VALUES(neighborhood)',
            'address = VALUES(address)',
            'observations = VALUES(observations)',
        ];

        if (db_column_exists($pdo, 'poles', 'active')) {
            $columns .= ', active';
            $values .= ', 1';
            $updates[] = 'active = 1';
        }

        if (db_column_exists($pdo, 'poles', 'deleted_at')) {
            $columns .= ', deleted_at';
            $values .= ', NULL';
            $updates[] = 'deleted_at = NULL';
        }

        $stmt = $pdo->prepare(
            "INSERT INTO poles ($columns)
             VALUES ($values)
             ON DUPLICATE KEY UPDATE " . implode(', ', $updates)
        );

        foreach ($items as $item) {
            $cityHallId = (string) ($item['cityHallId'] ?? $user['cityHallId'] ?? '');
            ensure_city_scope($user, $cityHallId);

            $stmt->execute([
                (int) $cityHallId,
                trim((string) ($item['id'] ?? $item['poleCode'] ?? '')),
                (float) ($item['latitude'] ?? 0),
                (float) ($item['longitude'] ?? 0),
                normalize_pole_status($item['status'] ?? 'FUNCIONANDO'),
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
        $where = array_merge(['city_hall_id = ?', 'pole_code = ?'], pole_active_conditions($pdo, 'poles'));
        $stmt = $pdo->prepare('SELECT * FROM poles WHERE ' . implode(' AND ', $where) . ' LIMIT 1');
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

    $where = array_merge(['city_hall_id = ?', 'pole_code = ?'], pole_active_conditions($pdo, 'poles'));
    $stmt = $pdo->prepare(
        'UPDATE poles
         SET status = COALESCE(?, status),
             address = COALESCE(?, address),
             neighborhood = COALESCE(?, neighborhood),
             observations = COALESCE(?, observations),
             updated_at = CURRENT_TIMESTAMP
         WHERE ' . implode(' AND ', $where)
    );
    $stmt->execute([
        isset($data['status']) ? normalize_pole_status($data['status']) : null,
        $data['address'] ?? null,
        $data['neighborhood'] ?? null,
        $data['observations'] ?? null,
        (int) $cityHallId,
        $poleCode,
    ]);

    $stmt = $pdo->prepare('SELECT * FROM poles WHERE ' . implode(' AND ', $where) . ' LIMIT 1');
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

    if (!$poleCode || !$cityHallId) {
        json_response(['ok' => false, 'error' => 'Poste invalido'], 422);
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT id FROM poles WHERE city_hall_id = ? AND pole_code = ? LIMIT 1');
        $stmt->execute([(int) $cityHallId, $poleCode]);
        $pole = $stmt->fetch();

        if ($pole) {
            $pdo->prepare(
                'UPDATE maintenance_orders
                 SET status = "RESOLVIDA",
                     resolution = COALESCE(resolution, "Poste removido do cadastro"),
                     resolved_at = COALESCE(resolved_at, CURRENT_TIMESTAMP),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE pole_id = ? AND status <> "RESOLVIDA"'
            )->execute([(int) $pole['id']]);

            if (db_column_exists($pdo, 'poles', 'active') || db_column_exists($pdo, 'poles', 'deleted_at')) {
                $sets = ['updated_at = CURRENT_TIMESTAMP'];
                if (db_column_exists($pdo, 'poles', 'active')) {
                    $sets[] = 'active = 0';
                }
                if (db_column_exists($pdo, 'poles', 'deleted_at')) {
                    $sets[] = 'deleted_at = CURRENT_TIMESTAMP';
                }

                $stmt = $pdo->prepare(
                    'UPDATE poles SET ' . implode(', ', $sets) . ' WHERE city_hall_id = ? AND pole_code = ?'
                );
                $stmt->execute([(int) $cityHallId, $poleCode]);
            } else {
                $stmt = $pdo->prepare('DELETE FROM poles WHERE city_hall_id = ? AND pole_code = ?');
                $stmt->execute([(int) $cityHallId, $poleCode]);
            }
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Delete pole error: ' . $e->getMessage());
        json_response(['ok' => false, 'error' => 'Nao foi possivel remover o poste'], 500);
    }

    json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Metodo invalido'], 405);
