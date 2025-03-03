import React from 'react';
import { Form, Input, Button, Checkbox, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [reloadTrigger, setReloadTrigger] = React.useState(false); // Thêm state để trigger reload

  const onFinish = async (values) => {
    try {
      const res = await fetch('https://ebaotri.hoangphucthanh.vn/index.php?login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_username: values.username, login_password: values.password }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        localStorage.setItem('token', result.token || 'test-token');
        notification.success({ message: 'Login Successful!', description: result.message || 'Logged in successfully', duration: 2 });
        setReloadTrigger(!reloadTrigger); // Trigger reload
        navigate('/');
      } else {
        throw new Error(result.message || 'Invalid credentials');
      }
    } catch (error) {
      notification.error({ message: 'Login Failed!', description: error.message, duration: 2 });
    }
  };

  const transparentStyle = { background: 'transparent', border: 'none', color: '#fff', boxShadow: 'none' };
  const formStyle = { background: 'transparent', padding: '40px', borderRadius: '12px', width: '450px', textAlign: 'center' };

  return (
    <div className="login-wrapper">
      <div className="login-container" style={formStyle}>
        <h2 className="login-title">Welcome Back!</h2>
        <Form name="login_form" onFinish={onFinish} className="login-form">
          <Form.Item name="username" rules={[{ required: true, message: 'Username required!' }]}>
            <Input prefix={<UserOutlined style={{ color: 'white' }} />} placeholder="Username" className="login-input" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Password required!' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: 'white' }} />} placeholder="Password" className="login-input" />
          </Form.Item>
          <Form.Item className="checkbox-item">
            <Checkbox style={{ color: '#fff' }}>Remember me</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className="login-button" style={transparentStyle}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;