import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
} from "@mui/material";

function EditDialog({
  editDialogOpen,
  handleEditClose,
  editFormData,
  setEditFormData,
  handleSave,
  handleInputChange,
  isMobile,
}) {
  return (
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
            "dia_diem:Khu Vực:text",
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
  );
}

export default EditDialog;