<?php
// filepath: /home/phuong/Downloads/HOPT/FE-Mainternance/index.php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database config
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'H&ptiot2024');
define('DB_NAME', 'HOPT');

// Connect to DB
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");
function handleDBQuery($conn, $query, $params = [], $types = '') {
    $stmt = $conn->prepare($query);
    if ($params) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    return $stmt->get_result();
}

// Check if ?id is passed for HTML rendering
$data = null;
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    if (!is_numeric($id)) {
        echo json_encode(["success" => false, "message" => "ID thiết bị không hợp lệ"]);
        exit();
    }

    $query = "SELECT id_bao_tri, id_thiet_bi, DATE_FORMAT(ngay_bao_tri, '%Y-%m-%d') AS ngay_bao_tri,
                     loai_bao_tri, chi_phi, nhan_vien_phu_trach, mo_ta, ket_qua
              FROM bao_tri
              WHERE id_thiet_bi = ?
              ORDER BY ngay_bao_tri DESC
              LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $row['chi_phi'] = number_format((float)$row['chi_phi'], 2, '.', '');
        $data = $row;
    } else {
        $data = null;
    }
    $stmt->close();
}

// Check if it's an API request for all_data, latest, or POST
if (isset($_GET['all_data']) || isset($_GET['latest']) || $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Set JSON headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }

    // Re-connect here (mirroring user snippet)
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    }
    $conn->set_charset("utf8");

    // Handle API requests
    if (isset($_GET['id']) || isset($_GET['all_data']) || isset($_GET['latest']) || $_SERVER['REQUEST_METHOD'] === 'POST') {
        // Set JSON headers again (as in user snippet)
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Content-Type: application/json");

        // 1) GET by ?id (latest record by device)
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            if (!is_numeric($id)) {
                echo json_encode(["success" => false, "message" => "ID thiết bị không hợp lệ"]);
                exit();
            }

            $query = "SELECT id_bao_tri, id_thiet_bi, DATE_FORMAT(ngay_bao_tri, '%Y-%m-%d') AS ngay_bao_tri,
                             loai_bao_tri, chi_phi, nhan_vien_phu_trach, mo_ta, ket_qua 
                      FROM bao_tri 
                      WHERE id_thiet_bi = ?
                      ORDER BY ngay_bao_tri DESC
                      LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("s", $id);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $row['chi_phi'] = number_format((float)$row['chi_phi'], 2, '.', '');
                echo json_encode(["success" => true, "data" => $row], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(["success" => false, "message" => "Không tìm thấy dữ liệu bảo trì cho thiết bị này"], JSON_UNESCAPED_UNICODE);
            }
            $stmt->close();
            $conn->close();
            exit();
        }

        // 2) GET all_data
        if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['all_data'])) {
            try {
                $query = "SELECT id_bao_tri, id_thiet_bi, DATE_FORMAT(ngay_bao_tri, '%Y-%m-%d') AS ngay_bao_tri,
                                 loai_bao_tri, chi_phi, nhan_vien_phu_trach, mo_ta, ket_qua
                          FROM bao_tri
                          ORDER BY ngay_bao_tri DESC";
                $stmt = $conn->prepare($query);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $data = [];
                    while ($row = $result->fetch_assoc()) {
                        $row['chi_phi'] = number_format((float)$row['chi_phi'], 2, '.', '');
                        $data[] = $row;
                    }
                    echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(["success" => false, "message" => "Không tìm thấy dữ liệu"], JSON_UNESCAPED_UNICODE);
                }
            } catch (Exception $e) {
                echo json_encode(["success" => false, "message" => "Lỗi: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            }
            $stmt->close();
            exit();
        }

        // 3) GET latest
        if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['latest'])) {
            try {
                $query = "SELECT id_bao_tri, id_thiet_bi, DATE_FORMAT(ngay_bao_tri, '%Y-%m-%d') AS ngay_bao_tri,
                                 loai_bao_tri, chi_phi, nhan_vien_phu_trach, mo_ta, ket_qua
                          FROM bao_tri
                          ORDER BY ngay_bao_tri DESC
                          LIMIT 1";
                $stmt = $conn->prepare($query);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $data = $result->fetch_assoc();
                    $data['chi_phi'] = number_format((float)$data['chi_phi'], 2, '.', '');
                    echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(["success" => false, "message" => "Không tìm thấy dữ liệu"], JSON_UNESCAPED_UNICODE);
                }
            } catch (Exception $e) {
                echo json_encode(["success" => false, "message" => "Lỗi: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            }
            $stmt->close();
            exit();
        }

        // 4) POST add record
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['add'])) {
            $rawInput = file_get_contents("php://input");
            $json = json_decode($rawInput, true);

            $stmt = $conn->prepare("INSERT INTO bao_tri (
                id_thiet_bi,
                ngay_bao_tri,
                loai_bao_tri,
                chi_phi,
                nhan_vien_phu_trach,
                mo_ta,
                ket_qua
            ) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param(
                "sssssss",
                $json['id_thiet_bi'],
                $json['ngay_bao_tri'],
                $json['loai_bao_tri'],
                $json['chi_phi'],
                $json['nhan_vien_phu_trach'],
                $json['mo_ta'],
                $json['ket_qua']
            );

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Record added successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
            }
            $stmt->close();
            exit();
        }



        //add_extended
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['add_extended'])) {
            $rawInput = file_get_contents("php://input");
            $json = json_decode($rawInput, true);
            if (!$json) {
                echo json_encode(["success" => false, "message" => "Invalid JSON"]);
                exit();
            }
        
            if (!isset($json['id_thiet_bi']) || empty($json['id_thiet_bi'])) {
                echo json_encode(["success" => false, "message" => "Thiếu id_thiet_bi"]);
                exit();
            }
        
            $defaultFields = ['id_thiet_bi', 'ngay_bao_tri', 'loai_bao_tri', 'chi_phi', 'nhan_vien_phu_trach', 'mo_ta', 'ket_qua'];
            $columns = [];
            $placeholders = [];
            $values = [];
            $types = "";
        
            foreach ($json as $key => $value) {
                $escapedKey = $conn->real_escape_string($key);
                $check = $conn->query("SHOW COLUMNS FROM bao_tri LIKE '$escapedKey'");
                if ($check->num_rows === 0) {
                    $conn->query("ALTER TABLE bao_tri ADD COLUMN `$key` VARCHAR(255)");
                }
                $columns[] = $key;
                $placeholders[] = '?';
                $values[] = $value;
                $types .= 's';
            }
        
            $sql = "INSERT INTO bao_tri (" . implode(", ", $columns) . ") VALUES (" . implode(", ", $placeholders) . ")";
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                echo json_encode(["success" => false, "message" => "Lỗi SQL: " . $conn->error]);
                exit();
            }
        
            $stmt->bind_param($types, ...$values);
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Thêm dữ liệu thành công"]);
            } else {
                echo json_encode(["success" => false, "message" => "Lỗi thực thi: " . $stmt->error]);
            }
            $stmt->close();
            exit();
        }

        // 5) POST update record
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['update'])) {
            $rawInput = file_get_contents("php://input");
            $data = json_decode($rawInput, true);

            if (!$data) {
                echo json_encode(["success" => false, "message" => "Invalid data"]);
                exit();
            }
            if (!isset($data['id_bao_tri'])) {
                echo json_encode(["success" => false, "message" => "Missing id_bao_tri"]);
                exit();
            }

            $id_bao_tri = $data['id_bao_tri'];
            unset($data['id_bao_tri']);
            if (empty($data)) {
                echo json_encode(["success" => false, "message" => "No fields to update"]);
                exit();
            }

            // Check 'them' column
            $checkColumn = $conn->query("SHOW COLUMNS FROM bao_tri LIKE 'them'");
            if ($checkColumn->num_rows === 0) {
                $conn->query("ALTER TABLE bao_tri ADD COLUMN them VARCHAR(255)");
            }

            $allowedFields = ['id_thiet_bi','ngay_bao_tri','loai_bao_tri','chi_phi',
                              'nhan_vien_phu_trach','mo_ta','ket_qua','them'];
            $fields = [];
            $values = [];
            $types  = "";

            foreach ($data as $key => $value) {
                if (in_array($key, $allowedFields)) {
                    $fields[] = "$key = ?";
                    $values[] = $value;
                    $types   .= "s";
                }
            }
            if (empty($fields)) {
                echo json_encode(["success" => false, "message" => "No valid fields"]);
                exit();
            }

            $values[] = $id_bao_tri;
            $types   .= "s";
            $sql = "UPDATE bao_tri SET " . implode(", ", $fields) . " WHERE id_bao_tri = ?";
            $stmt = $conn->prepare($sql);

            if (!$stmt) {
                echo json_encode(["success" => false, "message" => "Statement preparation error: " . $conn->error]);
                exit();
            }

            $stmt->bind_param($types, ...$values);
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Update successful"]);
            } else {
                echo json_encode(["success" => false, "message" => "Update error: " . $stmt->error]);
            }
            $stmt->close();
            exit();
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['update_auto'])) {
            $raw = file_get_contents("php://input");
            $input = json_decode($raw, true);
            $res = $conn->query("SELECT MAX(id_bao_tri) AS max_id FROM bao_tri");
            $row = $res->fetch_assoc();
            if (!$row['max_id']) {
                echo json_encode(["success" => false, "message" => "No record to update"]);
                exit();
            }
            $id = $row['max_id'];
            $fields = [];
            $values = [];
            $types = "";
            foreach (["id_thiet_bi","ngay_bao_tri","loai_bao_tri","chi_phi","nhan_vien_phu_trach","mo_ta","ket_qua"] as $col) {
                if (isset($input[$col])) {
                    $fields[] = "$col = ?";
                    $types .= "s";
                    $values[] = $input[$col];
                }
            }
            if (!$fields) {
                echo json_encode(["success" => false, "message" => "No data"]);
                exit();
            }
            $values[] = $id;
            $types .= "s";
            $sql = "UPDATE bao_tri SET " . implode(", ", $fields) . " WHERE id_bao_tri = ?";
            $up = $conn->prepare($sql);
            $up->bind_param($types, ...$values);
            if ($up->execute()) {
                echo json_encode(["success" => true, "message" => "Update done"]);
            } else {
                echo json_encode(["success" => false, "message" => $up->error]);
            }
            $up->close();
            exit();
        }

        // 6) POST delete via form
        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['delete'])) {
            $stmt = $conn->prepare("DELETE FROM bao_tri WHERE id_bao_tri=?");
            $id_bao_tri = $_POST['id_bao_tri'];
            $stmt->bind_param("s", $id_bao_tri);

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Record deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error deleting record: " . $stmt->error]);
            }
            $stmt->close();
            exit();
        }

        // 7) POST delete via JSON
        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['delete'])) {
            $rawInput = file_get_contents("php://input");
            $json = json_decode($rawInput, true);

            if (!isset($json['id_bao_tri'])) {
                echo json_encode(["success" => false, "message" => "Missing ID"]);
                exit();
            }
            $stmt = $conn->prepare("DELETE FROM bao_tri WHERE id_bao_tri = ?");
            $stmt->bind_param("s", $json['id_bao_tri']);

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Record deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
            }
            $stmt->close();
            exit();
        }

        $conn->close();
        exit();
    }
}

// Close the original connection if still open
if ($conn) {
    $conn->close();
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chi tiết bảo trì thiết bị</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f0f2f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1a73e8;
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
        }
        th, td {
            padding: 15px;
            border: 1px solid #e0e0e0;
            text-align: left;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
            width: 200px;
            color: #444;
        }
        td {
            color: #333;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .error {
            text-align: center;
            color: #d32f2f;
            padding: 20px;
            background: #fde8e8;
            border-radius: 4px;
        }
        .chi-phi {
            color: #1a73e8;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <?php if (!empty($data)): ?>
            <h1>Thông tin bảo trì thiết bị #<?php echo htmlspecialchars($data['id_thiet_bi']); ?></h1>
            <table>
                <!-- <tr>
                    <th>ID Bảo Trì</th>
                    <td><?php echo htmlspecialchars($data['id_bao_tri']); ?></td>
                </tr> -->
                <tr>
                    <th>ID Thiết Bị</th>
                    <td><?php echo htmlspecialchars($data['id_thiet_bi']); ?></td>
                </tr>
                <tr>
                    <th>Ngày Bảo Trì</th>
                    <td><?php echo htmlspecialchars($data['ngay_bao_tri']); ?></td>
                </tr>
                <tr>
                    <th>Loại Bảo Trì</th>
                    <td><?php echo htmlspecialchars($data['loai_bao_tri']); ?></td>
                </tr>
                <!-- <tr>
                    <th>Chi Phí</th>
                    <td class="chi-phi">
                        <?php echo number_format($data['chi_phi'], 0, ',', '.'); ?> VNĐ
                    </td>
                </tr> -->
                <tr>
                    <th>Nhân Viên Phụ Trách</th>
                    <td><?php echo htmlspecialchars($data['nhan_vien_phu_trach']); ?></td>
                </tr>
                <tr>
                    <th>Mô Tả</th>
                    <td><?php echo htmlspecialchars($data['mo_ta']); ?></td>
                </tr>
                <tr>
                    <th>Kết Quả</th>
                    <td><?php echo htmlspecialchars($data['ket_qua']); ?></td>
                </tr>
            </table>
        <?php else: ?>
            <div class="error">
                Không tìm thấy thông tin bảo trì cho ID thiết bị đã nhập.
            </div>
        <?php endif; ?>
    </div>
</body>
</html>