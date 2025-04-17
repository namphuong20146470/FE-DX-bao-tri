import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Input, Select, Pagination } from 'antd';
import { ImportOutlined, ExportOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import '../utils/css/Custom-Table.css';
import '../utils/css/Custom-Button.css';
import './NCC_Table.css';
import NhaCungCap_Import from './NCC_Import';
import NhaCungCap_Export from './NCC_Export';
import { formatDate } from '../utils/format';
import { filterData, getUniqueValues } from '../NhaCungCap/NCC_Filter';
import axios from '../utils/axiosConfig';
import PaginationControl from '../utils/PaginationControl';  // Import component phân trang

const { Option } = Select;

const BangNhaCungCap = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [pageSize, setPageSize] = useState(5);  // State cho số dòng mỗi trang
    const [currentPage, setCurrentPage] = useState(1);  // State cho trang hiện tại

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/suppliers');
            const dataArray = res?.data?.data || [];
            const dataWithNames = dataArray.map((item, index) => ({
                ...item,
                stt: index + 1,
            }));
            setData(dataWithNames);
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            message.error('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleImportedData = (importedData) => {
        const lastSTT = data.length > 0 ? data[data.length - 1].stt : 0;
        const dataWithSTT = importedData.map((item, index) => ({
            ...item,
            stt: lastSTT + index + 1,
        }));
        const newData = [...data, ...dataWithSTT];
        setData(newData);
        message.success('Import thành công!');
    };

    const handleExport = () => {
        try {
            NhaCungCap_Export(data);
        } catch (err) {
            message.error('Xuất file thất bại!');
            console.error(err);
        }
    };

    const handleEdit = (record) => {
        console.log('Sửa:', record);
    };

    const handleRemove = (record) => {
        console.log('Xóa:', record);
    };

    const filteredData = filterData(data, {
        searchTerm,
        statusFilter,
        countryFilter,
    });

    const uniqueStatus = getUniqueValues(data, (item) => item.trang_thai);
    const uniqueCountries = getUniqueValues(data, (item) => item.quoc_gia);
    
    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const columns = [
        { title: 'STT', dataIndex: 'stt', key: 'stt', width: "2%" },
        { title: 'Mã nhà cung cấp', dataIndex: 'ma_nha_cung_cap', key: 'ma_nha_cung_cap', width: "4%" },
        { title: 'Tên nhà cung cấp', dataIndex: 'ten_nha_cung_cap', key: 'ten_nha_cung_cap', width: "6%" },
        { title: 'Số điện thoại', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai', width: "6%" },
        { title: 'Email', dataIndex: 'email', key: 'email', width: "8%" },
        { title: 'Địa chỉ', dataIndex: 'dia_chi', key: 'dia_chi', width: "18%" },
        { title: 'Quốc gia', dataIndex: 'quoc_gia', key: 'quoc_gia', width: "6%" },
        { title: 'Mã số thuế', dataIndex: 'ma_so_thue', key: 'ma_so_thue', width: "6%" },
        { title: 'Trang website', dataIndex: 'trang_website', key: 'trang_website', width: "8%" },
        { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'trang_thai', width: "6%" },
        {
            title: 'Ngày thêm vào',
            dataIndex: 'ngay_them_vao',
            key: 'ngay_them_vao',
            render: (text) => formatDate(text),
            width: "6%",
        },
        {
            title: 'Hành động',
            key: 'hanh_dong',
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button type="primary" danger size="small" onClick={() => handleRemove(record)}>Xóa</Button>
                </Space>
            ),
            width: "6%",
        },
        { title: 'Tổng nợ phải trả', dataIndex: 'tong_no_phai_tra', key: 'tong_no_phai_tra', width: "6%" },
        { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', width: "10%" },
    ];

    return (
        <div className="bang-nha-cung-cap-container">
            <div className="area-header">
                <h2 className="custom-title">Nhà cung cấp</h2>
                <div className="button-level1">
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
                <NhaCungCap_Import onImport={handleImportedData} />
            </div>

            <div className="bang-nha-cung-cap-filters">
                <Input
                    placeholder="Tìm kiếm theo mã hoặc tên nhà cung cấp"
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                    placeholder="Lọc theo trạng thái"
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                >
                    <Option value="all">Trạng thái</Option>
                    {uniqueStatus.map((status) => (
                        <Option key={status} value={status}>
                            {status}
                        </Option>
                    ))}
                </Select>
                <Select
                    placeholder="Lọc theo quốc gia"
                    value={countryFilter}
                    onChange={(value) => setCountryFilter(value)}
                >
                    <Option value="all">Quốc gia</Option>
                    {uniqueCountries.map((country) => (
                        <Option key={country} value={country}>
                            {country}
                        </Option>
                    ))}
                </Select>
                <Button icon={<ReloadOutlined />} onClick={fetchSuppliers} loading={loading}>
                    Làm mới
                </Button>
            </div>

            <div className="bang-nha-cung-cap-scroll-wrapper">
              <div style={{ width: 1800 }}>
                  <Table
                      columns={columns}
                      dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                      rowKey="ma_nha_cung_cap"
                      bordered
                      size="small"
                      pagination={false} // Tắt pagination trong Table
                      className="custom-ant-table"
                      loading={loading}
                  />
                </div>
            </div>

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

export default BangNhaCungCap;
