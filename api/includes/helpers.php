<?php
/**
 * The SHARKS - Helper Functions
 */

// CORS headers
function setCorsHeaders(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// JSON response
function jsonResponse(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Error response
function errorResponse(string $message, int $statusCode = 400): void {
    jsonResponse(['success' => false, 'error' => $message], $statusCode);
}

// Success response
function successResponse(array $data = [], string $message = ''): void {
    $response = ['success' => true];
    if ($message) {
        $response['message'] = $message;
    }
    jsonResponse(array_merge($response, $data));
}

// Get JSON input
function getJsonInput(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return $data ?? [];
}

// Validate email
function isValidEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Generate JWT token
function generateToken(int $userId, string $email, string $role): string {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'user_id' => $userId,
        'email' => $email,
        'role' => $role,
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$signature";
}

// Verify JWT token
function verifyToken(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$header, $payload, $signature] = $parts;
    $expectedSignature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));

    if ($signature !== $expectedSignature) {
        return null;
    }

    $data = json_decode(base64_decode($payload), true);
    if (!$data || $data['exp'] < time()) {
        return null;
    }

    return $data;
}

// Get current user from token
function getCurrentUser(): ?array {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
        return null;
    }
    return verifyToken($matches[1]);
}

// Require authentication
function requireAuth(): array {
    $user = getCurrentUser();
    if (!$user) {
        errorResponse('Unauthorized', 401);
    }
    return $user;
}

// Require admin role
function requireAdmin(): array {
    $user = requireAuth();
    if ($user['role'] !== 'ADMIN') {
        errorResponse('Forbidden', 403);
    }
    return $user;
}

// JWT Secret - ZMIEŃ TO!
define('JWT_SECRET', 'sharks_jwt_secret_change_this_in_production_2025');
