import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Pagination,
} from "@mui/material";
import QRCode from "react-qr-code";

function TableSection({
  paginatedData,
  columns,
  handleEditClick,
  totalPages,
  currentPage,
  setCurrentPage,
  isMobile,
}) {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper
            sx={{
              boxShadow: { xs: "none", sm: "0 4px 6px rgba(0,0,0,0.1)" },
              borderRadius: { xs: 0, sm: 2 },
              overflow: "auto",
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888",
                borderRadius: 4,
              },
            }}
          >
            <Typography
              variant="h5"
              align="center"
              sx={{
                py: 3,
                borderBottom: "1px solid #e0e0e0",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              Danh sách bảo trì thiết bị
            </Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableRow>
                    {[
                      "ID Bảo Trì",
                      "ID Thiết Bị",
                      "Ngày Bảo Trì",
                      "Loại Bảo Trì",
                      "Khách Hàng",
                      "Khu Vực",
                      "Nhân Viên Phụ Trách",
                      "Mô Tả",
                      "Kết Quả",
                      "Chỉnh Sửa",
                      ...columns,
                      "QR Code",
                    ].map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          padding: { xs: "8px 12px", sm: "16px 24px" },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          whiteSpace: "nowrap",
                        }}
                      >
                        <strong>{col}</strong>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length ? (
                    paginatedData.map((row) => (
                      <TableRow
                        key={row.id_bao_tri}
                        hover
                        sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                      >
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.id_bao_tri}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.id_thiet_bi}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.ngay_bao_tri}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.loai_bao_tri}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.khach_hang}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.dia_diem}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.nhan_vien_phu_trach}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.mo_ta}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.ket_qua}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleEditClick(row)}
                            sx={{
                              minWidth: { xs: 70, sm: 100 },
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              px: { xs: 1, sm: 2 },
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                        </TableCell>
                        {columns.map((col) => (
                          <TableCell
                            key={col}
                            sx={{
                              padding: { xs: "8px 12px", sm: "16px 24px" },
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row[col]}
                          </TableCell>
                        ))}
                        <TableCell
                          sx={{
                            padding: { xs: "8px 12px", sm: "16px 24px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            whiteSpace: "nowrap",
                          }}
                        >
                          <QRCode
                            value={`https://ebaotri.hoangphucthanh.vn/index.php?id=${row.id_thiet_bi}/${encodeURIComponent(
                              row.dia_diem
                            )}`}
                            size={isMobile ? 48 : 64}
                            level="L"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={10 + columns.length}
                        align="center"
                        sx={{
                          padding: { xs: "8px 12px", sm: "16px 24px" },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 3,
        }}
      >
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, v) => {
            setCurrentPage(v);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          color="primary"
          size={isMobile ? "small" : "medium"}
        />
      </Box>
    </>
  );
}

export default TableSection;