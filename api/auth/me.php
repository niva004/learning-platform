<?php
/**
 * The SHARKS - Get Current User
 * GET /api/auth/me.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

$currentUser = requireAuth();

$pdo = getDbConnection();
if (!$pdo) {
    errorResponse('Błąd połączenia z bazą danych', 500);
}

try {
    $stmt = $pdo->prepare("
        SELECT id, email, name, role, is_active, email_verified, last_login, created_at
        FROM users WHERE id = ?
    ");
    $stmt->execute([$currentUser['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        errorResponse('Użytkownik nie znaleziony', 404);
    }

    successResponse(['user' => $user]);

} catch (PDOException $e) {
    error_log("Get user error: " . $e->getMessage());
    errorResponse('Błąd serwera', 500);
}
