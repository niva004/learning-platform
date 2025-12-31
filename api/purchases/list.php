<?php
/**
 * The SHARKS - List User Purchases
 * GET /api/purchases/list.php
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
        SELECT p.id, p.amount, p.currency, p.payment_status, p.created_at,
               c.id as course_id, c.slug as course_slug, c.name as course_name,
               c.thumbnail_url, c.lessons_count
        FROM purchases p
        JOIN courses c ON p.course_id = c.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    ");
    $stmt->execute([$currentUser['user_id']]);
    $purchases = $stmt->fetchAll();

    // Get progress for each course
    foreach ($purchases as &$purchase) {
        if ($purchase['payment_status'] === 'COMPLETED') {
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as completed
                FROM lesson_progress lp
                JOIN lessons l ON lp.lesson_id = l.id
                WHERE lp.user_id = ? AND l.course_id = ? AND lp.is_completed = TRUE
            ");
            $stmt->execute([$currentUser['user_id'], $purchase['course_id']]);
            $progress = $stmt->fetch();
            $purchase['completed_lessons'] = (int) $progress['completed'];
        }
    }

    successResponse(['purchases' => $purchases]);

} catch (PDOException $e) {
    error_log("List purchases error: " . $e->getMessage());
    errorResponse('Błąd serwera', 500);
}
