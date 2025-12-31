<?php
/**
 * The SHARKS - Confirm Purchase (simulate payment)
 * POST /api/purchases/confirm.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

$currentUser = requireAuth();

$input = getJsonInput();
$transactionId = trim($input['transaction_id'] ?? '');

if (empty($transactionId)) {
    errorResponse('Transaction ID jest wymagany');
}

$pdo = getDbConnection();
if (!$pdo) {
    errorResponse('Błąd połączenia z bazą danych', 500);
}

try {
    // Get purchase
    $stmt = $pdo->prepare("
        SELECT p.*, c.name as course_name
        FROM purchases p
        JOIN courses c ON p.course_id = c.id
        WHERE p.transaction_id = ? AND p.user_id = ?
    ");
    $stmt->execute([$transactionId, $currentUser['user_id']]);
    $purchase = $stmt->fetch();

    if (!$purchase) {
        errorResponse('Zamówienie nie znalezione', 404);
    }

    if ($purchase['payment_status'] === 'COMPLETED') {
        errorResponse('To zamówienie zostało już opłacone');
    }

    // Simulate payment confirmation
    $stmt = $pdo->prepare("
        UPDATE purchases
        SET payment_status = 'COMPLETED', payment_method = 'SIMULATED'
        WHERE id = ?
    ");
    $stmt->execute([$purchase['id']]);

    successResponse([
        'purchase' => [
            'id' => $purchase['id'],
            'course_name' => $purchase['course_name'],
            'amount' => $purchase['amount'],
            'currency' => $purchase['currency'],
            'status' => 'COMPLETED'
        ]
    ], 'Płatność potwierdzona! Kurs odblokowany.');

} catch (PDOException $e) {
    error_log("Confirm purchase error: " . $e->getMessage());
    errorResponse('Błąd serwera', 500);
}
