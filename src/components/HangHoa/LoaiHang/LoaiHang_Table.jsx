import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import { ImportOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import '../../utils/css/Custom-Table.css';
import './LoaiHang_Table.css';
import LoaiHang_Import from './LoaiHang_Import';
import LoaiHang_Export from './LoaiHang_Export';
import { formatDate } from '../../utils/format';
import axios from '../../utils/axiosConfig';
import PaginationControl from '../../utils/PaginationControl';  // Import component phân trang

const BangLoaiHang = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(5);  // State cho số dòng mỗi trang
    const [currentPage, setCurrentPage] = useState(1);  // State cho trang hiện tại

    const fetchProductTypes = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/product-types');
            const dataArray = res?.data?.data || [];
            const dataWithNames = dataArray.map((item, index) => ({
                ...item,
                stt: index + 1,
            }));
            setData(dataWithNames);
            setFilteredData(dataWithNames);
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            message.error('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const handleImportedData = (importedData) => {
    const lastSTT = data.length > 0 ? data[data.length - 1].stt : 0;
    const dataWithSTT = importedData.map((item, index) => ({
      ...item,
      stt: index + 1,
    }));
    const newData = [...data, ...dataWithSTT];
    setData(newData);
    setFilteredData(newData);
    message.success('Import thành công!');
  };

  const handleEdit = (record) => {
    console.log("Sửa:", record);
  };

  const handleRemove = (record) => {
    console.log("Xóa:", record);
  };

  const handlePageChange = (page, pageSize) => {
      setCurrentPage(page);
      setPageSize(pageSize);
  };

  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "2%" },
    { title: 'Mã loại hàng', dataIndex: 'ma_loai_hang', key: 'ma_loai_hang', width: "10%" },
    { title: 'Tên loại hàng', dataIndex: 'ten_loai_hang', key: 'ten_loai_hang', width: "20%" },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai', width: "10%" },
    { title: 'Người cập nhật', dataIndex: ['accounts', 'ho_va_ten'], key: 'nguoi_cap_nhat', width: "10%" },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'ngay_cap_nhat',
      key: 'ngay_cap_nhat',
      render: (text) => formatDate(text),
      width: "10%",
    },
    { title: 'Mô tả', dataIndex: 'mo_ta', key: 'mo_ta', width: "28%" },
    {
      title: 'Hành động',
      key: 'hanh_dong',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button type="primary" danger size="small" onClick={() => handleRemove(record)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bang-loai-hang-container">
      <div className="area-header">
        <h2 className="custom-title">Loại Hàng</h2>
        <div className="button-level1">
          <Button icon={<ImportOutlined />} onClick={() => document.getElementById('import-excel').click()}>
            Nhập File
          </Button>
          <Button icon={<ExportOutlined />} onClick={() => LoaiHang_Export(data)}>
            Xuất File
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm mới
          </Button>
        </div>
        <LoaiHang_Import onImport={handleImportedData} />
      </div>
      <Table
        columns={columns}
        dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        rowKey="ma_loai_hang"
        bordered
        size="small"
        pagination={false} // Tắt pagination trong Table
        className="custom-ant-table"
        loading={loading}
      />

      {/* Phân trang và lựa chọn số dòng */}
      <PaginationControl
        total={filteredData.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSizeChange={handlePageChange}
      />
    </div>
  );
};

export default BangLoaiHang;
