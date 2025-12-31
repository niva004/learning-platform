<?php
/**
 * The SHARKS - List Courses
 * GET /api/courses/list.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

$pdo = getDbConnection();
if (!$pdo) {
    errorResponse('Błąd połączenia z bazą danych', 500);
}

try {
    $level = $_GET['level'] ?? null;
    $featured = isset($_GET['featured']) ? $_GET['featured'] === 'true' : null;

    $sql = "
        SELECT c.id, c.slug, c.name, c.short_description, c.price, c.currency,
               c.level, c.duration_hours, c.lessons_count, c.thumbnail_url,
               c.is_featured, u.name as instructor_name
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.is_published = TRUE
    ";
    $params = [];

    if ($level) {
        $sql .= " AND c.level = ?";
        $params[] = strtoupper($level);
    }

    if ($featured !== null) {
        $sql .= " AND c.is_featured = ?";
        $params[] = $featured;
    }

    $sql .= " ORDER BY c.is_featured DESC, c.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $courses = $stmt->fetchAll();

    successResponse(['courses' => $courses]);

} catch (PDOException $e) {
    error_log("List courses error: " . $e->getMessage());
    errorResponse('Błąd serwera', 500);
}
