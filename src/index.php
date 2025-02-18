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

// Get ID from URL
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
        $data = $row; // Reuse in HTML
    } else {
        $data = null;
    }

    $stmt->close();
} else {
    $data = null;
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
        <?php if ($data): ?>
            <h1>Thông tin bảo trì thiết bị #<?php echo htmlspecialchars($data['id_thiet_bi']); ?></h1>
            <table>
                <tr>
                    <th>ID Bảo Trì</th>
                    <td><?php echo htmlspecialchars($data['id_bao_tri']); ?></td>
                </tr>
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
                <tr>
                    <th>Chi Phí</th>
                    <td class="chi-phi"><?php echo number_format($data['chi_phi'], 0, ',', '.'); ?> VNĐ</td>
                </tr>
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
                Không tìm thấy thông tin bảo trì cho ID: <?php echo htmlspecialchars($id); ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>