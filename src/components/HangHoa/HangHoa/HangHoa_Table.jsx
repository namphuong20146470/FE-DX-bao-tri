import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import { ImportOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import '../HangHoa/HangHoa_Table.css';
import HangHoa_Import from '../HangHoa/HangHoa_Import';
import HangHoa_Export from '../HangHoa/HangHoa_Export';

const BangHangHoa = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [productTypes, setProductTypes] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const fetchProductTypes = async () => {
        try {
          const res = await fetch('https://192.168.0.252:3000/maintenance/product-types');
          const data = await res.json();
          setProductTypes(data.data || []);
        } catch (error) {
          message.error('Không thể tải dữ liệu loại hàng');
        }
    };
      
    const fetchSuppliers = async () => {
        try {
            const res = await fetch('https://192.168.0.252:3000/maintenance/suppliers');
            const data = await res.json();
            setSuppliers(data.data || []);
        } catch (error) {
            message.error('Không thể tải dữ liệu nhà cung cấp');
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
          const response = await fetch('https://192.168.0.252:3000/maintenance/products');
          if (!response.ok) throw new Error(`Status: ${response.status}`);
          const result = await response.json();
          const dataArray = result?.data || [];
    
          const dataWithNames = dataArray.map((item, index) => ({
            ...item,
            stt: index + 1,
            ten_loai_hang: productTypes.find(pt => pt.ma_loai_hang === item.ten_loai_hang)?.ten_loai_hang || item.ten_loai_hang,
            ten_nha_cung_cap: suppliers.find(sp => sp.ma_nha_cung_cap === item.ten_nha_cung_cap)?.ten_nha_cung_cap || item.ten_nha_cung_cap,
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

    //Đảm bảo mapping chính xác sau khi load dữ liệu phụ
    useEffect(() => {
        const loadAll = async () => {
            await Promise.all([fetchProductTypes(), fetchSuppliers()]);
            await fetchProducts();
        };
        loadAll();
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

    const handleExport = () => {
        HangHoa_Export(data);
    };
    

    const handleEdit = (record) => {
        console.log("Sửa:", record);
    };

    const handleRemove = (record) => {
        console.log("Xóa:", record);
    };

    const columns = [
        { title: 'STT', dataIndex: 'stt', key: 'stt', width: "2%" },
        { title: 'Mã hàng', dataIndex: 'ma_hang', key: 'ma_hang', width: "6%" },
        { title: 'Tên hàng', dataIndex: 'ten_hang', key: 'ten_hang', width: "15%" },
        { title: 'Loại hàng', dataIndex: 'ten_loai_hang', key: 'ten_loai_hang', width: "10%" },
        { title: 'Nhà cung cấp', dataIndex: 'ten_nha_cung_cap', key: 'ten_nha_cung_cap', width: "6%" },
        { title: 'Nước xuất xứ', dataIndex: 'nuoc_xuat_xu', key: 'nuoc_xuat_xu', width: "6%" },
        { title: 'Trọng lượng', dataIndex: 'trong_luong_tinh', key: 'trong_luong_tinh', width: "5%" },
        { title: 'Giá thực', dataIndex: 'gia_thuc', key: 'gia_thuc', width: "5%" },
        { title: 'Đơn vị', dataIndex: 'don_vi_ban_hang', key: 'don_vi_ban_hang', width: "4%" },
        { title: 'Tình trạng', dataIndex: 'tinh_trang_hang_hoa', key: 'tinh_trang_hang_hoa', width: "6%" },
        { title: 'Người cập nhật', dataIndex: 'nguoi_cap_nhat', key: 'nguoi_cap_nhat', width: "8%" },
        {
        title: 'Ngày cập nhật',
        dataIndex: 'ngay_cap_nhat',
        key: 'ngay_cap_nhat',
        render: (text) => {
            const date = new Date(text);
            return date.toLocaleDateString('vi-VN');
        },
        width: "6%",
        },
        { title: 'Mô tả', dataIndex: 'mo_ta', key: 'mo_ta', width: "20%" },
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
        <div className="bang-hang-hoa-container">
        <div className="bang-hang-hoa-header">
            <h2 className="bang-hang-hoa-title">Danh mục hàng hóa</h2>
            <div className="bang-hang-hoa-actions">
            <Button icon={<ImportOutlined />} onClick={() => document.getElementById('import-excel').click()}>
                Nhập File
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
                Xuất File
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
                Thêm mới
            </Button>
            </div>
            <HangHoa_Import onImport={handleImportedData} />
        </div>

        <div className="bang-hang-hoa-scroll-wrapper">
            <div className="bang-hang-hoa-table">
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="ma_hang"
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
        </div>
        </div>
    );
};

export default BangHangHoa;
