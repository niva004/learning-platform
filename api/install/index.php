<?php
/**
 * The SHARKS - Database Installation Script
 *
 * Ten skrypt tworzy strukturę bazy danych PostgreSQL.
 * Uruchom go przez przeglądarkę: https://twoja-domena.pl/api/install/
 *
 * WAŻNE: Usuń ten plik po instalacji!
 */

// Wyświetlaj błędy podczas instalacji
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Nagłówki
header('Content-Type: text/html; charset=utf-8');

// Token bezpieczeństwa - ZMIEŃ GO przed uruchomieniem!
define('INSTALL_TOKEN', 'sharks_install_2025');

// Sprawdź token
$providedToken = $_GET['token'] ?? '';
$isAuthorized = ($providedToken === INSTALL_TOKEN);

// Pobierz akcję
$action = $_GET['action'] ?? '';

?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The SHARKS - Instalacja bazy danych</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #020c1b, #0a1f35);
            min-height: 100vh;
            padding: 2rem;
            color: #e6f4ff;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(13, 31, 53, 0.9);
            border-radius: 12px;
            padding: 2rem;
            border: 1px solid #1a3a5c;
        }
        h1 {
            color: #00d4ff;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        h1::before { content: '🦈'; }
        h2 { color: #00d4ff; margin: 1.5rem 0 1rem; font-size: 1.2rem; }
        .success { background: rgba(0, 230, 118, 0.2); border: 1px solid #00e676; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        .error { background: rgba(255, 82, 82, 0.2); border: 1px solid #ff5252; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        .warning { background: rgba(255, 171, 0, 0.2); border: 1px solid #ffab00; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        .info { background: rgba(0, 212, 255, 0.1); border: 1px solid #00d4ff; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        pre {
            background: #020c1b;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 0.875rem;
            border: 1px solid #1a3a5c;
        }
        code { color: #00d4ff; }
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            color: #020c1b;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 0.5rem 0.5rem 0.5rem 0;
            border: none;
            cursor: pointer;
            font-size: 1rem;
        }
        .btn:hover { background: linear-gradient(135deg, #00b8e6, #007acc); }
        .btn-danger { background: linear-gradient(135deg, #ff5252, #d32f2f); }
        .form-group { margin: 1rem 0; }
        .form-group label { display: block; margin-bottom: 0.5rem; color: #a8c5e2; }
        .form-group input {
            width: 100%;
            padding: 0.75rem;
            background: #020c1b;
            border: 1px solid #1a3a5c;
            border-radius: 8px;
            color: #e6f4ff;
            font-size: 1rem;
        }
        .form-group input:focus { outline: none; border-color: #00d4ff; }
        ul { margin-left: 1.5rem; }
        li { margin: 0.5rem 0; }
        .step { display: flex; align-items: flex-start; gap: 1rem; margin: 1rem 0; padding: 1rem; background: rgba(0, 0, 0, 0.2); border-radius: 8px; }
        .step-number { background: #00d4ff; color: #020c1b; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>The SHARKS - Instalacja</h1>

        <?php if (!$isAuthorized): ?>
            <div class="warning">
                <strong>Autoryzacja wymagana</strong><br>
                Podaj token instalacyjny aby kontynuować.
            </div>

            <form method="GET">
                <div class="form-group">
                    <label>Token instalacyjny:</label>
                    <input type="text" name="token" placeholder="Wprowadź token...">
                </div>
                <button type="submit" class="btn">Autoryzuj</button>
            </form>

            <div class="info" style="margin-top: 2rem;">
                <strong>Domyślny token:</strong> <code>sharks_install_2025</code><br>
                <small>Zmień go w pliku <code>install/index.php</code> przed uruchomieniem na produkcji!</small>
            </div>

        <?php else: ?>

            <?php if ($action === 'test'): ?>
                <h2>Test połączenia z bazą danych</h2>
                <?php
                require_once __DIR__ . '/../config/database.php';
                $result = testConnection();
                if ($result['success']) {
                    echo '<div class="success">';
                    echo '<strong>✓ ' . htmlspecialchars($result['message']) . '</strong><br>';
                    echo 'Wersja PostgreSQL: ' . htmlspecialchars($result['version']);
                    echo '</div>';
                } else {
                    echo '<div class="error">';
                    echo '<strong>✗ ' . htmlspecialchars($result['message']) . '</strong>';
                    echo '</div>';
                }
                ?>
                <a href="?token=<?= INSTALL_TOKEN ?>" class="btn">← Powrót</a>

            <?php elseif ($action === 'install'): ?>
                <h2>Instalacja schematu bazy danych</h2>
                <?php
                require_once __DIR__ . '/../config/database.php';

                $pdo = getDbConnection();
                if (!$pdo) {
                    echo '<div class="error">Nie można połączyć się z bazą danych. Sprawdź konfigurację w config/database.php</div>';
                } else {
                    $schemaFile = __DIR__ . '/schema.sql';
                    if (!file_exists($schemaFile)) {
                        echo '<div class="error">Plik schema.sql nie istnieje!</div>';
                    } else {
                        $sql = file_get_contents($schemaFile);

                        try {
                            // Wykonaj cały schemat
                            $pdo->exec($sql);
                            echo '<div class="success">';
                            echo '<strong>✓ Schema zainstalowana pomyślnie!</strong><br><br>';
                            echo 'Utworzono tabele:<br>';
                            echo '<ul>';
                            echo '<li>users - użytkownicy</li>';
                            echo '<li>courses - kursy</li>';
                            echo '<li>lessons - lekcje</li>';
                            echo '<li>purchases - zakupy</li>';
                            echo '<li>lesson_progress - postęp nauki</li>';
                            echo '<li>settings - ustawienia</li>';
                            echo '</ul>';
                            echo '</div>';

                            echo '<div class="warning">';
                            echo '<strong>Dane logowania administratora:</strong><br>';
                            echo 'Email: <code>admin@thesharks.pl</code><br>';
                            echo 'Hasło: <code>admin123</code><br><br>';
                            echo '<strong>ZMIEŃ HASŁO PO PIERWSZYM LOGOWANIU!</strong>';
                            echo '</div>';

                            echo '<div class="error">';
                            echo '<strong>⚠️ WAŻNE: Usuń folder /api/install/ po zakończeniu instalacji!</strong>';
                            echo '</div>';

                        } catch (PDOException $e) {
                            echo '<div class="error">';
                            echo '<strong>Błąd podczas instalacji:</strong><br>';
                            echo htmlspecialchars($e->getMessage());
                            echo '</div>';
                        }
                    }
                }
                ?>
                <a href="?token=<?= INSTALL_TOKEN ?>" class="btn">← Powrót</a>

            <?php elseif ($action === 'drop'): ?>
                <h2>Usuwanie tabel</h2>
                <?php
                if (isset($_GET['confirm']) && $_GET['confirm'] === 'yes'):
                    require_once __DIR__ . '/../config/database.php';
                    $pdo = getDbConnection();
                    if ($pdo) {
                        try {
                            $pdo->exec("DROP TABLE IF EXISTS lesson_progress CASCADE");
                            $pdo->exec("DROP TABLE IF EXISTS purchases CASCADE");
                            $pdo->exec("DROP TABLE IF EXISTS lessons CASCADE");
                            $pdo->exec("DROP TABLE IF EXISTS courses CASCADE");
                            $pdo->exec("DROP TABLE IF EXISTS users CASCADE");
                            $pdo->exec("DROP TABLE IF EXISTS settings CASCADE");
                            $pdo->exec("DROP FUNCTION IF EXISTS update_updated_at_column CASCADE");
                            echo '<div class="success"><strong>✓ Wszystkie tabele zostały usunięte.</strong></div>';
                        } catch (PDOException $e) {
                            echo '<div class="error">Błąd: ' . htmlspecialchars($e->getMessage()) . '</div>';
                        }
                    }
                ?>
                    <a href="?token=<?= INSTALL_TOKEN ?>" class="btn">← Powrót</a>
                <?php else: ?>
                    <div class="error">
                        <strong>⚠️ UWAGA!</strong><br>
                        Ta operacja usunie WSZYSTKIE dane z bazy danych!<br>
                        Czy na pewno chcesz kontynuować?
                    </div>
                    <a href="?token=<?= INSTALL_TOKEN ?>&action=drop&confirm=yes" class="btn btn-danger">Tak, usuń wszystko</a>
                    <a href="?token=<?= INSTALL_TOKEN ?>" class="btn">Anuluj</a>
                <?php endif; ?>

            <?php else: ?>
                <!-- Menu główne -->
                <div class="info">
                    <strong>Witaj w instalatorze The SHARKS!</strong><br>
                    Ten skrypt pomoże Ci skonfigurować bazę danych PostgreSQL.
                </div>

                <h2>Konfiguracja</h2>
                <p>Przed instalacją upewnij się, że skonfigurowałeś plik:</p>
                <pre><code>/api/config/database.php</code></pre>

                <div class="step">
                    <div class="step-number">1</div>
                    <div>
                        <strong>Edytuj dane połączenia:</strong>
                        <pre><code>define('DB_HOST', 'localhost');
define('DB_PORT', '5432');
define('DB_NAME', 'sharks_db');
define('DB_USER', 'sharks_user');
define('DB_PASS', 'twoje_haslo');</code></pre>
                    </div>
                </div>

                <h2>Akcje</h2>

                <div class="step">
                    <div class="step-number">2</div>
                    <div>
                        <strong>Test połączenia</strong><br>
                        Sprawdź czy połączenie z bazą danych działa.<br>
                        <a href="?token=<?= INSTALL_TOKEN ?>&action=test" class="btn">Testuj połączenie</a>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">3</div>
                    <div>
                        <strong>Instaluj schema</strong><br>
                        Utwórz tabele i dodaj dane początkowe.<br>
                        <a href="?token=<?= INSTALL_TOKEN ?>&action=install" class="btn">Instaluj bazę danych</a>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">!</div>
                    <div>
                        <strong>Resetuj bazę (niebezpieczne)</strong><br>
                        Usuń wszystkie tabele i dane.<br>
                        <a href="?token=<?= INSTALL_TOKEN ?>&action=drop" class="btn btn-danger">Usuń tabele</a>
                    </div>
                </div>

                <h2>Po instalacji</h2>
                <div class="warning">
                    <strong>WAŻNE:</strong>
                    <ul>
                        <li>Zmień hasło administratora</li>
                        <li>Usuń folder <code>/api/install/</code></li>
                        <li>Zmień token instalacyjny lub usuń ten plik</li>
                    </ul>
                </div>
            <?php endif; ?>

        <?php endif; ?>
    </div>
</body>
</html>
