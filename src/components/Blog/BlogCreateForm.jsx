import React, { useState } from "react";
import { Form, Input, Button, message, Typography, Card } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../config/axios";

const { Title } = Typography;

const BlogCreateForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post("/Blog", values);
      message.success("Tạo blog thành công!");
    } catch {
      message.error("Tạo blog thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8fb', paddingTop: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', maxWidth: 600, margin: '0 auto' }}>
        { !location.pathname.startsWith('/nurse') && (
          <Button
            type="default"
            onClick={() => navigate("/")}
            style={{ marginBottom: 24, fontWeight: 500 }}
          >
            Quay lại trang chủ
          </Button>
        )}
      </div>
      <Card
        style={{
          maxWidth: 600,
          margin: "40px auto",
          boxShadow: "0 4px 24px 0 rgba(33,150,243,0.10)",
          borderRadius: 16,
          padding: 32,
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32, color: '#1976d2', fontWeight: 700 }}>
          Đăng Blog Học Đường
        </Title>
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ width: '100%' }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề bài viết" size="large" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <Input.TextArea rows={6} placeholder="Nhập nội dung bài viết" size="large" />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="Link ảnh"
            rules={[{ required: true, message: "Vui lòng nhập link ảnh" }]}
          >
            <Input placeholder="Nhập link ảnh minh họa" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ fontWeight: 600 }}>
              Hoàn tất
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BlogCreateForm; 