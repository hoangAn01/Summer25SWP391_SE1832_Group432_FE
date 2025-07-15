import React, { useState, useMemo } from "react";
import { Form, Input, Button, message, Typography, Card, Upload } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Đảm bảo import CSS
import api from "../../config/axios";
import { UploadOutlined } from '@ant-design/icons';
import axios from "axios";
import { toast } from "react-toastify";
import { Modal } from "antd";
import './BlogCreateForm.css';

const { Title } = Typography;

const BlogCreateForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [form] = Form.useForm();

  // Hàm upload ảnh cho Quill
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "upload_NguyenLong");

        try {
          const res = await axios.post(
            "https://api.cloudinary.com/v1_1/dueel4qtb/image/upload",
            formData
          );

          if (res.data && res.data.secure_url) {
            const quillEditor = quillRef.current.getEditor();
            const range = quillEditor.getSelection(true);
            // Chèn ảnh với style mặc định
            quillEditor.insertEmbed(range.index, 'image', res.data.secure_url, 'user');
            // Đặt con trỏ sau ảnh
            quillEditor.setSelection(range.index + 1, 0);
            // Xử lý ảnh vừa chèn: loại bỏ width/height inline và đặt width nhỏ
            setTimeout(() => {
              const editor = quillRef.current && quillRef.current.getEditor && quillRef.current.getEditor();
              if (editor) {
                const imgs = editor.root.querySelectorAll(`img[src="${res.data.secure_url}"]`);
                imgs.forEach(img => {
                  img.removeAttribute('width');
                  img.removeAttribute('height');
                  img.style.width = '400px';
                  img.style.height = 'auto';
                  img.classList.add('float-right'); // Thêm class float-right để ảnh nằm bên phải
                });
              }
            }, 100);
            message.success("Đã chèn ảnh thành công!");
          } else {
            message.error("Upload ảnh thất bại!");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          message.error("Không thể tải ảnh lên");
        }
      }
    };
  };

  // Validation nội dung
  const validateContent = () => {
    if (!content) {
      return Promise.reject(new Error("Vui lòng nhập nội dung bài viết"));
    }
    
    const maxLength = 4000;
    
    // Loại bỏ các thẻ HTML và các khoảng trắng
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    
    // Kiểm tra nếu nội dung chỉ chứa các thẻ HTML hoặc rỗng
    if (strippedContent.length === 0) {
      return Promise.reject(new Error("Nội dung bài viết phải chứa văn bản, không chỉ là các thẻ HTML"));
    }
    
    // Kiểm tra độ dài nội dung
    if (strippedContent.length > maxLength) {
      return Promise.reject(new Error(`Nội dung bài viết không được vượt quá ${maxLength} ký tự`));
    }
    
    return Promise.resolve();
  };

  // Tham chiếu đến Quill
  const quillRef = React.useRef(null);

  // Cấu hình modules Quill
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ['undo', 'redo'],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        'image': imageHandler
      }
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true
    }
  }), []);

  // Định dạng cho Quill
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'indent',
    'link', 'image'
  ];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Kiểm tra ảnh minh họa
      if (!imageUrl) {
        message.error("Vui lòng tải lên ảnh minh họa");
        setLoading(false);
        return;
      }

      await api.post("/Blog", { 
        ...values, 
        content: content, 
        imageUrl 
      });
      
      toast.success("Tạo blog thành công!");
      Modal.success({
        title: "Tạo blog thành công!",
        content: "Blog của bạn đã được gửi lên hệ thống và chờ duyệt.",
        okText: "Đóng",
        onOk: () => {
          form.resetFields();
          setImageUrl("");
          setContent("");
          navigate("/nurse/blog");
        },
      });
    } catch (error) {
      // Xử lý lỗi chi tiết
      if (error.response) {
        // Lỗi từ server
        toast.error(error.response.data.message || "Có lỗi xảy ra khi tạo blog");
      } else if (error.request) {
        // Lỗi kết nối
        toast.error("Không thể kết nối đến máy chủ");
      } else {
        // Lỗi khác
        toast.error("Đã có lỗi xảy ra");
      }
      console.error(error);
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
      <div style={{ display: 'flex', justifyContent: 'flex-start', maxWidth: 900, margin: '0 auto' }}>
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
          maxWidth: 900,
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
            rules={[
              { validator: (_, value) => {
                if (!value) {
                  return Promise.reject(new Error("Vui lòng nhập tiêu đề"));
                }
                const maxTitleLength = 200;
                if (value.trim().length === 0) {
                  return Promise.reject(new Error("Tiêu đề không được chỉ chứa khoảng trắng"));
                }
                if (value.length > maxTitleLength) {
                  return Promise.reject(new Error(`Tiêu đề không được vượt quá ${maxTitleLength} ký tự`));
                }
                return Promise.resolve();
              }}
            ]}
          >
            <Input 
              placeholder="Nhập tiêu đề bài viết" 
              size="large" 
              maxLength={200}
              showCount
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[
              { validator: validateContent }
            ]}
          >
            <ReactQuill 
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Nhập nội dung bài viết"
              style={{ height: 300, marginBottom: 50 }}
            />
            {content && (
              <div style={{ 
                color: content.replace(/<[^>]*>/g, '').length > 4000 ? 'red' : 'gray', 
                textAlign: 'right',
                marginTop: -40,
                marginBottom: 20,
                fontSize: '12px'
              }}>
                {content.replace(/<[^>]*>/g, '').length}/4000 ký tự
              </div>
            )}
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
              <img 
                src={imageUrl} 
                alt="preview" 
                style={{ 
                  marginTop: 16, 
                  maxWidth: 400,
                  maxHeight: 300, 
                  objectFit: 'cover', 
                  borderRadius: 8 
                }} 
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large" 
              style={{ fontWeight: 600 }}
            >
              Hoàn tất
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BlogCreateForm; 