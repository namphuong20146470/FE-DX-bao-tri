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
  TextField
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
  qrCodesSection: {
    width: 300,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: 'sticky',
    top: 24,
    maxHeight: 'calc(100vh - 48px)',
    overflowY: 'auto'
  },
  qrCodeItem: {
    marginBottom: 16,
    padding: 8,
    borderBottom: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
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
  }
});

function Home() {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    fetch("https://ebaotri.hoangphucthanh.vn/index.php?all_data")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setData(result.data);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
      });
  }, []);

  const filteredData = data.filter((row) =>
    row.id_thiet_bi.toLowerCase().includes(searchId.toLowerCase())
  );

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
        <TableCell className={classes.tableCell}><strong>QR Code</strong></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredData.length > 0 ? (
        filteredData.map((row) => (
          <TableRow 
            key={row.id_bao_tri}
            hover
            sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
          >
            <TableCell className={classes.tableCell}>{row.id_bao_tri}</TableCell>
            <TableCell className={classes.tableCell}>{row.id_thiet_bi}</TableCell>
            <TableCell className={classes.tableCell}>{row.ngay_bao_tri}</TableCell>
            <TableCell className={classes.tableCell}>{row.loai_bao_tri}</TableCell>
            <TableCell className={classes.tableCell}>{parseFloat(row.chi_phi).toLocaleString()} VND</TableCell>
            <TableCell className={classes.tableCell}>{row.nhan_vien_phu_trach}</TableCell>
            <TableCell className={classes.tableCell}>{row.mo_ta}</TableCell>
            <TableCell className={classes.tableCell}>{row.ket_qua}</TableCell>
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
          <TableCell colSpan={9} align="center" className={classes.tableCell}>
            Không có dữ liệu
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>
        </Paper>

        {/* <Box className={classes.qrCodesSection}>
          <Typography variant="h6" gutterBottom align="center">
            QR Codes
          </Typography>
          {filteredData.map((item) => (
            <Box key={item.id_bao_tri} className={classes.qrCodeItem}>
              <QRCode 
                value={`https://ebaotri.hoangphucthanh.vn/index.php?id=${item.id_thiet_bi}`}
                size={128}
                level="L"
              />
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                ID Thiết bị: {item.id_thiet_bi}
              </Typography>
            </Box>
          ))}
        </Box> */}
      </Box>
    </Box>
  );
}

export default Home;