import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

function ImportDialog({
  importDialogOpen,
  handleImportClose,
  selectedFile,
  setSelectedFile,
  importStatus,
  setImportStatus,
  handleFileChange,
  handleImport,
  fileInputRef,
  filteredData,
  columns,
  isMobile,
  handleImportClick,
}) {
  return (
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
  );
}

export default ImportDialog;