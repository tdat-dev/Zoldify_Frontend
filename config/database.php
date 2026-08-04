<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

return [
	'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
	'username' => $_ENV['DB_USERNAME' ] ?? 'root',
	'password' => $_ENV['DB_PASSWORD'] ?? '',
	'db_name' => $_ENV['DB_DATABASE'] ?? '',
];