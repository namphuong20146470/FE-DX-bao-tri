import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import { ImportOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import '../LoaiHang/LoaiHang_Table.css';
import LoaiHang_Import from '../LoaiHang/LoaiHang_Import';
import LoaiHang_Export from '../LoaiHang/LoaiHang_Export';

const BangLoaiHang = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProductTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://192.168.0.252:3000/maintenance/product-types', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      const dataArray = result?.data || [];

      if (Array.isArray(dataArray)) {
        const dataWithSTT = dataArray.map((item, index) => ({
          ...item,
          stt: index + 1,
        }));
        setData(dataWithSTT);
        setFilteredData(dataWithSTT);
      } else {
        message.error('Dữ liệu trả về không đúng định dạng');
      }
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
      stt: lastSTT + index + 1,
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

  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: "2%" },
    { title: 'Mã loại hàng', dataIndex: 'ma_loai_hang', key: 'ma_loai_hang', width: "10%" },
    { title: 'Tên loại hàng', dataIndex: 'ten_loai_hang', key: 'ten_loai_hang', width: "20%" },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai', width: "10%" },
    { title: 'Người cập nhật', dataIndex: 'nguoi_cap_nhat', key: 'nguoi_cap_nhat', width: "10%" },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'ngay_cap_nhat',
      key: 'ngay_cap_nhat',
      render: (text) => {
        const date = new Date(text);
        return date.toLocaleDateString('vi-VN');
      },
      width: "10%"
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
      <div className="bang-loai-hang-header">
        <h2 className="bang-loai-hang-title">Loại Hàng</h2>
        <div className="bang-loai-hang-actions">
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
        dataSource={filteredData}
        rowKey="ma_loai_hang"
        bordered
        size="small"
        pagination={{
          total: filteredData.length,
          pageSize: 20,
          showSizeChanger: false,
          position: ['bottomCenter'],
        }}
        className="bang-loai-hang-table"
        loading={loading}
      />
    </div>
  );
};

export default BangLoaiHang;
