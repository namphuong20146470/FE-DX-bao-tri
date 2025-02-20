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
  const ITEMS_PER_PAGE = 10;
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("https://ebaotri.hoangphucthanh.vn/index.php?all_data");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`https://ebaotri.hoangphucthanh.vn/index.php?update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  const filteredData = data.filter((row) =>
    row.id_thiet_bi.toLowerCase().includes(searchId.toLowerCase())
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

      <Box className={classes.contentContainer}>
        <Paper className={classes.tableContainer}>
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ py: 3, borderBottom: "1px solid #e0e0e0" }}
          >
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
                  <TableCell className={classes.tableCell}><strong>Chi Phí (VND)</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Nhân Viên Phụ Trách</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Mô Tả</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Kết Quả</strong></TableCell>
                  <TableCell className={classes.tableCell}><strong>Chỉnh Sửa</strong></TableCell>
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
                      <TableCell className={classes.tableCell}>
                        {parseFloat(row.chi_phi).toLocaleString()} VND
                      </TableCell>
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
                      <TableCell className={classes.tableCell}>
                        <QRCode
                          value={`https://ebaotri.hoangphucthanh.vn/index.php?id=${row.id_thiet_bi}`}
                          size={64}
                          level="L"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center" className={classes.tableCell}>
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
    </Box>
  );
}

export default Home;