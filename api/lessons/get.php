<?php
/**
 * The SHARKS - Get Lesson Content
 * GET /api/lessons/get.php?id=1
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

$lessonId = (int) ($_GET['id'] ?? 0);
if (!$lessonId) {
    errorResponse('ID lekcji jest wymagane');
}

$pdo = getDbConnection();
if (!$pdo) {
    errorResponse('Błąd połączenia z bazą danych', 500);
}

try {
    // Get lesson with course info
    $stmt = $pdo->prepare("
        SELECT l.*, c.id as course_id, c.slug as course_slug, c.name as course_name
        FROM lessons l
        JOIN courses c ON l.course_id = c.id
        WHERE l.id = ? AND l.is_published = TRUE AND c.is_published = TRUE
    ");
    $stmt->execute([$lessonId]);
    $lesson = $stmt->fetch();

    if (!$lesson) {
        errorResponse('Lekcja nie znaleziona', 404);
    }

    // Check access
    $hasAccess = $lesson['is_free_preview'];
    $currentUser = getCurrentUser();

    if (!$hasAccess && $currentUser) {
        $stmt = $pdo->prepare("
            SELECT id FROM purchases
            WHERE user_id = ? AND course_id = ? AND payment_status = 'COMPLETED'
        ");
        $stmt->execute([$currentUser['user_id'], $lesson['course_id']]);
        $hasAccess = (bool) $stmt->fetch();
    }

    if (!$hasAccess) {
        // Return limited info
        successResponse([
            'lesson' => [
                'id' => $lesson['id'],
                'title' => $lesson['title'],
                'description' => $lesson['description'],
                'duration_minutes' => $lesson['duration_minutes'],
                'is_free_preview' => $lesson['is_free_preview'],
                'course_slug' => $lesson['course_slug'],
                'course_name' => $lesson['course_name']
            ],
            'has_access' => false
        ]);
    }

    // Get progress if user is logged in
    $progress = null;
    if ($currentUser) {
        $stmt = $pdo->prepare("
            SELECT is_completed, progress_percent, last_position_seconds
            FROM lesson_progress
            WHERE user_id = ? AND lesson_id = ?
        ");
        $stmt->execute([$currentUser['user_id'], $lessonId]);
        $progress = $stmt->fetch();
    }

    $lesson['progress'] = $progress;

    successResponse([
        'lesson' => $lesson,
        'has_access' => true
    ]);

} catch (PDOException $e) {
    error_log("Get lesson error: " . $e->getMessage());
    errorResponse('Błąd serwera', 500);
}
