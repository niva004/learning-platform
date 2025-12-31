<?php
/**
 * The SHARKS - Create Purchase
 * POST /api/purchases/create.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

$currentUser = requireAuth();

$input = getJsonInput();
$courseSlug = trim($input['course_slug'] ?? '');

if (empty($courseSlug)) {
    errorResponse('Slug kursu jest wymagany');
}

$pdo = getDbConnection();
if (!$pdo) {
    errorResponse('Błąd połączenia z bazą danych', 500);
}

try {
    // Get course
    $stmt = $pdo->prepare("SELECT id, name, price, currency FROM courses WHERE slug = ? AND is_published = TRUE");
    $stmt->execute([$courseSlug]);
    $course = $stmt->fetch();

    if (!$course) {
        errorResponse('Kurs nie znaleziony', 404);
    }

    // Check if already purchased
    $stmt = $pdo->prepare("
        SELECT id, payment_status FROM purchases
        WHERE user_id = ? AND course_id = ?
    ");
    $stmt->execute([$currentUser['user_id'], $course['id']]);
    $existing = $stmt->fetch();

    if ($existing && $existing['payment_status'] === 'COMPLETED') {
        errorResponse('Ten kurs został już zakupiony');
    }

    // Create or update purchase
    $transactionId = 'TXN_' . strtoupper(bin2hex(random_bytes(8)));

    if ($existing) {
        $stmt = $pdo->prepare("
            UPDATE purchases
            SET amount = ?, payment_status = 'PENDING', transaction_id = ?
            WHERE id = ?
            RETURNING id
        ");
        $stmt->execute([$course['price'], $transactionId, $existing['id']]);
        $purchaseId = $existing['id'];
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO purchases (user_id, course_id, amount, currency, transaction_id)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id
        ");
        $stmt->execute([
            $currentUser['user_id'],
            $course['id'],
            $course['price'],
            $course['currency'],
            $transactionId
        ]);
        $purchaseId = $stmt->fetchColumn();
    }

    successResponse([
        'purchase' => [
            'id' => $purchaseId,
            'transaction_id' => $transactionId,
            'amount' => $course['price'],
            'currency' => $course['currency'],
            'course_name' => $course['name']
        ]
    ], 'Zamówienie utworzone');

} catch (PDOException $e) {
    error_log("Create purchase error: " . $e->getMessage());
    errorResponse('Błąd serwera', 500);
}
