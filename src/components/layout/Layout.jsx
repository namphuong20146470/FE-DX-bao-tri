import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import { Layout, Menu, Breadcrumb, Avatar } from 'antd';
import { DesktopOutlined, FileOutlined, UserOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { FlashAuto } from '@material-ui/icons';

import './layout.css';

const { Header, Content, Footer } = Layout;
const { SubMenu } = Menu;

function LayoutApp(props) {
  const { children } = props;
  const navigation = useNavigate();
  const [current, setCurrent] = useState('mail');

  let keyMenu;
  let tmp = window.location.pathname;
  let tmpArr = tmp.split('/');
  keyMenu = `/${tmpArr[1]}`;

  const handleClick = (event) => {
    setCurrent(event.key);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigation('/');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="site-layout-background" style={{ padding: 0, position: 'sticky', top: 0, zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
          }}
        >
          <div className="logo" style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
            <a href="https://hoangphucthanh.vn/" style={{ color: '#fff', textDecoration: 'none' }}>
              HOPT.ai
            </a>
          </div>

          {/* Menu điều hướng và nút Log out */}
          <Menu
            onClick={handleClick}
            selectedKeys={[current]}
            mode="horizontal"
            style={{ background: 'transparent', borderBottom: 'none', color: '#fff' }}
            className="header-menu"
          >
            <Menu.Item key="/" icon={<HomeOutlined style={{ color: '#fff' }} />}>
              <NavLink to="/" style={{ color: '#fff' }}>Trang Chủ</NavLink>
            </Menu.Item>
            
            {/* Submenu Nhà Cung Cấp */}
            <SubMenu 
              key="suppliers" 
              icon={<DesktopOutlined style={{ color: '#fff' }} />}
              title={<span style={{ color: '#fff' }}>Nhà Cung Cấp</span>}
              onTitleClick={() => navigation('/suppliers')}
            >
              <Menu.Item key="/suppliers/list">
                <NavLink to="/suppliers" style={{ color: '#000' }}>Danh sách nhà cung cấp</NavLink>
              </Menu.Item>
              <Menu.Item key="/suppliers/add">
                <NavLink to="/suppliers/add" style={{ color: '#000' }}>Thêm nhà cung cấp mới</NavLink>
              </Menu.Item>
            </SubMenu>

            {/* Submenu Hàng Hóa */}
            <SubMenu 
              key="products" 
              icon={<FileOutlined style={{ color: '#fff' }} />}
              title={<span style={{ color: '#fff' }}>Hàng Hóa</span>}
              onTitleClick={() => navigation('/products')}
            >
              <Menu.Item key="/products/list">
                <NavLink to="/products" style={{ color: '#000' }}>Danh sách hàng hóa</NavLink>
              </Menu.Item>
              <Menu.Item key="/products/catalogs">
                <NavLink to="/products/catalogs" style={{ color: '#000' }}>Danh mục hàng hóa</NavLink>
              </Menu.Item>
            </SubMenu>

            <Menu.Item key="/statistic" icon={<FlashAuto style={{ color: '#fff' }} />}>
              <NavLink to="/statistic" style={{ color: '#fff' }}>Bảo trì</NavLink>
            </Menu.Item>
            
            <Menu.Item key="/bao_gia" icon={<SettingOutlined style={{ color: '#fff' }} />}>
              <NavLink to="/bao_gia" style={{ color: '#fff' }}>Báo Giá</NavLink>
            </Menu.Item>

            {/* Nút Log out */}
            <SubMenu
              key="SubMenu"
              icon={
                <IconButton aria-label="settings" onClick={handleClick}>
                  <Avatar size="large" icon={<UserOutlined />} />
                </IconButton>
              }
              style={{ background: 'none !important' }}
            >
              <Menu.Item key="setting:1" onClick={handleLogout} style={{ color: '#000' }}>
                Log out
              </Menu.Item>
            </SubMenu>
          </Menu>
        </div>
      </Header>
      <Layout className="site-layout">
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '8px 0', color: '#fff' }}>
            <Breadcrumb.Item> </Breadcrumb.Item>
            <Breadcrumb.Item></Breadcrumb.Item>
          </Breadcrumb>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <h3>Maintenance</h3>
        </Footer>
      </Layout>
    </Layout>
  );
}

export default LayoutApp;