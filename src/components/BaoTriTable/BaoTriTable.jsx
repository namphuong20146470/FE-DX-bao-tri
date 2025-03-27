import React, { useEffect, useState, useRef } from "react";
import { Table, Button, Input, Space, message, Modal, Form, Input as AntdInput } from "antd";
import { SearchOutlined } from "@ant-design/icons"; // Icon tìm kiếm của antd
import * as XLSX from "xlsx"; // Thư viện để đọc và ghi file Excel
import { saveAs } from "file-saver"; // Thư viện để lưu file

const API_URL = "https://ebaotri.hoangphucthanh.vn/index.php?loai_bao_tri";
const IMPORT_API_URL = "https://ebaotri.hoangphucthanh.vn/index.php?import_bao_tri";
const EDIT_API_URL = "https://ebaotri.hoangphucthanh.vn/index.php?edit_bao_tri";
const DELETE_API_URL = "https://ebaotri.hoangphucthanh.vn/index.php?delete_bao_tri";

const BaoTriTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Dữ liệu đã lọc
  const [searchText, setSearchText] = useState(""); // Giá trị tìm kiếm
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Trạng thái modal "Thêm mới"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Trạng thái modal "Chỉnh sửa"
  const [currentRecord, setCurrentRecord] = useState(null); // Bản ghi đang chỉnh sửa
  const [form] = Form.useForm(); // Form instance cho modal
  const fileInputRef = useRef(null); // Ref để điều khiển input file

  // Fetch dữ liệu từ API
  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.success) {
        // Thêm STT vào dữ liệu
        const dataWithSTT = result.data.map((item, index) => ({
          ...item,
          STT: index + 1, // Tạo STT tự động
        }));
        setData(dataWithSTT);
        setFilteredData(dataWithSTT); // Ban đầu, dữ liệu lọc giống dữ liệu gốc
      } else {
        message.error("Lỗi khi lấy dữ liệu: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu:", error);
      message.error("Lỗi khi lấy dữ liệu từ server!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý tìm kiếm theo Mã loại bảo trì
  const handleSearch = (value) => {
    setSearchText(value);
    if (value === "") {
      setFilteredData(data); // Nếu không có giá trị tìm kiếm, hiển thị toàn bộ dữ liệu
    } else {
      const filtered = data.filter((item) =>
        item.ma_loai_bao_tri
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setFilteredData(filtered); // Cập nhật dữ liệu đã lọc
    }
  };

  // Xử lý khi bấm nút "Sửa"
  const handleEdit = (record) => {
    setCurrentRecord(record);
    setIsEditModalOpen(true);
    form.setFieldsValue({
      ma_loai_bao_tri: record.ma_loai_bao_tri,
      loai_bao_tri: record.loai_bao_tri,
      trang_thai: record.trang_thai,
      nguoi_cap_nhat: record.nguoi_cap_nhat,
      ngay_cap_nhat: record.ngay_cap_nhat,
      mo_ta: record.mo_ta,
    });
  };

  // Xử lý submit form chỉnh sửa
  const handleEditSubmit = async (values) => {
    try {
      const updatedData = {
        id: currentRecord.id,
        ...values,
      };
      const response = await fetch(EDIT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();
      if (result.success) {
        message.success("Chỉnh sửa thành công!");
        setIsEditModalOpen(false);
        fetchData(); // Refresh bảng
      } else {
        message.error("Lỗi: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa:", error);
      message.error("Lỗi khi chỉnh sửa!");
    }
  };

  // Xử lý khi bấm nút "Xóa"
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      try {
        const response = await fetch(DELETE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });
        const result = await response.json();
        if (result.success) {
          message.success("Xóa thành công!");
          fetchData(); // Refresh bảng
        } else {
          message.error("Lỗi: " + result.message);
        }
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        message.error("Lỗi khi xóa!");
      }
    }
  };

  // Xử lý khi bấm nút "Thêm mới"
  const handleAddNew = () => {
    setIsAddModalOpen(true);
    form.resetFields();
  };

  // Xử lý submit form thêm mới
  const handleAddSubmit = async (values) => {
    try {
      const response = await fetch(IMPORT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success("Thêm mới thành công!");
        setIsAddModalOpen(false);
        fetchData(); // Refresh bảng
      } else {
        message.error("Lỗi: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi thêm mới:", error);
      message.error("Lỗi khi thêm mới!");
    }
  };

  // Xử lý export dữ liệu ra file Excel
  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      STT: item.STT,
      "Mã loại bảo trì": item.ma_loai_bao_tri,
      "Loại bảo trì": item.loai_bao_tri,
      "Trạng thái": item.trang_thai,
      "Người cập nhật": item.nguoi_cap_nhat,
      "Ngày cập nhật": item.ngay_cap_nhat,
      "Mô tả": item.mo_ta,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LoaiBaoTri");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "LoaiBaoTri.xlsx");
    message.success("Xuất file Excel thành công!");
  };

  // Xử lý import dữ liệu từ file Excel
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importData = jsonData.map((row) => ({
          ma_loai_bao_tri: row["Mã loại bảo trì"] || "",
          loai_bao_tri: row["Loại bảo trì"] || "",
          trang_thai: row["Trạng thái"] || "Hoạt động",
          nguoi_cap_nhat: row["Người cập nhật"] || "",
          ngay_cap_nhat: row["Ngày cập nhật"] || new Date().toISOString().split("T")[0],
          mo_ta: row["Mô tả"] || null,
        }));

        const response = await fetch(IMPORT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(importData),
        });

        const result = await response.json();
        if (result.success) {
          message.success(result.message);
          fetchData(); // Refresh bảng sau khi import
        } else {
          message.error("Lỗi khi import: " + result.message);
          if (result.details) {
            console.error("Chi tiết lỗi:", result.details);
          }
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Lỗi khi import file:", error);
      message.error("Lỗi khi import file Excel!");
    } finally {
      fileInputRef.current.value = null;
    }
  };

  // Định nghĩa các cột của bảng
  const columns = [
    { title: "STT", dataIndex: "STT", key: "STT" },
    { title: "Mã loại bảo trì", dataIndex: "ma_loai_bao_tri", key: "ma_loai_bao_tri" },
    { title: "Loại bảo trì", dataIndex: "loai_bao_tri", key: "loai_bao_tri" },
    { title: "Trạng thái", dataIndex: "trang_thai", key: "trang_thai" },
    { title: "Người cập nhật", dataIndex: "nguoi_cap_nhat", key: "nguoi_cap_nhat" },
    { title: "Ngày cập nhật", dataIndex: "ngay_cap_nhat", key: "ngay_cap_nhat" },
    { title: "Mô tả", dataIndex: "mo_ta", key: "mo_ta" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Tùy chỉnh style cho form
  const formItemStyle = {
    labelCol: { style: { color: "#000 !important" } }, // Màu chữ của label là đen
  };

  const inputStyle = {
    color: "#000 !important", // Màu chữ trong ô input là đen
    backgroundColor: "#fff !important", // Nền trắng
    borderColor: "#d9d9d9 !important", // Viền xám nhạt
    "-webkit-text-fill-color": "#000 !important", // Đảm bảo cho trình duyệt Webkit
  };

  const searchInputStyle = {
    color: "#000 !important", // Màu chữ trong ô tìm kiếm là đen
    backgroundColor: "#fff !important", // Nền trắng
    borderColor: "#d9d9d9 !important",
    "-webkit-text-fill-color": "#000 !important", // Đảm bảo cho trình duyệt Webkit
  };

  // CSS tùy chỉnh để đảm bảo màu chữ là đen
  const customStyles = `
    .custom-input,
    .custom-input input,
    .custom-input textarea,
    .custom-input input[type="date"],
    .custom-search input,
    .custom-input input::placeholder,
    .custom-input textarea::placeholder,
    .custom-search input::placeholder {
      color: #000 !important;
      background-color: #fff !important;
      -webkit-text-fill-color: #000 !important; /* Đảm bảo cho trình duyệt Webkit */
      opacity: 1 !important; /* Đảm bảo không bị mờ */
    }
    .ant-form-item-label > label {
      color: #000 !important; /* Đảm bảo màu chữ của label là đen */
    }
    .ant-table-thead th {
      color: #000 !important; /* Màu chữ tiêu đề bảng là đen */
    }
    .ant-table-cell {
      color: #000 !important; /* Màu chữ trong ô bảng là đen */
    }
    .ant-modal-title {
      color: #000 !important; /* Màu chữ tiêu đề modal là đen */
    }
    .ant-btn-default,
    .ant-btn-primary {
      color: #000 !important; /* Màu chữ của nút là đen */
    }
    .ant-input,
    .ant-input-affix-wrapper {
      color: #000 !important;
      background-color: #fff !important;
      -webkit-text-fill-color: #000 !important;
    }
    .ant-input::placeholder {
      color: #000 !important;
      -webkit-text-fill-color: #000 !important;
    }
  `;

  return (
    <div style={{ padding: "20px" }}>
      {/* Thêm style tùy chỉnh */}
      <style>{customStyles}</style>

      <h2 style={{ marginBottom: "20px", color: "#000" }}>Quản Lý Loại Bảo Trì</h2>

      {/* Ô tìm kiếm và các nút */}
      <Space style={{ marginBottom: "20px" }}>
        <Input
          placeholder="Tìm kiếm theo Mã loại bảo trì"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
          className="custom-search"
          style={searchInputStyle}
        />
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleImport}
          style={{ display: "none" }}
          ref={fileInputRef}
        />
        <Button
          style={{ backgroundColor: "#28a745", borderColor: "#28a745", color: "#000" }}
          onClick={() => fileInputRef.current.click()}
        >
          Nhập File
        </Button>
        <Button
          style={{ backgroundColor: "#28a745", borderColor: "#28a745", color: "#000" }}
          onClick={handleExport}
        >
          Xuất File
        </Button>
        <Button
          style={{ backgroundColor: "#28a745", borderColor: "#28a745", color: "#000" }}
          onClick={handleAddNew}
        >
          Thêm mới
        </Button>
      </Space>

      {/* Bảng dữ liệu */}
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Thêm mới */}
      <Modal
        title="Thêm mới loại bảo trì"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddSubmit}
          layout="vertical"
          {...formItemStyle}
        >
          <Form.Item
            name="ma_loai_bao_tri"
            label="Mã loại bảo trì"
            rules={[{ required: true, message: "Vui lòng nhập mã loại bảo trì!" }]}
          >
            <AntdInput className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="loai_bao_tri"
            label="Loại bảo trì"
            rules={[{ required: true, message: "Vui lòng nhập loại bảo trì!" }]}
          >
            <AntdInput className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="trang_thai"
            label="Trạng thái"
            initialValue="Hoạt động"
          >
            <AntdInput className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="nguoi_cap_nhat"
            label="Người cập nhật"
            rules={[{ required: true, message: "Vui lòng nhập người cập nhật!" }]}
          >
            <AntdInput className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="ngay_cap_nhat"
            label="Ngày cập nhật"
            initialValue={new Date().toISOString().split("T")[0]}
          >
            <AntdInput type="date" className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="mo_ta"
            label="Mô tả"
          >
            <AntdInput.TextArea className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", color: "#000" }}
            >
              Thêm mới
            </Button>
            <Button
              style={{ marginLeft: 8, backgroundColor: "#f0f0f0", borderColor: "#d9d9d9", color: "#000" }}
              onClick={() => setIsAddModalOpen(false)}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chỉnh sửa */}
      <Modal
        title="Chỉnh sửa loại bảo trì"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleEditSubmit}
          layout="vertical"
          {...formItemStyle}
        >
          <Form.Item
            name="ma_loai_bao_tri"
            label="Mã loại bảo trì"
            rules={[{ required: true, message: "Vui lòng nhập mã loại bảo trì!" }]}
          >
            <AntdInput className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="loai_bao_tri"
            label="Loại bảo trì"
            rules={[{ required: true, message: "Vui lòng nhập loại bảo trì!" }]}
          >
            <AntdInput className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="trang_thai"
            label="Trạng thái"
          >
            <AntdInput className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="nguoi_cap_nhat"
            label="Người cập nhật"
            rules={[{ required: true, message: "Vui lòng nhập người cập nhật!" }]}
          >
            <AntdInput className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="ngay_cap_nhat"
            label="Ngày cập nhật"
          >
            <AntdInput type="date" className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="mo_ta"
            label="Mô tả"
          >
            <AntdInput.TextArea className="custom-input" style={inputStyle} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", color: "#000" }}
            >
              Cập nhật
            </Button>
            <Button
              style={{ marginLeft: 8, backgroundColor: "#f0f0f0", borderColor: "#d9d9d9", color: "#000" }}
              onClick={() => setIsEditModalOpen(false)}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BaoTriTable;