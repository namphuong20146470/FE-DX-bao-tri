<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    exit("HTTP/1.1 200 OK");
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'H&ptiot2024');
define('DB_NAME', 'HOPT');

$connUser = new mysqli("localhost", "root", "H&ptiot2024", "user") or die("User DB failed: " . $connUser->connect_error);

if (isset($_GET['register']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['reg_username']) && isset($data['reg_password'])) {
        $stmt = $connUser->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $data['reg_username'], password_hash($data['reg_password'], PASSWORD_BCRYPT));
        echo $stmt->execute() ? json_encode(["success" => true, "message" => "Registration successful"]) : json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        $stmt->close();
        exit;
    }
    echo json_encode(["success" => false, "message" => "Username and password required"]);
    exit;
}

if (isset($_POST['register'])) {
    if (isset($_POST['reg_username']) && isset($_POST['reg_password'])) {
        $stmt = $connUser->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $_POST['reg_username'], password_hash($_POST['reg_password'], PASSWORD_BCRYPT));
        echo $stmt->execute() ? "<div class='alert alert-success'>Registration successful. <a href='#login'>Login here</a></div>" : "<div class='alert alert-danger'>Error: " . $stmt->error . "</div>";
        $stmt->close();
    } else {
        echo "<div class='alert alert-warning'>Username and password required.</div>";
    }
}

if (isset($_POST['login'])) {
    if (isset($_POST['login_username']) && isset($_POST['login_password'])) {
        $stmt = $connUser->prepare("SELECT password FROM users WHERE username = ?");
        $stmt->bind_param("s", $_POST['login_username']);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            $stmt->bind_result($hashed_password);
            $stmt->fetch();
            if (password_verify($_POST['login_password'], $hashed_password)) {
                $_SESSION['username'] = $_POST['login_username'];
                header("Location: index.php");
                exit;
            }
            echo "<div class='alert alert-danger'>Invalid password</div>";
        } else {
            echo "<div class='alert alert-danger'>Username not found</div>";
        }
        $stmt->close();
    } else {
        echo "<div class='alert alert-warning'>Username and password required.</div>";
    }
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME) or die("Connection failed: " . $conn->connect_error);
$conn->set_charset("utf8");

function handleDBQuery($conn, $query, $params = [], $types = '') {
    $stmt = $conn->prepare($query);
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    return $stmt->get_result();
}

$data = null;
if (isset($_GET['id'])) {
    $parts = explode('/', $_GET['id']);
    if (count($parts) === 2 && is_numeric($parts[0])) {
        $stmt = $conn->prepare("SELECT * FROM bao_tri WHERE id_thiet_bi = ? AND dia_diem = ? ORDER BY ngay_bao_tri DESC LIMIT 1");
        $stmt->bind_param("ss", $parts[0], $parts[1]);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $data = $result->fetch_assoc();
            if (isset($data['chi_phi'])) $data['chi_phi'] = number_format((float)$data['chi_phi'], 2, '.', '');
        }
        $stmt->close();
    }
}

if (isset($_GET['all_data']) || isset($_GET['latest']) || $_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json");
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME) or die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    $conn->set_charset("utf8");

    if (isset($_GET['login']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['login_username']) && isset($data['login_password'])) {
            $stmt = $connUser->prepare("SELECT password FROM users WHERE username = ?");
            $stmt->bind_param("s", $data['login_username']);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows > 0) {
                $stmt->bind_result($hashed_password);
                $stmt->fetch();
                if (password_verify($data['login_password'], $hashed_password)) {
                    $_SESSION['username'] = $data['login_username'];
                    echo json_encode(["success" => true, "message" => "Login successful"]);
                } else {
                    echo json_encode(["success" => false, "message" => "Invalid password"]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Username not found"]);
            }
            $stmt->close();
            exit;
        }
        echo json_encode(["success" => false, "message" => "Username and password required"]);
        exit;
    }

    if (isset($_GET['id'])) {
        if (!is_numeric($_GET['id'])) {
            echo json_encode(["success" => false, "message" => "Invalid ID"]);
            exit;
        }
        $stmt = $conn->prepare("SELECT id_bao_tri, id_thiet_bi, DATE_FORMAT(ngay_bao_tri, '%Y-%m-%d') AS ngay_bao_tri, loai_bao_tri, chi_phi, nhan_vien_phu_trach, mo_ta, ket_qua FROM bao_tri WHERE id_thiet_bi = ? ORDER BY ngay_bao_tri DESC LIMIT 1");
        $stmt->bind_param("s", $_GET['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->num_rows > 0 ? $result->fetch_assoc() : null;
        if ($row) $row['chi_phi'] = number_format((float)$row['chi_phi'], 2, '.', '');
        echo json_encode($row ? ["success" => true, "data" => $row] : ["success" => false, "message" => "No data found"], JSON_UNESCAPED_UNICODE);
        $stmt->close();
        $conn->close();
        exit;
    }

    if (isset($_GET['all_data'])) {
        $result = handleDBQuery($conn, "SELECT * FROM bao_tri ORDER BY ngay_bao_tri DESC");
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $row['chi_phi'] = number_format((float)$row['chi_phi'], 2, '.', '');
            $data[] = $row;
        }
        echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (isset($_GET['latest'])) {
        $result = handleDBQuery($conn, "SELECT id_bao_tri, id_thiet_bi, DATE_FORMAT(ngay_bao_tri, '%Y-%m-%d') AS ngay_bao_tri, loai_bao_tri, chi_phi, nhan_vien_phu_trach, mo_ta, ket_qua FROM bao_tri ORDER BY ngay_bao_tri DESC LIMIT 1");
        $data = $result->fetch_assoc();
        if ($data) $data['chi_phi'] = number_format((float)$data['chi_phi'], 2, '.', '');
        echo json_encode($data ? ["success" => true, "data" => $data] : ["success" => false, "message" => "No data found"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && !isset($_GET['update']) && !isset($_GET['delete'])) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$conn->query("SHOW COLUMNS FROM bao_tri LIKE 'khach_hang'")->num_rows) $conn->query("ALTER TABLE bao_tri ADD COLUMN khach_hang VARCHAR(255)");
        if (!$conn->query("SHOW COLUMNS FROM bao_tri LIKE 'dia_diem'")->num_rows) $conn->query("ALTER TABLE bao_tri ADD COLUMN dia_diem VARCHAR(255)");

        if (isset($data[0]) && is_array($data)) {
            $conn->begin_transaction();
            $stmt = $conn->prepare("INSERT INTO bao_tri (id_thiet_bi, ngay_bao_tri, loai_bao_tri, khach_hang, dia_diem, nhan_vien_phu_trach, mo_ta, ket_qua) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $results = ['success' => 0, 'failed' => 0, 'errors' => []];
            foreach ($data as $i => $r) {
                $stmt->bind_param("ssssssss", $r['id_thiet_bi'], $r['ngay_bao_tri'], $r['loai_bao_tri'], $r['khach_hang'], $r['dia_diem'], $r['nhan_vien_phu_trach'], $r['mo_ta'], $r['ket_qua']);
                $stmt->execute() ? $results['success']++ : $results['failed']++ && $results['errors'][] = "Row " . ($i + 1) . ": " . $stmt->error;
            }
            if ($results['failed']) {
                $conn->rollback();
                echo json_encode(["success" => false, "message" => "Import failed", "details" => $results]);
            } else {
                $conn->commit();
                echo json_encode(["success" => true, "message" => "Imported " . $results['success'] . " records"]);
            }
            $stmt->close();
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO bao_tri (id_thiet_bi, ngay_bao_tri, loai_bao_tri, khach_hang, dia_diem, nhan_vien_phu_trach, mo_ta, ket_qua) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssss", $data['id_thiet_bi'], $data['ngay_bao_tri'], $data['loai_bao_tri'], $data['khach_hang'], $data['dia_diem'], $data['nhan_vien_phu_trach'], $data['mo_ta'], $data['ket_qua']);
        echo $stmt->execute() ? json_encode(["success" => true, "message" => "Record added"]) : json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        $stmt->close();
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['update'])) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['id_bao_tri'])) exit(json_encode(["success" => false, "message" => "Invalid data or missing id_bao_tri"]));
        $id_bao_tri = $data['id_bao_tri'];
        unset($data['id_bao_tri']);
        if (empty($data)) exit(json_encode(["success" => false, "message" => "No fields to update"]));
        if (!$conn->query("SHOW COLUMNS FROM bao_tri LIKE 'them'")->num_rows) $conn->query("ALTER TABLE bao_tri ADD COLUMN them VARCHAR(255)");
        $allowed = ['id_thiet_bi', 'ngay_bao_tri', 'loai_bao_tri', 'chi_phi', 'nhan_vien_phu_trach', 'mo_ta', 'ket_qua', 'them'];
        $fields = $values = [];
        $types = "";
        foreach ($data as $k => $v) if (in_array($k, $allowed)) { $fields[] = "$k = ?"; $values[] = $v; $types .= "s"; }
        if (empty($fields)) exit(json_encode(["success" => false, "message" => "No valid fields"]));
        $values[] = $id_bao_tri;
        $types .= "s";
        $stmt = $conn->prepare("UPDATE bao_tri SET " . implode(", ", $fields) . " WHERE id_bao_tri = ?");
        $stmt->bind_param($types, ...$values);
        echo $stmt->execute() ? json_encode(["success" => true, "message" => "Update successful"]) : json_encode(["success" => false, "message" => "Update error: " . $stmt->error]);
        $stmt->close();
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['delete'])) {
        $stmt = $conn->prepare("DELETE FROM bao_tri WHERE id_bao_tri=?");
        $stmt->bind_param("s", $_POST['id_bao_tri']);
        echo $stmt->execute() ? json_encode(["success" => true, "message" => "Record deleted"]) : json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        $stmt->close();
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['delete'])) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id_bao_tri'])) exit(json_encode(["success" => false, "message" => "Missing ID"]));
        $stmt = $conn->prepare("DELETE FROM bao_tri WHERE id_bao_tri = ?");
        $stmt->bind_param("s", $data['id_bao_tri']);
        echo $stmt->execute() ? json_encode(["success" => true, "message" => "Record deleted"]) : json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        $stmt->close();
        exit;
    }

    $conn->close();
    exit;
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chi tiết bảo trì thiết bị</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f2f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #1a73e8; text-align: center; margin-bottom: 30px; font-size: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; }
        th, td { padding: 15px; border: 1px solid #e0e0e0; text-align: left; }
        th { background: #f8f9fa; font-weight: 600; width: 200px; color: #444; }
        td { color: #333; }
        tr:hover { background-color: #f5f5f5; }
        .error { text-align: center; color: #d32f2f; padding: 20px; background: #fde8e8; border-radius: 4px; }
        .chi-phi { color: #1a73e8; font-weight: 600; }
        .home-button { display: block; width: 200px; margin: 20px auto 0; padding: 12px 0; background: #1a73e8; color: white; text-align: center; text-decoration: none; font-weight: bold; border-radius: 5px; border: none; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: background-color 0.3s; }
        .home-button:hover { background: #0d47a1; }
    </style>
</head>
<body>
    <div class="container">
        <?php if (!empty($data)): ?>
            <h1>Thông tin bảo trì thiết bị #<?php echo htmlspecialchars($data['id_thiet_bi']); ?></h1>
            <table>
                <?php foreach (['ID Bảo Trì' => 'id_bao_tri', 'ID Thiết Bị' => 'id_thiet_bi', 'Ngày Bảo Trì' => 'ngay_bao_tri', 'Loại Bảo Trì' => 'loai_bao_tri', 'Khách Hàng' => 'khach_hang', 'Khu Vực' => 'dia_diem', 'Nhân Viên Phụ Trách' => 'nhan_vien_phu_trach', 'Mô Tả' => 'mo_ta', 'Kết Quả' => 'ket_qua'] as $label => $key): ?>
                    <tr><th><?php echo $label; ?></th><td><?php echo htmlspecialchars($data[$key] ?? ''); ?></td></tr>
                <?php endforeach; ?>
            </table>
            <a href="https://baotri.hoangphucthanh.vn/" class="home-button">Về Trang Chủ</a>
        <?php else: ?>
            <div class="error">Không tìm thấy thông tin bảo trì.</div>
            <a href="https://baotri.hoangphucthanh.vn/" class="home-button">Về Trang Chủ</a>
        <?php endif; ?>
    </div>
</body>
</html>