<?php
/**
 * The SHARKS - Register Endpoint
 * POST /api/auth/register.php
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
$name = trim($input['name'] ?? '');

// Validation
if (empty($email) || empty($password) || empty($name)) {
    errorResponse('Wszystkie pola są wymagane');
}

if (!isValidEmail($email)) {
    errorResponse('Nieprawidłowy format email');
}

if (strlen($password) < 6) {
    errorResponse('Hasło musi mieć minimum 6 znaków');
}

if (strlen($name) < 2) {
    errorResponse('Imię musi mieć minimum 2 znaki');
}

$pdo = getDbConnection();
if (!$pdo) {
    errorResponse('Błąd połączenia z bazą danych', 500);
}

try {
    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        errorResponse('Ten email jest już zarejestrowany');
    }

    // Check if registration is enabled
    $stmt = $pdo->prepare("SELECT value FROM settings WHERE key = 'registration_enabled'");
    $stmt->execute();
    $setting = $stmt->fetch();
    if ($setting && $setting['value'] === 'false') {
        errorResponse('Rejestracja jest tymczasowo wyłączona');
    }

    // Create user
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $verificationToken = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare("
        INSERT INTO users (email, password_hash, name, verification_token)
        VALUES (?, ?, ?, ?)
        RETURNING id
    ");
    $stmt->execute([$email, $passwordHash, $name, $verificationToken]);
    $userId = $stmt->fetchColumn();

    // Generate token
    $token = generateToken($userId, $email, 'USER');

    successResponse([
        'token' => $token,
        'user' => [
            'id' => $userId,
            'email' => $email,
            'name' => $name,
            'role' => 'USER'
        ]
    ], 'Konto utworzone pomyślnie');

} catch (PDOException $e) {
    error_log("Register error: " . $e->getMessage());
    errorResponse('Błąd serwera', 500);
}
