import React, { useState, useEffect } from "react";
import { 
  Box,
  Table, 
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import QRCode from "react-qr-code";

const useStyles = makeStyles({
  root: {
    padding: 24,
    backgroundColor: "#f5f5f5"
  },
  contentContainer: {
    display: 'flex',
    gap: 24,
    alignItems: 'flex-start'
  },
  tableContainer: {
    flex: 1,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff"
  },
  searchBar: {
    marginBottom: 24,
    width: "100%",
    maxWidth: 500
  },
  tableHeader: {
    backgroundColor: "#f8f9fa"
  },
  tableCell: {
    padding: "16px 24px"
  },
  editButton: {
    minWidth: 100
  }
});

function Home() {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [editData, setEditData] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState([]);
  const [newField, setNewField] = useState("");
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("https://ebaotri.hoangphucthanh.vn/index.php?all_data");
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddColumn = async () => {
    const dataToSend = {
      id_thiet_bi: "TB111",
      ngay_bao_tri: "2025-02-17",
      loai_bao_tri: "Định kỳ",
      chi_phi: "2",
      nhan_vien_phu_trach: "TNP",
      mo_ta: "Kiểm tra máy bơm",
      ket_qua: "Hoạt động ko tốt",
      khach_hang: "TNP",
      dia_diem: "TPHCM",
      [newField]: ""
    };
    console.log("📤 Dữ liệu gửi đi:", JSON.stringify(dataToSend, null, 2));
    try {
      const response = await fetch("https://ebaotri.hoangphucthanh.vn/index.php?add_extended", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const textResponse = await response.text();
      console.log("📥 Phản hồi từ server:", textResponse);
      try {
        const result = JSON.parse(textResponse);
        if (result.success) {
          setColumns([...columns, newField]);
          setNewField("");
          fetchData();
        } else {
          console.error("❌ Lỗi từ server:", result.message);
        }
      } catch (jsonError) {
        console.error("❌ Server không trả về JSON hợp lệ:", textResponse);
      }
    } catch (error) {
      console.error("❌ Lỗi kết nối:", error);
    }
  };

  const handleEditClick = (row) => {
    setEditFormData(row);
    setEditDialogOpen(true);
  };
  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditFormData({});
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = async () => {
    try {
      const response = await fetch(`https://ebaotri.hoangphucthanh.vn/index.php?update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const result = await response.json();
      if (result.success) {
        fetchData();
        handleEditClose();
      } else {
        console.error("Update failed:", result.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };
  // Import functionality
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importStatus, setImportStatus] = useState({ loading: false, error: null, success: false });
  const fileInputRef = React.useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportClick = () => {
    setImportDialogOpen(true);
    setImportStatus({ loading: false, error: null, success: false });
  };

  const handleImportClose = () => {
    setImportDialogOpen(false);
    setSelectedFile(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setImportStatus({ loading: false, error: "Vui lòng chọn file CSV", success: false });
      return;
    }
    
    setImportStatus({ loading: true, error: null, success: false });
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        // Process each data row
        const dataRows = lines.slice(1).filter(line => line.trim() !== '');
        
        for (const row of dataRows) {
          const values = parseCSVRow(row);
          if (values.length !== headers.length) {
            continue; // Skip malformed rows
          }
          
          const rowData = {};
          headers.forEach((header, index) => {
            const cleanHeader = header.trim();
            rowData[cleanHeader] = values[index].trim().replace(/^"|"$/g, '');
          });
          
          // Send data to server
          const response = await fetch("https://ebaotri.hoangphucthanh.vn/index.php?add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rowData)
          });
          
          const result = await response.json();
          if (!result.success) {
            throw new Error(`Import failed: ${result.message || 'Unknown error'}`);
          }
        }
        
        setImportStatus({ loading: false, error: null, success: true });
        fetchData();
        setTimeout(() => {
          handleImportClose();
        }, 2000);
      };
      
      reader.onerror = () => {
        setImportStatus({ loading: false, error: "Lỗi khi đọc file", success: false });
      };
      
      reader.readAsText(selectedFile);
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus({ loading: false, error: error.message, success: false });
    }
  };

  // Helper function to parse CSV rows correctly (handles quoted values)
  const parseCSVRow = (row) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const filteredData = data.filter((row) =>
    String(row.id_thiet_bi).toLowerCase().includes(searchId.toLowerCase())
  );
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  return (
    <Box className={classes.root}>
      <TextField
        label="Tìm kiếm theo ID Thiết Bị"
        variant="outlined"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        className={classes.searchBar}
        sx={{ backgroundColor: "#fff" }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleImportClick}
        >
          Import
        </Button>
        <Dialog open={importDialogOpen} onClose={handleImportClose} maxWidth="sm" fullWidth>
          <DialogTitle>Import CSV File</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <input
                accept=".csv"
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
                id="contained-button-file"
              />
              <label htmlFor="contained-button-file">
                <Button variant="contained" component="span">
                  Select CSV File
                </Button>
              </label>
              {selectedFile && (
                <Typography sx={{ mt: 2 }}>
                  Selected file: {selectedFile.name}
                </Typography>
              )}
              {importStatus.loading && (
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                  Importing data, please wait...
                </Typography>
              )}
              {importStatus.error && (
                <Typography sx={{ mt: 2, color: 'error.main' }}>
                  {importStatus.error}
                </Typography>
              )}
              {importStatus.success && (
                <Typography sx={{ mt: 2, color: 'success.main' }}>
                  Import completed successfully!
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleImportClose}>Cancel</Button>
            <Button 
              onClick={handleImport} 
              variant="contained" 
              color="primary"
              disabled={!selectedFile || importStatus.loading}
            >
              {importStatus.loading ? "Importing..." : "Import"}
            </Button>
          </DialogActions>
        </Dialog>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            // Convert data to CSV
            const headers = [
              "ID Bảo Trì", 
              "ID Thiết Bị", 
              "Ngày Bảo Trì", 
              "Loại Bảo Trì", 
              "Khách Hàng", 
              "Địa Điểm",
              "Nhân Viên Phụ Trách", 
              "Mô Tả", 
              "Kết Quả",
              ...columns
            ];
            
            let csvContent = headers.join(",") + "\n";
            
            filteredData.forEach(row => {
              const values = [
                row.id_bao_tri,
                row.id_thiet_bi,
                row.ngay_bao_tri,
                row.loai_bao_tri,
                row.khach_hang,
                row.dia_diem,
                row.nhan_vien_phu_trach,
                `"${(row.mo_ta || "").replace(/"/g, '""')}"`,
                `"${(row.ket_qua || "").replace(/"/g, '""')}"`
              ];
              
              // Add dynamic columns
              columns.forEach(col => {
                values.push(`"${(row[col] || "").replace(/"/g, '""')}"`);
              });
              
              csvContent += values.join(",") + "\n";
            });
            
            // Create download link
            const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `bao-tri-thiet-bi-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Export
        </Button>
      </Box>
      <Box className={classes.contentContainer}>
        <Paper className={classes.tableContainer}>
          <Typography variant="h5" align="center" sx={{ py: 3, borderBottom: "1px solid #e0e0e0" }}>
            Danh sách bảo trì thiết bị
          </Typography>
          <TableContainer>
            <Table>
              <TableHead className={classes.tableHeader}>
                <TableRow>
                  <TableCell className={classes.tableCell}><strong>ID Bảo Trì</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>ID Thiết Bị</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Ngày Bảo Trì</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Loại Bảo Trì</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Khách Hàng</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Khu Vực</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Nhân Viên Phụ Trách</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Mô Tả</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Kết Quả</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Chỉnh Sửa</strong></TableCell>
                  {columns.map((col) => (
                    <TableCell key={col} className={classes.tableCell}><strong>{col}</strong></TableCell>
                  ))}
                  <TableCell className={classes.tableCell}><strong>QR Code</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow 
                      key={row.id_bao_tri}
                      hover
                      sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                      <TableCell className={classes.tableCell}>{row.id_bao_tri}</TableCell>
                      <TableCell className={classes.tableCell}>{row.id_thiet_bi}</TableCell>
                      <TableCell className={classes.tableCell}>{row.ngay_bao_tri}</TableCell>
                      <TableCell className={classes.tableCell}>{row.loai_bao_tri}</TableCell>
                      <TableCell className={classes.tableCell}>{row.khach_hang}</TableCell>
                      <TableCell className={classes.tableCell}>{row.dia_diem}</TableCell>
                      <TableCell className={classes.tableCell}>{row.nhan_vien_phu_trach}</TableCell>
                      <TableCell className={classes.tableCell}>{row.mo_ta}</TableCell>
                      <TableCell className={classes.tableCell}>{row.ket_qua}</TableCell>
                      <TableCell className={classes.tableCell}>
                        <Button 
                          variant="contained"
                          color="primary"
                          onClick={() => handleEditClick(row)}
                          className={classes.editButton}
                        >
                          Chỉnh sửa
                        </Button>
                      </TableCell>

                      {columns.map((col) => (
                        <TableCell key={col} className={classes.tableCell}>
                          {row[col]}
                        </TableCell>
                      ))}

                      <TableCell className={classes.tableCell}>
                        <QRCode
                          value={`https://ebaotri.hoangphucthanh.vn/index.php?id=${row.id_thiet_bi}/${encodeURIComponent(row.dia_diem)}`}
                          size={64}
                          level="L"
                        />
                      </TableCell>



                      </TableRow>
                      ))
                      ) : (
                      <TableRow>
                        <TableCell colSpan={10 + columns.length} align="center" className={classes.tableCell}>
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                      )}
                      </TableBody>
                      </Table>
                      </TableContainer>
                      </Paper>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(event, value) => {
            setCurrentPage(value);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          color="primary"
        />
      </Box>
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa thông tin bảo trì</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, py: 2 }}>
            <TextField
              name="id_thiet_bi"
              label="ID Thiết Bị"
              value={editFormData.id_thiet_bi || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="ngay_bao_tri"
              label="Ngày Bảo Trì"
              type="date"
              value={editFormData.ngay_bao_tri || ''}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="loai_bao_tri"
              label="Loại Bảo Trì"
              value={editFormData.loai_bao_tri || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="chi_phi"
              label="Chi Phí"
              type="number"
              value={editFormData.chi_phi || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="nhan_vien_phu_trach"
              label="Nhân Viên Phụ Trách"
              value={editFormData.nhan_vien_phu_trach || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="mo_ta"
              label="Mô Tả"
              value={editFormData.mo_ta || ''}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              name="ket_qua"
              label="Kết Quả"
              value={editFormData.ket_qua || ''}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 2 }}>
        <TextField
          label="Nhập tên trường mới"
          variant="outlined"
          value={newField}
          onChange={(e) => setNewField(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddColumn} sx={{ mt: 1 }}>
          Thêm trường
        </Button>
      </Box>
    </Box>
  );
}

export default Home;