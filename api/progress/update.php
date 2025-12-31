<?php
/**
 * The SHARKS - Update Lesson Progress
 * POST /api/progress/update.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

$currentUser = requireAuth();

$input = getJsonInput();
$lessonId = (int) ($input['lesson_id'] ?? 0);
$progressPercent = (int) ($input['progress_percent'] ?? 0);
$lastPosition = (int) ($input['last_position_seconds'] ?? 0);
$isCompleted = (bool) ($input['is_completed'] ?? false);

if (!$lessonId) {
    errorResponse('ID lekcji jest wymagane');
}

$progressPercent = max(0, min(100, $progressPercent));

$pdo = getDbConnection();
if (!$pdo) {
    errorResponse('Błąd połączenia z bazą danych', 500);
}

try {
    // Verify lesson exists and user has access
    $stmt = $pdo->prepare("
        SELECT l.id, l.course_id
        FROM lessons l
        JOIN purchases p ON p.course_id = l.course_id
        WHERE l.id = ? AND p.user_id = ? AND p.payment_status = 'COMPLETED'
    ");
    $stmt->execute([$lessonId, $currentUser['user_id']]);
    $lesson = $stmt->fetch();

    if (!$lesson) {
        errorResponse('Brak dostępu do tej lekcji', 403);
    }

    // Upsert progress
    $stmt = $pdo->prepare("
        INSERT INTO lesson_progress (user_id, lesson_id, progress_percent, last_position_seconds, is_completed, completed_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET
            progress_percent = GREATEST(lesson_progress.progress_percent, EXCLUDED.progress_percent),
            last_position_seconds = EXCLUDED.last_position_seconds,
            is_completed = lesson_progress.is_completed OR EXCLUDED.is_completed,
            completed_at = CASE
                WHEN NOT lesson_progress.is_completed AND EXCLUDED.is_completed THEN CURRENT_TIMESTAMP
                ELSE lesson_progress.completed_at
            END
    ");

    $completedAt = $isCompleted ? date('Y-m-d H:i:s') : null;
    $stmt->execute([
        $currentUser['user_id'],
        $lessonId,
        $progressPercent,
        $lastPosition,
        $isCompleted,
        $completedAt
    ]);

    successResponse([], 'Postęp zapisany');

} catch (PDOException $e) {
    error_log("Update progress error: " . $e->getMessage());
    errorResponse('Błąd serwera', 500);
}
