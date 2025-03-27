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
            <Menu.Item key="/rooms" icon={<FileOutlined style={{ color: '#fff' }} />}>
              <NavLink to="/locations" style={{ color: '#fff' }}>Loại bảo trì</NavLink>
            </Menu.Item>
            <Menu.Item key="/devices" icon={<DesktopOutlined style={{ color: '#fff' }} />}>
              <NavLink to="/maps" style={{ color: '#fff' }}>Sửa chữa</NavLink>
            </Menu.Item>
            <Menu.Item key="/meter_powers" icon={<FlashAuto style={{ color: '#fff' }} />}>
              <NavLink to="/statistic" style={{ color: '#fff' }}>Bảo trì</NavLink>
            </Menu.Item>
            <Menu.Item key="/profile" icon={<UserOutlined style={{ color: '#fff' }} />}>
              <NavLink to="/profile" style={{ color: '#fff' }}>Bảo hành</NavLink>
            </Menu.Item>
            <Menu.Item key="/explain" icon={<SettingOutlined style={{ color: '#fff' }} />}>
              <NavLink to="/explain" style={{ color: '#fff' }}>Báo Giá </NavLink>
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
          <h3>Mainternance</h3>
        </Footer>
      </Layout>
    </Layout>
  );
}

export default LayoutApp;