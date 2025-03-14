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
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import QRCode from "react-qr-code";

const useStyles = makeStyles({
  root: { padding: 24, backgroundColor: "#f5f5f5" },
  contentContainer: { display: "flex", gap: 24, alignItems: "flex-start" },
  tableContainer: {
    flex: 1,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  searchBar: { marginBottom: 24, width: "100%", maxWidth: 500 },
  tableHeader: { backgroundColor: "#f8f9fa" },
  tableCell: { padding: "16px 24px" },
  editButton: { minWidth: 100 },
});

function Home() {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Thêm state totalPages
  const [paginatedData, setPaginatedData] = useState([]); // Thêm state paginatedData
  const [columns, setColumns] = useState([]);
  const [newField, setNewField] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importStatus, setImportStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });
  const fileInputRef = React.useRef(null);
  const ITEMS_PER_PAGE = 10;

  // State cho tính năng lọc
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    loai_bao_tri: "",
    nguyen_nhan_hu_hong: "",
    ket_qua: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("https://ebaotri.hoangphucthanh.vn/index.php?all_data");
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setFilteredData(result.data); // Khởi tạo filteredData với dữ liệu gốc
      }
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
      [newField]: "",
    };
    try {
      const res = await fetch("https://ebaotri.hoangphucthanh.vn/index.php?add_extended", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const result = await res.json();
      if (result.success) {
        setColumns([...columns, newField]);
        setNewField("");
        fetchData();
      } else {
        console.error("Failed to add column:", result.message);
      }
    } catch (error) {
      console.error("Error adding column:", error);
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

  const handleInputChange = (e) => {
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch("https://ebaotri.hoangphucthanh.vn/index.php?update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const result = await res.json();
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

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const handleImportClick = () => setImportDialogOpen(true);
  const handleImportClose = () => {
    setImportDialogOpen(false);
    setSelectedFile(null);
    setImportStatus({ loading: false, error: null, success: false });
  };

  const handleImport = async () => {
    if (!selectedFile)
      return setImportStatus({ loading: false, error: "Vui lòng chọn file CSV", success: false });
    setImportStatus({ loading: true, error: null, success: false });
    try {
      const text = await selectedFile.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",");
      const dataRows = lines.slice(1).filter((line) => line.trim());
      for (const row of dataRows) {
        const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const rowData = Object.fromEntries(
          headers.map((h, i) => [h.trim(), values[i]?.trim().replace(/^"|"$/g, "") || ""])
        );
        const res = await fetch("https://ebaotri.hoangphucthanh.vn/index.php?add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rowData),
        });
        if (!(await res.json()).success) throw new Error("Import failed");
      }
      setImportStatus({ loading: false, error: null, success: true });
      fetchData();
      setTimeout(handleImportClose, 2000);
    } catch (error) {
      setImportStatus({ loading: false, error: error.message, success: false });
    }
  };

  // Logic lọc dữ liệu
  useEffect(() => {
    let filtered = [...data];

    if (searchId) {
      filtered = filtered.filter((row) =>
        String(row.id_thiet_bi).toLowerCase().includes(searchId.toLowerCase())
      );
    }
    if (filterCriteria.loai_bao_tri) {
      filtered = filtered.filter(
        (row) => row.loai_bao_tri === filterCriteria.loai_bao_tri
      );
    }
    if (filterCriteria.nguyen_nhan_hu_hong) {
      filtered = filtered.filter(
        (row) => row.nguyen_nhan_hu_hong === filterCriteria.nguyen_nhan_hu_hong
      );
    }
    if (filterCriteria.ket_qua) {
      filtered = filtered.filter((row) => row.ket_qua === filterCriteria.ket_qua);
    }
    if (filterCriteria.startDate) {
      filtered = filtered.filter(
        (row) => new Date(row.ngay_bao_tri) >= new Date(filterCriteria.startDate)
      );
    }
    if (filterCriteria.endDate) {
      filtered = filtered.filter(
        (row) => new Date(row.ngay_bao_tri) <= new Date(filterCriteria.endDate)
      );
    }

    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // Reset về trang 1 khi lọc
  }, [searchId, filterCriteria, data]);

  // Cập nhật dữ liệu phân trang
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage]);

  // Xử lý lọc
  const handleFilterClick = () => setFilterDialogOpen(true);
  const handleFilterClose = () => setFilterDialogOpen(false);
  const handleFilterApply = () => setFilterDialogOpen(false);
  const handleFilterChange = (e) => {
    setFilterCriteria((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleFilterClear = () => {
    setFilterCriteria({
      loai_bao_tri: "",
      nguyen_nhan_hu_hong: "",
      ket_qua: "",
      startDate: "",
      endDate: "",
    });
    setSearchId(""); // Xóa tìm kiếm nếu cần
  };

  return (
    <Box className={classes.root}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <TextField
          label="Tìm kiếm theo ID Thiết Bị"
          variant="outlined"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className={classes.searchBar}
          sx={{ backgroundColor: "#fff" }}
        />
        <Button variant="outlined" color="primary" onClick={handleFilterClick}>
          Filter
        </Button>
      </Box>

      {/* Dialog Filter */}
      <Dialog open={filterDialogOpen} onClose={handleFilterClose} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Options</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Loại Bảo Trì</InputLabel>
              <Select
                name="loai_bao_tri"
                value={filterCriteria.loai_bao_tri}
                onChange={handleFilterChange}
                label="Loại Bảo Trì"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Định kỳ">Định kỳ</MenuItem>
                <MenuItem value="Đột xuất">Đột xuất</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Nguyên Nhân Hư Hỏng</InputLabel>
              <Select
                name="nguyen_nhan_hu_hong"
                value={filterCriteria.nguyen_nhan_hu_hong}
                onChange={handleFilterChange}
                label="Nguyên Nhân Hư Hỏng"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Lỗi máy móc">Lỗi máy móc</MenuItem>
                <MenuItem value="Lỗi hệ thống">Lỗi hệ thống</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Kết Quả Bảo Trì</InputLabel>
              <Select
                name="ket_qua"
                value={filterCriteria.ket_qua}
                onChange={handleFilterChange}
                label="Kết Quả Bảo Trì"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Hoạt động tốt">Hoạt động tốt</MenuItem>
                <MenuItem value="Không hoạt động">Không hoạt động</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Ngày Bắt Đầu"
                type="date"
                name="startDate"
                value={filterCriteria.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Ngày Kết Thúc"
                type="date"
                name="endDate"
                value={filterCriteria.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilterClear}>Xóa bộ lọc</Button>
          <Button variant="contained" onClick={handleFilterApply}>
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleImportClick}>
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
                style={{ display: "none" }}
                id="contained-button-file"
              />
              <label htmlFor="contained-button-file">
                <Button variant="contained" component="span">
                  Select CSV File
                </Button>
              </label>
              {selectedFile && (
                <Typography sx={{ mt: 2 }}>Selected file: {selectedFile.name}</Typography>
              )}
              {importStatus.loading && (
                <Typography sx={{ mt: 2, color: "text.secondary" }}>Importing...</Typography>
              )}
              {importStatus.error && (
                <Typography sx={{ mt: 2, color: "error.main" }}>{importStatus.error}</Typography>
              )}
              {importStatus.success && (
                <Typography sx={{ mt: 2, color: "success.main" }}>Import completed!</Typography>
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
              ...columns,
            ];
            const csvContent = [
              headers.join(","),
              ...filteredData.map((row) =>
                [
                  row.id_bao_tri,
                  row.id_thiet_bi,
                  row.ngay_bao_tri,
                  row.loai_bao_tri,
                  row.khach_hang,
                  row.dia_diem,
                  row.nhan_vien_phu_trach,
                  `"${(row.mo_ta || "").replace(/"/g, '""')}"`,
                  `"${(row.ket_qua || "").replace(/"/g, '""')}"`,
                  ...columns.map((col) => `"${(row[col] || "").replace(/"/g, '""')}"`),
                ].join(",")
              ),
            ].join("\n");
            const link = document.createElement("a");
            link.href = encodeURI("data:text/csv;charset=utf-8," + csvContent);
            link.download = `bao-tri-thiet-bi-${new Date()
              .toISOString()
              .slice(0, 10)}.csv`;
            link.click();
          }}
        >
          Export
        </Button>
      </Box>

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
                    <TableCell key={col} className={classes.tableCell}>
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
                      <TableCell className={classes.tableCell}>
                        {row.id_bao_tri}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.id_thiet_bi}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.ngay_bao_tri}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.loai_bao_tri}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.khach_hang}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.dia_diem}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.nhan_vien_phu_trach}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.mo_ta}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {row.ket_qua}
                      </TableCell>
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
                          value={`https://ebaotri.hoangphucthanh.vn/index.php?id=${row.id_thiet_bi}/${encodeURIComponent(
                            row.dia_diem
                          )}`}
                          size={64}
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
                      className={classes.tableCell}
                    >
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, v) => {
            setCurrentPage(v);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          color="primary"
        />
      </Box>
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa thông tin bảo trì</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, py: 2 }}>
            {[
              "id_thiet_bi:ID Thiết Bị",
              "ngay_bao_tri:Ngày Bảo Trì:date",
              "loai_bao_tri:Loại Bảo Trì",
              "chi_phi:Chi Phí:number",
              "nhan_vien_phu_trach:Nhân Viên Phụ Trách",
              "mo_ta:Mô Tả::3",
              "ket_qua:Kết Quả::3",
            ].map((field) => {
              const [name, label, type, rows] = field.split(":");
              return (
                <TextField
                  key={name}
                  name={name}
                  label={label}
                  type={type || "text"}
                  value={editFormData[name] || ""}
                  onChange={handleInputChange}
                  fullWidth
                  multiline={!!rows}
                  rows={rows}
                  InputLabelProps={type === "date" ? { shrink: true } : undefined}
                />
              );
            })}
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