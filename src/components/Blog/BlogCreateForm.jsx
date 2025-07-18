import React, { useState, useMemo } from "react";
import { 
  Form, 
  Input, 
  Button, 
  message, 
  Typography, 
  Card, 
  Upload, 
  Space, 
  Divider, 
  Steps, 
  Row, 
  Col,
  Tooltip
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Đảm bảo import CSS
import api from "../../config/axios";
import { 
  UploadOutlined, 
  FileImageOutlined, 
  EditOutlined, 
  CheckCircleOutlined, 
  ArrowLeftOutlined,
  InfoCircleOutlined,
  FormOutlined,
  PictureOutlined,
  SendOutlined
} from '@ant-design/icons';
import axios from "axios";
import { toast } from "react-toastify";
import { Modal } from "antd";
import './BlogCreateForm.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const BlogCreateForm = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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

  const onFinish = async () => {
    setLoading(true);
    try {
      // Lấy giá trị tiêu đề trực tiếp từ form
      const titleValue = form.getFieldValue('title');
      
      // Kiểm tra tiêu đề nghiêm ngặt
      if (!titleValue || titleValue.trim() === '') {
        message.error("Vui lòng nhập tiêu đề bài viết");
        setLoading(false);
        return;
      }

      // Kiểm tra ảnh minh họa
      if (!imageUrl) {
        message.error("Vui lòng tải lên ảnh minh họa");
        setLoading(false);
        return;
      }

      // Log dữ liệu trước khi gửi để debug
      console.log("Dữ liệu gửi đi:", {
        title: titleValue,
        content: content,
        imageUrl: imageUrl
      });

      // Đảm bảo gửi đúng định dạng mà API yêu cầu
      const blogData = {
        title: titleValue,
        content: content,
        imageUrl: imageUrl
      };

      await api.post("/Blog", blogData);
      
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
      console.error("Lỗi khi tạo blog:", error);
      console.error("Response data:", error.response?.data);
      
      if (error.response) {
        // Lỗi từ server
        const errorMessage = error.response.data.errors 
          ? Object.values(error.response.data.errors).flat().join(", ")
          : error.response.data.message || "Có lỗi xảy ra khi tạo blog";
        toast.error(errorMessage);
      } else if (error.request) {
        // Lỗi kết nối
        toast.error("Không thể kết nối đến máy chủ");
      } else {
        // Lỗi khác
        toast.error("Đã có lỗi xảy ra");
      }
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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra xem form có hợp lệ không để chuyển bước
  const handleNextStep = async () => {
    try {
      if (currentStep === 0) {
        // Kiểm tra tiêu đề
        try {
          await form.validateFields(['title']);
          const titleValue = form.getFieldValue('title');
          
          if (!titleValue || titleValue.trim() === '') {
            message.error("Vui lòng nhập tiêu đề bài viết");
            return;
          }
          
          // Nếu tiêu đề hợp lệ, chuyển sang bước tiếp theo
          setCurrentStep(1);
        } catch (error) {
          console.log('Title validation failed:', error);
          message.error("Vui lòng nhập tiêu đề bài viết");
        }
      } else if (currentStep === 1) {
        // Kiểm tra nội dung
        try {
          await validateContent();
          // Nếu không có lỗi (không reject), chuyển sang bước tiếp theo
          setCurrentStep(2);
        } catch (error) {
          // Nếu có lỗi, hiển thị thông báo
          message.error(error.message);
        }
      }
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: 'Tiêu đề',
      icon: <FormOutlined />,
      content: (
        <Form.Item
          name="title"
          label={
            <Space>
              <EditOutlined />
              <span>Tiêu đề bài viết</span>
              <Tooltip title="Tiêu đề nên ngắn gọn, hấp dẫn và mô tả chính xác nội dung bài viết">
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            </Space>
          }
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
            style={{ borderRadius: '8px', fontSize: '16px' }}
          />
        </Form.Item>
      )
    },
    {
      title: 'Nội dung',
      icon: <FileImageOutlined />,
      content: (
        <Form.Item
          name="content"
          label={
            <Space>
              <FileImageOutlined />
              <span>Nội dung bài viết</span>
              <Tooltip title="Hãy viết nội dung chi tiết, rõ ràng và hấp dẫn">
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            </Space>
          }
          rules={[
            { validator: validateContent }
          ]}
        >
          <div className="editor-container" style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
            <ReactQuill 
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Nhập nội dung bài viết"
              style={{ 
                height: 350, 
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>
          {content && (
            <div style={{ 
              color: content.replace(/<[^>]*>/g, '').length > 4000 ? 'red' : 'gray', 
              textAlign: 'right',
              marginTop: 10,
              fontSize: '13px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
              <InfoCircleOutlined style={{ marginRight: '5px' }} />
              {content.replace(/<[^>]*>/g, '').length}/4000 ký tự
            </div>
          )}
        </Form.Item>
      )
    },
    {
      title: 'Ảnh minh họa',
      icon: <PictureOutlined />,
      content: (
        <Form.Item
          label={
            <Space>
              <PictureOutlined />
              <span>Ảnh minh họa</span>
              <Tooltip title="Hãy chọn ảnh minh họa phù hợp với nội dung bài viết">
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            </Space>
          }
          required
        >
          <div className="upload-container" style={{ 
            border: '1px dashed #d9d9d9', 
            borderRadius: '8px', 
            padding: '20px',
            textAlign: 'center',
            background: '#fafafa',
            transition: 'all 0.3s'
          }}>
            {!imageUrl ? (
              <Upload
                customRequest={customUpload}
                showUploadList={false}
                accept="image/*"
                maxCount={1}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" align="center">
                  <PictureOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                  <Text>Kéo thả ảnh hoặc nhấn để tải lên</Text>
                  <Button 
                    icon={<UploadOutlined />} 
                    type="primary"
                    loading={loading}
                    style={{ borderRadius: '6px' }}
                  >
                    Chọn ảnh
                  </Button>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
                  </Text>
                </Space>
              </Upload>
            ) : (
              <div style={{ position: 'relative' }}>
                <img 
                  src={imageUrl} 
                  alt="preview" 
                  style={{ 
                    width: '100%',
                    maxHeight: '400px', 
                    objectFit: 'contain', 
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }} 
                />
                <div style={{ marginTop: '10px' }}>
                  <Button 
                    danger 
                    onClick={() => setImageUrl("")}
                    style={{ borderRadius: '6px' }}
                  >
                    Xóa ảnh
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Form.Item>
      )
    }
  ];

  return (
    <div className="blog-create-form-container" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%)', 
      padding: '40px 20px'
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          { !location.pathname.startsWith('/nurse') && (
            <Button
              type="default"
              onClick={() => navigate("/")}
              icon={<ArrowLeftOutlined />}
              style={{ 
                marginBottom: 24, 
                fontWeight: 500,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Quay lại trang chủ
            </Button>
          )}
        </div>
        
        <Card
          style={{
            boxShadow: "0 8px 24px 0 rgba(33,150,243,0.15)",
            borderRadius: 16,
            overflow: 'hidden',
            border: 'none'
          }}
          bodyStyle={{ padding: '0' }}
        >
          <div style={{ 
            padding: '24px 32px', 
            background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
            textAlign: 'center'
          }}>
            <Title level={2} style={{ 
              color: '#fff', 
              margin: 0, 
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <FormOutlined style={{ marginRight: '10px' }} />
              Đăng Blog Học Đường
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              Chia sẻ kiến thức, kinh nghiệm và thông tin bổ ích cho cộng đồng học đường
            </Text>
          </div>

          <div style={{ padding: '30px 32px' }}>
            <Steps 
              current={currentStep}
              items={steps.map(item => ({ 
                title: item.title,
                icon: item.icon
              }))}
              style={{ marginBottom: '40px' }}
            />
            
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ width: '100%' }}
              requiredMark="optional"
            >
              <div style={{ minHeight: '250px' }}>
                {steps[currentStep].content}
              </div>
              
              <Divider />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                {currentStep > 0 && (
                  <Button 
                    onClick={handlePrevStep}
                    icon={<ArrowLeftOutlined />}
                    style={{ borderRadius: '6px' }}
                  >
                    Quay lại
                  </Button>
                )}
                
                <div style={{ marginLeft: 'auto' }}>
                  {currentStep < steps.length - 1 && (
                    <Button 
                      type="primary" 
                      onClick={handleNextStep}
                      style={{ borderRadius: '6px' }}
                    >
                      Tiếp theo
                    </Button>
                  )}
                  
                  {currentStep === steps.length - 1 && (
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading} 
                      icon={<SendOutlined />}
                      style={{ 
                        borderRadius: '6px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                     Xác nhận 
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          </div>
        </Card>
        
        <Card 
          style={{ 
            borderRadius: '12px', 
            marginTop: '20px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <Title level={5} style={{ marginTop: 0 }}>
            <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Hướng dẫn đăng bài
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card 
                size="small" 
                title="1. Tiêu đề" 
                style={{ height: '100%', borderRadius: '8px' }}
              >
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Tiêu đề ngắn gọn, hấp dẫn</li>
                  <li>Không quá 200 ký tự</li>
                  <li>Phản ánh chính xác nội dung bài viết</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                size="small" 
                title="2. Nội dung" 
                style={{ height: '100%', borderRadius: '8px' }}
              >
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Viết rõ ràng, dễ hiểu</li>
                  <li>Có thể chèn hình ảnh minh họa</li>
                  <li>Không quá 4000 ký tự</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                size="small" 
                title="3. Ảnh minh họa" 
                style={{ height: '100%', borderRadius: '8px' }}
              >
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Chọn ảnh phù hợp với nội dung</li>
                  <li>Định dạng: JPG, PNG, GIF</li>
                  <li>Kích thước tối đa: 5MB</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default BlogCreateForm; 