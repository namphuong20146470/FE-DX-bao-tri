import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, message, Modal, Upload } from 'antd';
import { SearchOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import EditSupplier from './EditSupplier';
import RemoveSupplier from './RemoveSupplier';

// Add styles at the top of the file after the imports
const styles = `
  .black-text-input input {
    color: #000000 !important;
  }
  .black-text-input input::placeholder {
    color: rgba(0, 0, 0, 0.5) !important;
  }
`;

const SuppliersTable = ({ isNewSuppliers = false }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch suppliers data
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://192.168.0.252:3000/maintenance/suppliers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();

      if (Array.isArray(result)) {
        // Add STT to each record
        const dataWithSTT = result.map((item, index) => ({
          ...item,
          stt: index + 1,
        }));
        setData(dataWithSTT);
        setFilteredData(dataWithSTT);
      } else {
        message.error('Lỗi khi tải dữ liệu: Định dạng dữ liệu không hợp lệ');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      message.error('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Handle search and year filter
  const handleSearch = (value) => {
    setSearchText(value);
    filterData(value, selectedYear);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    filterData(searchText, value);
  };

  const filterData = (searchValue, year) => {
    let filtered = [...data];
    
    // Filter by search text if it exists
    if (searchValue) {
      const lowercaseSearch = searchValue.toLowerCase();
      filtered = filtered.filter(item => 
        item.ma_nha_cung_cap.toLowerCase().includes(lowercaseSearch) ||
        item.ten_nha_cung_cap.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    // Filter by year if it exists and is valid
    if (year && year.length === 4) {
      filtered = filtered.filter(item => {
        const itemYear = new Date(item.ngay_them_vao).getFullYear().toString();
        return itemYear === year;
      });
    }
    
    setFilteredData(filtered);
  };

  const handleEdit = (record) => {
    setSelectedSupplier(record);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    fetchSuppliers(); // Refresh the table data
  };

  const handleRemove = (record) => {
    setSelectedSupplier(record);
    setRemoveModalVisible(true);
  };

  const handleRemoveSuccess = () => {
    setRemoveModalVisible(false);
    fetchSuppliers(); // Refresh the table data
  };

  const handleRemoveCancel = () => {
    setRemoveModalVisible(false);
    setSelectedSupplier(null);
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Transform data to match API requirements
          const transformedData = jsonData.map(row => ({
            ma_nha_cung_cap: row['Mã Nhà Cung Cấp'] || '',
            ten_nha_cung_cap: row['Tên nhà cung cấp'] || '',
            so_dien_thoai: row['Số điện thoại'] || '',
            email: row['Email'] || '',
            dia_chi: row['Địa chỉ'] || '',
            quoc_gia: row['Quốc gia'] || '',
            ma_so_thue: row['Mã số thuế'] || '',
            trang_website: row['Trang website'] || '',
            trang_thai: row['Trạng thái'] || '',
            ngay_them_vao: row['Ngày thêm vào'] || new Date().toISOString(),
            ghi_chu: row['Ghi chú'] || ''
          }));

          // Send data to API
          const response = await fetch('https://192.168.0.252:3000/maintenance/suppliers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedData),
          });

          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }

          message.success('Nhập file thành công');
          fetchSuppliers(); // Refresh the table
        } catch (error) {
          console.error('Error processing file:', error);
          message.error('Lỗi khi xử lý file: ' + error.message);
        }
      };

      reader.onerror = (error) => {
        message.error('Lỗi khi đọc file: ' + error);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error importing file:', error);
      message.error('Lỗi khi nhập file: ' + error.message);
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleFileExport = () => {
    try {
      // Transform data for export
      const exportData = filteredData.map(item => ({
        'STT': item.stt,
        'Mã Nhà Cung Cấp': item.ma_nha_cung_cap,
        'Tên nhà cung cấp': item.ten_nha_cung_cap,
        'Số điện thoại': item.so_dien_thoai,
        'Email': item.email,
        'Địa chỉ': item.dia_chi,
        'Quốc gia': item.quoc_gia,
        'Mã số thuế': item.ma_so_thue,
        'Trang website': item.trang_website,
        'Trạng thái': item.trang_thai,
        'Ngày thêm vào': new Date(item.ngay_them_vao).toLocaleDateString('vi-VN'),
        'Không nợ phải trả': item.tong_no_phai_tra === 0 ? 'Không nợ' : item.tong_no_phai_tra,
        'Ghi chú': item.ghi_chu
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Suppliers');

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const fileName = `danh_sach_nha_cung_cap_${date}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
      message.success('Xuất file thành công');
    } catch (error) {
      console.error('Error exporting file:', error);
      message.error('Lỗi khi xuất file: ' + error.message);
    }
  };

  // Define table columns
  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 70,
    },
    {
      title: 'Mã Nhà Cung Cấp',
      dataIndex: 'ma_nha_cung_cap',
      key: 'ma_nha_cung_cap',
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'ten_nha_cung_cap',
      key: 'ten_nha_cung_cap',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'so_dien_thoai',
      key: 'so_dien_thoai',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'dia_chi',
      key: 'dia_chi',
    },
    {
      title: 'Quốc gia',
      dataIndex: 'quoc_gia',
      key: 'quoc_gia',
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'ma_so_thue',
      key: 'ma_so_thue',
    },
    {
      title: 'Trang website',
      dataIndex: 'trang_website',
      key: 'trang_website',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
    },
    {
      title: 'Ngày thêm vào',
      dataIndex: 'ngay_them_vao',
      key: 'ngay_them_vao',
      render: (text) => {
        const date = new Date(text);
        return date.toLocaleDateString('vi-VN');
      },
    },
    {
      title: 'Hành động',
      key: 'hanh_dong',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="primary" danger size="small" onClick={() => handleRemove(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
    {
      title: 'Không nợ phải trả',
      dataIndex: 'tong_no_phai_tra',
      key: 'tong_no_phai_tra',
      render: (value) => (value === 0 ? 'Không nợ' : value),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghi_chu',
      key: 'ghi_chu',
    },
  ];

  // Action buttons group
  const ActionButtons = () => (
    <Space style={{ marginBottom: 16 }}>
      <Input
        placeholder="Tìm kiếm theo mã hoặc tên nhà cung cấp"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ 
          width: 300, 
          color: '#000000',
        }}
        className="black-text-input"
        allowClear
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setSearchText('');
            setFilteredData(data);
          }
        }}
      />
      {/* <Button onClick={() => {}}>
        Lọc dữ liệu
      </Button> */}
      <Input 
        type="file" 
        style={{ display: 'none' }} 
        id="fileInput" 
        onChange={handleFileImport}
        accept=".xlsx,.xls"
      />
      <Button 
        type="primary" 
        onClick={() => document.getElementById('fileInput').click()}
        icon={<UploadOutlined />}
        loading={uploading}
      >
        Nhập File
      </Button>
      <Button 
        onClick={handleFileExport}
        icon={<DownloadOutlined />}
      >
        Xuất File
      </Button>
    </Space>
  );

  return (
    <>
      <style>{styles}</style>
      <div style={{ padding: 24 }}>
        <ActionButtons />

        {/* Table header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#fff',
            marginBottom: '1px',
            border: '1px solid #f0f0f0',
            borderRadius: '8px 8px 0 0',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 500,
              color: '#000000'
            }}
          >
            {isNewSuppliers ? 'Danh sách nhà cung cấp mới trong năm' : 'Danh sách nhà cung cấp'}
          </h2>
          <Space>
            <span style={{ color: '#000000' }}>Chọn năm:</span>
            <Input
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              style={{ width: 100, color: '#000000' }}
              className="black-text-input"
              maxLength={4}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSelectedYear(new Date().getFullYear().toString());
                  filterData(searchText, new Date().getFullYear().toString());
                }
              }}
            />
          </Space>
        </div>

        {/* Main table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="stt"
          bordered
          size="small"
          pagination={{
            total: filteredData.length,
            pageSize: 20,
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
          style={{
            backgroundColor: '#fff',
            borderRadius: '0 0 8px 8px',
          }}
          loading={loading}
        />

        {/* Edit Modal */}
        <Modal
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
          width={1000}
          destroyOnClose
        >
          <EditSupplier
            supplierId={selectedSupplier?.ma_nha_cung_cap}
            onCancel={() => setEditModalVisible(false)}
            onSuccess={handleEditSuccess}
          />
        </Modal>

        {/* Remove Supplier Confirmation */}
        {removeModalVisible && selectedSupplier && (
          <RemoveSupplier
            supplierId={selectedSupplier.ma_nha_cung_cap}
            supplierName={selectedSupplier.ten_nha_cung_cap}
            onSuccess={handleRemoveSuccess}
            onCancel={handleRemoveCancel}
          />
        )}
      </div>
    </>
  );
};

export default SuppliersTable;