import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
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
  Checkbox,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import QRCode from "react-qr-code";

function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const [searchId, setSearchId] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
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

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    loai_bao_tri: [],
    nguyen_nhan_hu_hong: [],
    ket_qua: [],
    startDate: "",
    endDate: "",
    mo_ta: [],
  });

  const [loaiBaoTriOptions, setLoaiBaoTriOptions] = useState([]);
  const [moTaOptions, setMoTaOptions] = useState([]);
  const [ketQuaOptions, setKetQuaOptions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("https://ebaotri.hoangphucthanh.vn/index.php?all_data");
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setFilteredData(result.data);
        const uniqueLoaiBaoTri = [...new Set(result.data.map((item) => item.loai_bao_tri).filter(Boolean))];
        const uniqueMoTa = [...new Set(result.data.map((item) => item.mo_ta).filter(Boolean))];
        const uniqueKetQua = [...new Set(result.data.map((item) => item.ket_qua).filter(Boolean))];
        setLoaiBaoTriOptions(uniqueLoaiBaoTri);
        setMoTaOptions(uniqueMoTa);
        setKetQuaOptions(uniqueKetQua);
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
        const responseData = await res.json();
        if (!responseData.success) throw new Error("Import failed");
      }
      setImportStatus({ loading: false, error: null, success: true });
      fetchData();
      setTimeout(handleImportClose, 2000);
    } catch (error) {
      setImportStatus({ loading: false, error: error.message, success: false });
    }
  };

  useEffect(() => {
    let filtered = [...data];
    if (searchId) {
      filtered = filtered.filter((row) =>
        String(row.id_thiet_bi).toLowerCase().includes(searchId.toLowerCase())
      );
    }
    if (Array.isArray(filterCriteria.loai_bao_tri) && filterCriteria.loai_bao_tri.length > 0) {
      filtered = filtered.filter((row) =>
        filterCriteria.loai_bao_tri.includes(row.loai_bao_tri)
      );
    }
    if (Array.isArray(filterCriteria.mo_ta) && filterCriteria.mo_ta.length > 0) {
      filtered = filtered.filter((row) => filterCriteria.mo_ta.includes(row.mo_ta));
    }
    if (Array.isArray(filterCriteria.ket_qua) && filterCriteria.ket_qua.length > 0) {
      filtered = filtered.filter((row) => filterCriteria.ket_qua.includes(row.ket_qua));
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
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
  }, [searchId, filterCriteria, data]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage]);

  const handleFilterClick = () => setFilterDialogOpen(true);
  const handleFilterClose = () => setFilterDialogOpen(false);
  const handleFilterApply = () => setFilterDialogOpen(false);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (Array.isArray(filterCriteria[name])) {
      const newValue = typeof value === "string" ? value.split(",") : value;
      setFilterCriteria((prev) => ({ ...prev, [name]: newValue }));
    } else {
      setFilterCriteria((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleFilterClear = () => {
    setFilterCriteria({
      loai_bao_tri: [],
      nguyen_nhan_hu_hong: [],
      ket_qua: [],
      startDate: "",
      endDate: "",
      mo_ta: [],
    });
    setSearchId("");
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Search Bar and Filter Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          label="Tìm kiếm theo ID Thiết Bị"
          variant="outlined"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          sx={{
            flex: 1,
            maxWidth: { xs: "100%", sm: 500 },
            backgroundColor: "#fff",
            "& .MuiInputBase-root": { fontSize: { xs: "0.875rem", sm: "1rem" } },
          }}
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={handleFilterClick}
          sx={{
            minWidth: { xs: "100%", sm: 100 },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            px: 2,
            py: 1,
          }}
        >
          Filter
        </Button>
      </Box>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={handleFilterClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          Filter Options
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                Loại Bảo Trì
              </InputLabel>
              <Select
                multiple
                name="loai_bao_tri"
                value={
                  Array.isArray(filterCriteria.loai_bao_tri)
                    ? filterCriteria.loai_bao_tri
                    : []
                }
                onChange={handleFilterChange}
                renderValue={(selected) => selected.join(", ")}
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                {loaiBaoTriOptions.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    <Checkbox
                      checked={
                        Array.isArray(filterCriteria.loai_bao_tri) &&
                        filterCriteria.loai_bao_tri.indexOf(type) > -1
                      }
                      size={isMobile ? "small" : "medium"}
                    />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                Mô Tả
              </InputLabel>
              <Select
                multiple
                name="mo_ta"
                value={Array.isArray(filterCriteria.mo_ta) ? filterCriteria.mo_ta : []}
                onChange={handleFilterChange}
                renderValue={(selected) => selected.join(", ")}
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                {moTaOptions.map((desc) => (
                  <MenuItem
                    key={desc}
                    value={desc}
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    <Checkbox
                      checked={
                        Array.isArray(filterCriteria.mo_ta) &&
                        filterCriteria.mo_ta.indexOf(desc) > -1
                      }
                      size={isMobile ? "small" : "medium"}
                    />
                    <ListItemText primary={desc} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                Kết Quả Bảo Trì
              </InputLabel>
              <Select
                multiple
                name="ket_qua"
                value={Array.isArray(filterCriteria.ket_qua) ? filterCriteria.ket_qua : []}
                onChange={handleFilterChange}
                renderValue={(selected) => selected.join(", ")}
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                {ketQuaOptions.map((result) => (
                  <MenuItem
                    key={result}
                    value={result}
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    <Checkbox
                      checked={
                        Array.isArray(filterCriteria.ket_qua) &&
                        filterCriteria.ket_qua.indexOf(result) > -1
                      }
                      size={isMobile ? "small" : "medium"}
                    />
                    <ListItemText primary={result} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleFilterClear}
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Xóa bộ lọc
          </Button>
          <Button
            variant="contained"
            onClick={handleFilterApply}
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import and Export Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", sm: "flex-end" },
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleImportClick}
          sx={{
            minWidth: { xs: 90, sm: 100 },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            px: 2,
            py: 1,
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          Import
        </Button>
        <Dialog open={importDialogOpen} onClose={handleImportClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Import CSV File
          </DialogTitle>
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
                <Button
                  variant="contained"
                  component="span"
                  fullWidth
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, py: 1 }}
                >
                  Select CSV File
                </Button>
              </label>
              {selectedFile && (
                <Typography sx={{ mt: 2, fontSize: { xs: "0.75rem", sm: "1rem" } }}>
                  Selected file: {selectedFile.name}
                </Typography>
              )}
              {importStatus.loading && (
                <Typography
                  sx={{ mt: 2, color: "text.secondary", fontSize: { xs: "0.75rem", sm: "1rem" } }}
                >
                  Importing...
                </Typography>
              )}
              {importStatus.error && (
                <Typography
                  sx={{ mt: 2, color: "error.main", fontSize: { xs: "0.75rem", sm: "1rem" } }}
                >
                  {importStatus.error}
                </Typography>
              )}
              {importStatus.success && (
                <Typography
                  sx={{ mt: 2, color: "success.main", fontSize: { xs: "0.75rem", sm: "1rem" } }}
                >
                  Import completed!
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleImportClose}
              size={isMobile ? "small" : "medium"}
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              variant="contained"
              color="primary"
              disabled={!selectedFile || importStatus.loading}
              size={isMobile ? "small" : "medium"}
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
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
            link.download = `bao-tri-thiet-bi-${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
          }}
          sx={{
            minWidth: { xs: 90, sm: 100 },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            px: 2,
            py: 1,
            backgroundColor: "#ab47bc",
            "&:hover": { backgroundColor: "#9c27b0" },
          }}
        >
          Export
        </Button>
      </Box>

      {/* Main Content with Grid */}
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

      {/* Pagination */}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          Chỉnh sửa thông tin bảo trì
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ py: 2 }}>
            {[
              "id_thiet_bi:ID Thiết Bị",
              "ngay_bao_tri:Ngày Bảo Trì:date",
              "loai_bao_tri:Loại Bảo Trì",
              "dia_diem:Khu Vực:text", // Thêm trường "Khu vực" thay cho "Chi phí"
              "nhan_vien_phu_trach:Nhân Viên Phụ Trách",
              "mo_ta:Mô Tả::3",
              "ket_qua:Kết Quả::3",
            ].map((field) => {
              const [name, label, type, rows] = field.split(":");
              return (
                <Grid item xs={12} sm={6} key={name}>
                  <TextField
                    name={name}
                    label={label}
                    type={type || "text"}
                    value={editFormData[name] || ""}
                    onChange={handleInputChange}
                    fullWidth
                    multiline={!!rows}
                    rows={rows}
                    InputLabelProps={type === "date" ? { shrink: true } : undefined}
                    sx={{
                      "& .MuiInputBase-root": { fontSize: { xs: "0.875rem", sm: "1rem" } },
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleEditClose}
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Field */}
      <Box
        sx={{
          mt: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <TextField
          label="Nhập tên trường mới"
          variant="outlined"
          value={newField}
          onChange={(e) => setNewField(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiInputBase-root": { fontSize: { xs: "0.875rem", sm: "1rem" } },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddColumn}
          sx={{
            minWidth: { xs: "100%", sm: 150 },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            py: 1,
          }}
        >
          Thêm trường
        </Button>
      </Box>
    </Box>
  );
}

export default Home;