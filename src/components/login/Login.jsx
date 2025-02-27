import React from 'react';
import { Form, Input, Button, Checkbox, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import file CSS tùy chỉnh

function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    console.log('Received values:', values);

    const data = {
      login_username: values.username,
      login_password: values.password,
    };

    try {
      const response = await fetch('https://ebaotri.hoangphucthanh.vn/index.php?login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (response.ok && result.success) {
        console.log('Login successful');
        localStorage.setItem('token', result.token || 'test-token');
        notification.success({
          message: 'Login Successful!',
          description: result.message || 'You have successfully logged in.',
          duration: 2,
        });
        navigate('/');
      } else {
        throw new Error(result.message || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      notification.error({
        message: 'Login Failed!',
        description: error.message,
        duration: 2,
      });
    }
  };

  const transparentStyle = {
    background: 'transparent',
    border: 'none',
    color: '#fff', // Màu chữ trắng để dễ nhìn trên nền
    boxShadow: 'none',
  };

  const formStyle = {
    background: 'transparent',
    padding: '20px',
    borderRadius: '10px',
  };

  return (
    <div className="login-wrapper">
      <div className="login-container" style={formStyle}>
        <h2 className="login-title" style={{ color: '#fff' }}>Welcome Back!</h2>
        <Form name="login_form" onFinish={onFinish} className="login-form">
        <Form.Item name="username" rules={[{ required: true, message: 'Please enter your username!' }]}>
  <Input
    prefix={<UserOutlined style={{ color: 'white' }} />}
    placeholder="Username"
    className="login-input"
  />
</Form.Item>

<Form.Item name="password" rules={[{ required: true, message: 'Please enter your password!' }]}>
  <Input.Password
    prefix={<LockOutlined style={{ color: 'white' }} />}
    placeholder="Password"
    className="login-input"
  />
</Form.Item>

          <Form.Item>
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
