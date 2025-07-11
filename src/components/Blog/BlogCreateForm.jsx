import React, { useState } from "react";
import { Form, Input, Button, message, Typography, Card, Upload } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../config/axios";
import { UploadOutlined } from '@ant-design/icons';
import axios from "axios";
import { toast } from "react-toastify";
import { notification } from "antd";

const { Title } = Typography;

const BlogCreateForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [imageUrl, setImageUrl] = useState("");
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post("/Blog", { ...values, imageUrl });
      notification.success({
        message: "Tạo blog thành công!",
        description: "Blog của bạn đã được gửi lên hệ thống và chờ duyệt.",
        placement: "topRight",
        duration: 2,
        onClose: () => navigate("/nurse/blog"),
      });
      form.resetFields();
      setImageUrl("");
    } catch {
      message.error("Tạo blog thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Giả lập upload ảnh, bạn cần thay thế bằng API thực tế nếu có
  const customUpload = async ({ file, onSuccess }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "upload_NguyenLong");
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dueel4qtb/image/upload",
        formData
      );
      if (res.data && res.data.secure_url) {
        setImageUrl(res.data.secure_url);
        onSuccess("ok");
        message.success("Bạn đã đăng ảnh thành công!");
      } else {
        message.error("Upload ảnh thất bại!");
      }
    } catch (error) {
      message.error("Upload ảnh thất bại!");
      console.log("Error", error);
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
          form={form}
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
            label="Ảnh minh họa"
            required
          >
            <Upload
              customRequest={customUpload}
              showUploadList={false}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            {imageUrl && (
              <img src={imageUrl} alt="preview" style={{ marginTop: 16, maxWidth: 200, borderRadius: 8 }} />
            )}
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