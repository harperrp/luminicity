<?php
declare(strict_types=1);

if (!isset($config) || !is_array($config)) {
    $configFile = __DIR__ . '/config.php';
    $exampleConfigFile = __DIR__ . '/config.example.php';
    $config = file_exists($configFile) ? require $configFile : require $exampleConfigFile;
}

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
    $config['db_host'],
    $config['db_port'],
    $config['db_name']
);

try {
    $pdo = new PDO(
        $dsn,
        $config['db_user'],
        $config['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (Throwable $e) {
    error_log('Luminicity database connection error: ' . $e->getMessage());
    json_response(['ok' => false, 'error' => 'Falha temporaria na conexao com banco'], 500);
}
