<?php
/**
 * The SHARKS - Get Course Details
 * GET /api/courses/get.php?slug=course-slug
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

$slug = $_GET['slug'] ?? '';
if (empty($slug)) {
    errorResponse('Slug kursu jest wymagany');
}

$pdo = getDbConnection();
if (!$pdo) {
    errorResponse('Błąd połączenia z bazą danych', 500);
}

try {
    // Get course
    $stmt = $pdo->prepare("
        SELECT c.*, u.name as instructor_name
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.slug = ? AND c.is_published = TRUE
    ");
    $stmt->execute([$slug]);
    $course = $stmt->fetch();

    if (!$course) {
        errorResponse('Kurs nie znaleziony', 404);
    }

    // Get lessons
    $stmt = $pdo->prepare("
        SELECT id, title, description, duration_minutes, order_number, is_free_preview
        FROM lessons
        WHERE course_id = ? AND is_published = TRUE
        ORDER BY order_number
    ");
    $stmt->execute([$course['id']]);
    $lessons = $stmt->fetchAll();

    // Check if user has purchased
    $hasPurchased = false;
    $currentUser = getCurrentUser();
    if ($currentUser) {
        $stmt = $pdo->prepare("
            SELECT id FROM purchases
            WHERE user_id = ? AND course_id = ? AND payment_status = 'COMPLETED'
        ");
        $stmt->execute([$currentUser['user_id'], $course['id']]);
        $hasPurchased = (bool) $stmt->fetch();
    }

    $course['lessons'] = $lessons;
    $course['has_purchased'] = $hasPurchased;

    successResponse(['course' => $course]);

} catch (PDOException $e) {
    error_log("Get course error: " . $e->getMessage());
    errorResponse('Błąd serwera', 500);
}
