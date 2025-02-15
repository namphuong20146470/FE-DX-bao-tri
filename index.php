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
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add'])) {
    $stmt = $conn->prepare("INSERT INTO bao_tri (id_thiet_bi, ngay_bao_tri, loai_bao_tri, 
                           chi_phi, nhan_vien_phu_trach, mo_ta, ket_qua) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    $id_thiet_bi = $_POST['id_thiet_bi'];
    $ngay_bao_tri = $_POST['ngay_bao_tri'];
    $loai_bao_tri = $_POST['loai_bao_tri'];
    $chi_phi = $_POST['chi_phi'];
    $nhan_vien_phu_trach = $_POST['nhan_vien_phu_trach'];
    $mo_ta = $_POST['mo_ta'];
    $ket_qua = $_POST['ket_qua'];

    $stmt->bind_param("sssssss", $id_thiet_bi, $ngay_bao_tri, $loai_bao_tri, 
                      $chi_phi, $nhan_vien_phu_trach, $mo_ta, $ket_qua);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Record added successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error adding record: " . $stmt->error
        ]);
    }
    $stmt->close();
    exit();
}

// Update maintenance record
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['update'])) {
    $stmt = $conn->prepare("UPDATE bao_tri SET id_thiet_bi=?, ngay_bao_tri=?, loai_bao_tri=?, 
                           chi_phi=?, nhan_vien_phu_trach=?, mo_ta=?, ket_qua=? 
                           WHERE id_bao_tri=?");
    
    $id_bao_tri = $_POST['id_bao_tri'];
    $id_thiet_bi = $_POST['id_thiet_bi'];
    $ngay_bao_tri = $_POST['ngay_bao_tri'];
    $loai_bao_tri = $_POST['loai_bao_tri'];
    $chi_phi = $_POST['chi_phi'];
    $nhan_vien_phu_trach = $_POST['nhan_vien_phu_trach'];
    $mo_ta = $_POST['mo_ta'];
    $ket_qua = $_POST['ket_qua'];

    $stmt->bind_param("ssssssss", $id_thiet_bi, $ngay_bao_tri, $loai_bao_tri, 
                      $chi_phi, $nhan_vien_phu_trach, $mo_ta, $ket_qua, $id_bao_tri);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Record updated successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error updating record: " . $stmt->error
        ]);
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