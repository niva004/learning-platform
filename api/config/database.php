<?php
/**
 * The SHARKS - Database Configuration
 *
 * Konfiguracja połączenia z PostgreSQL
 * Dostosuj dane do swojego hostingu (home.pl)
 */

// Dane połączenia z bazą danych
define('DB_HOST', 'localhost');          // lub adres serwera PostgreSQL na home.pl
define('DB_PORT', '5432');               // domyślny port PostgreSQL
define('DB_NAME', 'sharks_db');          // nazwa bazy danych
define('DB_USER', 'sharks_user');        // nazwa użytkownika
define('DB_PASS', 'your_password_here'); // hasło - ZMIEŃ TO!

// Opcje PDO
define('DB_CHARSET', 'utf8');

/**
 * Pobiera połączenie z bazą danych
 * @return PDO|null
 */
function getDbConnection(): ?PDO {
    static $pdo = null;

    if ($pdo === null) {
        try {
            $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            return null;
        }
    }

    return $pdo;
}

/**
 * Sprawdza połączenie z bazą danych
 * @return array
 */
function testConnection(): array {
    try {
        $pdo = getDbConnection();
        if ($pdo) {
            $stmt = $pdo->query("SELECT version()");
            $version = $stmt->fetchColumn();
            return [
                'success' => true,
                'message' => 'Połączenie z bazą danych nawiązane pomyślnie!',
                'version' => $version
            ];
        }
        return [
            'success' => false,
            'message' => 'Nie udało się połączyć z bazą danych'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Błąd połączenia: ' . $e->getMessage()
        ];
    }
}
