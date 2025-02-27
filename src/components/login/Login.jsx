import React from 'react';
import { Form, Input, Button, Checkbox, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

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

        // Nếu API không trả token, tạo token tạm thời
        localStorage.setItem('token', result.token || 'test-token');

        notification.success({
          message: 'Login Successful!',
          description: result.message || 'You have successfully logged in.',
          duration: 2,
        });

        console.log("About to navigate to /home...");
        navigate('/home'); // Điều hướng đến http://localhost:3000/#/home
        console.log("Did navigate run?");
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

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Form name="login_form" onFinish={onFinish} style={{ width: 300, padding: 20, backgroundColor: '#fff', borderRadius: 10 }}>
        <Form.Item name="username" rules={[{ required: true, message: 'Please enter your username!' }]}>
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password!' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Log in</Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Login;
