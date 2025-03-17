import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
} from "@mui/material";

function FilterDialog({
  filterDialogOpen,
  handleFilterClose,
  filterCriteria,
  handleFilterChange,
  handleFilterApply,
  handleFilterClear,
  loaiBaoTriOptions,
  moTaOptions,
  ketQuaOptions,
  isMobile,
}) {
  return (
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
  );
}

export default FilterDialog;