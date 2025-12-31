<?php
/**
 * The SHARKS - Login Endpoint
 * POST /api/auth/login.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

$input = getJsonInput();
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Validation
if (empty($email) || empty($password)) {
    errorResponse('Email i hasło są wymagane');
}

if (!isValidEmail($email)) {
    errorResponse('Nieprawidłowy format email');
}

$pdo = getDbConnection();
if (!$pdo) {
    errorResponse('Błąd połączenia z bazą danych', 500);
}

try {
    $stmt = $pdo->prepare("SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        errorResponse('Nieprawidłowy email lub hasło', 401);
    }

    if (!$user['is_active']) {
        errorResponse('Konto zostało dezaktywowane', 403);
    }

    if (!password_verify($password, $user['password_hash'])) {
        errorResponse('Nieprawidłowy email lub hasło', 401);
    }

    // Update last login
    $stmt = $pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$user['id']]);

    // Generate token
    $token = generateToken($user['id'], $user['email'], $user['role']);

    successResponse([
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role']
        ]
    ], 'Zalogowano pomyślnie');

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    errorResponse('Błąd serwera', 500);
}
