import React, { useState, useEffect } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField } from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import Hero from "components/common/Hero";

const useStyles = makeStyles({
  root: {
    maxHeight: 100,
    marginBottom: 15,
  },
  table: {
    minWidth: 650,
  },
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
    <Box>
      <TextField
        label="Tìm kiếm theo ID Thiết Bị"
        variant="outlined"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        sx={{ backgroundColor: "#fff",mb: 2, width: "100%", maxWidth: 500 }}
      />
      <Box
        className={classes.root}
        sx={{ backgroundColor: "#fff", display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* <Box sx={{ flex: 1 }}>
          <Hero />
        </Box> */}

        <Typography variant="h5" align="center" gutterBottom>
          Danh sách bảo trì thiết bị
        </Typography>

        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID Bảo Trì</strong></TableCell>
                <TableCell><strong>ID Thiết Bị</strong></TableCell>
                <TableCell><strong>Ngày Bảo Trì</strong></TableCell>
                <TableCell><strong>Loại Bảo Trì</strong></TableCell>
                <TableCell><strong>Chi Phí (VND)</strong></TableCell>
                <TableCell><strong>Nhân Viên Phụ Trách</strong></TableCell>
                <TableCell><strong>Mô Tả</strong></TableCell>
                <TableCell><strong>Kết Quả</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <TableRow key={row.id_bao_tri}>
                    <TableCell>{row.id_bao_tri}</TableCell>
                    <TableCell>{row.id_thiet_bi}</TableCell>
                    <TableCell>{row.ngay_bao_tri}</TableCell>
                    <TableCell>{row.loai_bao_tri}</TableCell>
                    <TableCell>{parseFloat(row.chi_phi).toLocaleString()} VND</TableCell>
                    <TableCell>{row.nhan_vien_phu_trach}</TableCell>
                    <TableCell>{row.mo_ta}</TableCell>
                    <TableCell>{row.ket_qua}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default Home;