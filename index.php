<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'H&ptiot2024');
define('DB_NAME', 'HOPT');

// Database connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
$conn->set_charset("utf8");
// Get all maintenance records
if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['all_data'])) {
    header('Content-Type: application/json');
    try {
        $query = "SELECT id_bao_tri, id_thiet_bi, DATE_FORMAT(ngay_bao_tri, '%Y-%m-%d') as ngay_bao_tri, 
                         loai_bao_tri, chi_phi, nhan_vien_phu_trach, mo_ta, ket_qua 
                  FROM bao_tri 
                  ORDER BY ngay_bao_tri DESC";  // Changed from maintenance_day to ngay_bao_tri
        
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $data = [];
            while ($row = $result->fetch_assoc()) {
                // Format decimal values
                $row['chi_phi'] = number_format((float)$row['chi_phi'], 2, '.', '');
                $data[] = $row;
            }
            echo json_encode([
                "success" => true,
                "data" => $data
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Không tìm thấy dữ liệu"
            ], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    $stmt->close();
    exit();
}

// Get latest maintenance record
if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['latest'])) {
    header('Content-Type: application/json');
    try {
        $query = "SELECT id_bao_tri, id_thiet_bi, DATE_FORMAT(ngay_bao_tri, '%Y-%m-%d') as ngay_bao_tri, 
                         loai_bao_tri, chi_phi, nhan_vien_phu_trach, mo_ta, ket_qua 
                  FROM bao_tri 
                  ORDER BY ngay_bao_tri DESC 
                  LIMIT 1";
        
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $data = $result->fetch_assoc();
            // Format decimal values
            $data['chi_phi'] = number_format((float)$data['chi_phi'], 2, '.', '');
            echo json_encode([
                "success" => true,
                "data" => $data
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Không tìm thấy dữ liệu"
            ], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Lỗi: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    $stmt->close();
    exit();
}

// ...rest of your existing code...

// Add maintenance record
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['add'])) {
        $stmt = $conn->prepare("INSERT INTO bao_tri 
            (id_thiet_bi, ngay_bao_tri, loai_bao_tri, chi_phi, 
            nhan_vien_phu_trach, mo_ta, ket_qua) 
            VALUES (?, ?, ?, ?, ?, ?, ?)");

        $stmt->bind_param("sssssss", 
            $data['id_thiet_bi'], 
            $data['ngay_bao_tri'], 
            $data['loai_bao_tri'], 
            $data['chi_phi'], 
            $data['nhan_vien_phu_trach'], 
            $data['mo_ta'], 
            $data['ket_qua']
        );

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Record added successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
        $stmt->close();
        exit();
    }
}


// Update maintenance record
// Cập nhật bảo trì (update)

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Đọc dữ liệu JSON từ php://input
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);
    
    // Kiểm tra JSON
    if (!$data) {
        echo json_encode(["success" => false, "message" => "Dữ liệu không hợp lệ"]);
        exit();
    }

    // Bắt buộc phải có id_bao_tri
    if (!isset($data['id_bao_tri'])) {
        echo json_encode(["success" => false, "message" => "Thiếu id_bao_tri"]);
        exit();
    }

    $id_bao_tri = $data['id_bao_tri'];
    unset($data['id_bao_tri']); // Xóa id_bao_tri để tránh cập nhật nó

    // Nếu không có trường nào để cập nhật
    if (empty($data)) {
        echo json_encode(["success" => false, "message" => "Không có trường nào để cập nhật"]);
        exit();
    }

    // Danh sách các trường hợp lệ trong cơ sở dữ liệu
    $allowedFields = ['id_thiet_bi', 'ngay_bao_tri', 'loai_bao_tri', 'chi_phi', 'nhan_vien_phu_trach', 'mo_ta', 'ket_qua'];

    // Chuẩn bị câu lệnh SQL động
    $fields = [];
    $values = [];
    $types = "";

    // Loại bỏ các trường không hợp lệ (ví dụ: "them")
    foreach ($data as $key => $value) {
        if (in_array($key, $allowedFields)) {
            $fields[] = "$key = ?";
            $values[] = $value;
            $types .= "s"; // Kiểu string (s) - chỉnh sửa nếu cần
        }
    }

    if (empty($fields)) {
        echo json_encode(["success" => false, "message" => "Không có trường hợp lệ"]);
        exit();
    }

    // Thêm id_bao_tri vào cuối cùng để bind
    $values[] = $id_bao_tri;
    $types .= "s";

    // Tạo câu lệnh SQL cập nhật
    $sql = "UPDATE bao_tri SET " . implode(", ", $fields) . " WHERE id_bao_tri = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Lỗi chuẩn bị câu lệnh: " . $conn->error]);
        exit();
    }

    // Gán tham số
    $stmt->bind_param($types, ...$values);

    // Thực hiện cập nhật
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Cập nhật thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Lỗi khi cập nhật: " . $stmt->error]);
    }

    $stmt->close();
    exit();
}




// Delete maintenance record
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['delete'])) {
    $stmt = $conn->prepare("DELETE FROM bao_tri WHERE id_bao_tri=?");
    $id_bao_tri = $_POST['id_bao_tri'];
    $stmt->bind_param("s", $id_bao_tri);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Record deleted successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error deleting record: " . $stmt->error
        ]);
    }
    $stmt->close();
    exit();
}

$conn->close();
?>