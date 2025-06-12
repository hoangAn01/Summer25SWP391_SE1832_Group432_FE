import React, { useState } from 'react';
import { 
  Avatar, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Input, 
  Modal 
} from 'antd';
import { UserOutlined, ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ParentProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [parentInfo, setParentInfo] = useState({
    fullName: 'Nguyễn Văn A',
    childName: 'Nguyễn Văn B',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    gender: 'Nam',
    dateOfBirth: '01/01/1980',
    phoneNumber: '0123456789',
    avatarUrl: null
  });

  const handleGoBack = () => {
    navigate('/home');
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = (values) => {
    setParentInfo({...parentInfo, ...values});
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 64px)', // Trừ chiều cao của header
        paddingTop: '64px', // Đẩy nội dung xuống dưới header
        padding: '20px',
        backgroundColor: '#f0f2f5',
        boxSizing: 'border-box'
      }}
    >
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 900,
          textAlign: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          borderRadius: '12px',
          position: 'relative'
        }}
      >
        {/* Nút quay lại */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined style={{ fontSize: '20px' }} />} 
          onClick={handleGoBack}
          style={{ 
            position: 'absolute', 
            top: 16, 
            left: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Quay lại
        </Button>

        {/* Nút chỉnh sửa */}
        <Button 
          type="text" 
          icon={<EditOutlined style={{ fontSize: '20px' }} />} 
          onClick={handleEditProfile}
          style={{ 
            position: 'absolute', 
            top: 16, 
            right: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Chỉnh sửa
        </Button>

        <Title level={3} style={{ marginBottom: 24, paddingTop: 40 }}>
          Thông Tin Cá Nhân Phụ Huynh
        </Title>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Avatar 
            size={180}
            icon={<UserOutlined />} 
            src={parentInfo.avatarUrl}
            style={{
              border: '4px solid #1890ff',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        <Title level={4} style={{ marginBottom: 16 }}>
          {parentInfo.fullName}
        </Title>

        <Row gutter={[16, 16]} style={{ padding: '0 24px' }}>
          <Col xs={24} sm={12}>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Tên con:</Text>
              <Text>{parentInfo.childName}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Địa chỉ:</Text>
              <Text>{parentInfo.address}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Giới tính:</Text>
              <Text>{parentInfo.gender}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Ngày sinh:</Text>
              <Text>{parentInfo.dateOfBirth}</Text>
            </div>
          </Col>
          <Col xs={24}>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Số điện thoại:</Text>
              <Text>{parentInfo.phoneNumber}</Text>
            </div>
          </Col>
        </Row>

        {/* Modal chỉnh sửa thông tin */}
        <Modal
          title="Chỉnh Sửa Thông Tin Cá Nhân"
          open={isEditing}
          onCancel={handleCancelEdit}
          footer={null}
        >
          <Form
            initialValues={parentInfo}
            onFinish={handleSaveProfile}
            layout="vertical"
          >
            <Form.Item 
              name="fullName" 
              label="Họ và Tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="childName" 
              label="Tên Con"
              rules={[{ required: true, message: 'Vui lòng nhập tên con' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="address" 
              label="Địa Chỉ"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="gender" 
              label="Giới Tính"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="dateOfBirth" 
              label="Ngày Sinh"
              rules={[{ required: true, message: 'Vui lòng nhập ngày sinh' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="phoneNumber" 
              label="Số Điện Thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Lưu Thay Đổi
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ParentProfile;
