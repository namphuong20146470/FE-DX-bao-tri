<?php
// filepath: /home/phuong/Downloads/HOPT/FE-Mainternance/index.php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if API request
if(isset($_GET['id']) || isset($_GET['all_data']) || isset($_GET['latest']) || $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Set JSON headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json");

    // Database config
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', 'H&ptiot2024');
    define('DB_NAME', 'HOPT');

    // Connect to DB
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
    }
    $conn->set_charset("utf8");

    // Handle API requests
    if(isset($_GET['id'])) {
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

    if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['all_data'])) {
        header('Content-Type: application/json');
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
    
    // Add maintenance record
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['add'])) {
            $stmt = $conn->prepare("INSERT INTO bao_tri
                (id_thiet_bi, ngay_bao_tri, loai_bao_tri, chi_phi,
                 nhan_vien_phu_trach, mo_ta, ket_qua)
                VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
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
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['update'])) {
        $json = file_get_contents("php://input");
        $data = json_decode($json, true);
        
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
    
        // Check if 'them' column exists; add if not
        $checkColumn = $conn->query("SHOW COLUMNS FROM bao_tri LIKE 'them'");
        if ($checkColumn->num_rows === 0) {
            $conn->query("ALTER TABLE bao_tri ADD COLUMN them VARCHAR(255)");
        }
    
        $allowedFields = ['id_thiet_bi', 'ngay_bao_tri', 'loai_bao_tri', 'chi_phi',
                          'nhan_vien_phu_trach', 'mo_ta', 'ket_qua', 'them'];
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
    
    // Delete maintenance record via posted form data
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
    
    // Delete maintenance record via JSON request (?delete)
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['delete'])) {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['id_bao_tri'])) {
            echo json_encode(["success" => false, "message" => "Missing ID"]);
            exit();
        }
    
        $sql = "DELETE FROM bao_tri WHERE id_bao_tri = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $data['id_bao_tri']);
    
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

// If not an API request, show HTML page
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tra cứu bảo trì thiết bị</title>
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
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1a73e8;
            text-align: center;
            margin-bottom: 30px;
        }
        .search-box {
            margin-bottom: 20px;
            text-align: center;
        }
        input {
            padding: 10px;
            width: 200px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-right: 10px;
        }
        button {
            padding: 10px 20px;
            background: #1a73e8;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: #1557b0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        .error {
            color: #d32f2f;
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Tra cứu thông tin bảo trì thiết bị</h1>
        <div class="search-box">
            <input type="text" id="idInput" placeholder="Nhập ID bảo trì..." />
            <button onclick="searchById()">Tra cứu</button>
        </div>
        <div id="result"></div>
    </div>

    <script>
        function searchById() {
            const id = document.getElementById('idInput').value.trim();
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '';

            if (!id) {
                resultDiv.innerHTML = '<p class="error">Vui lòng nhập ID bảo trì</p>';
                return;
            }

            fetch(`${window.location.href}?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const record = data.data;
                        resultDiv.innerHTML = `
                            <table>
                                <tr><th>ID Bảo Trì</th><td>${record.id_bao_tri}</td></tr>
                                <tr><th>ID Thiết Bị</th><td>${record.id_thiet_bi}</td></tr>
                                <tr><th>Ngày Bảo Trì</th><td>${record.ngay_bao_tri}</td></tr>
                                <tr><th>Loại Bảo Trì</th><td>${record.loai_bao_tri}</td></tr>
                             
                                <tr><th>Nhân Viên Phụ Trách</th><td>${record.nhan_vien_phu_trach}</td></tr>
                                <tr><th>Mô Tả</th><td>${record.mo_ta}</td></tr>
                                <tr><th>Kết Quả</th><td>${record.ket_qua}</td></tr>
                            </table>
                        `;
                    } else {
                        resultDiv.innerHTML = `<p class="error">${data.message}</p>`;
                    }
                })
                .catch(error => {
                    resultDiv.innerHTML = `<p class="error">Lỗi: ${error}</p>`;
                });
        }
    </script>
</body>
</html>