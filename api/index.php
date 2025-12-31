<?php
/**
 * The SHARKS - API Index
 */

require_once __DIR__ . '/includes/helpers.php';

setCorsHeaders();

successResponse([
    'name' => 'The SHARKS API',
    'version' => '1.0',
    'endpoints' => [
        'auth' => [
            'POST /api/auth/login.php' => 'Login user',
            'POST /api/auth/register.php' => 'Register new user',
            'GET /api/auth/me.php' => 'Get current user (requires auth)'
        ],
        'courses' => [
            'GET /api/courses/list.php' => 'List all published courses',
            'GET /api/courses/get.php?slug=xxx' => 'Get course details with lessons'
        ],
        'lessons' => [
            'GET /api/lessons/get.php?id=xxx' => 'Get lesson content'
        ],
        'purchases' => [
            'POST /api/purchases/create.php' => 'Create purchase (requires auth)',
            'POST /api/purchases/confirm.php' => 'Confirm payment (requires auth)',
            'GET /api/purchases/list.php' => 'List user purchases (requires auth)'
        ],
        'progress' => [
            'POST /api/progress/update.php' => 'Update lesson progress (requires auth)'
        ]
    ]
]);
