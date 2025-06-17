import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Pagination, 
  message,
  Row,
  Col,
  DatePicker
} from 'antd';
import { PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './MedicationForm.css';
import api from '../../../config/axios';
import { useSelector } from 'react-redux';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const MedicationForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [medicinePages, setMedicinePages] = useState(['1']); // Track medicine pages
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const user = useSelector(state => state.user.user); // Lấy user từ Redux

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Gọi API lấy tất cả học sinh
        const studentsResponse = await api.get('/Student');
        // Lọc ra những học sinh có parentID trùng với userID của phụ huynh đang đăng nhập
        const parentStudents = studentsResponse.data.filter(
          student => student.parentID === user.userID
        );
        setStudents(parentStudents);
      } catch (error) {
        message.error('Không thể tải danh sách học sinh');
      }
    };

    if (user && user.userID) {
      fetchStudents();
    }
  }, [user]);

  const handleAddMedicinePage = () => {
    const newPageNumber = String(medicinePages.length + 1);
    setMedicinePages([...medicinePages, newPageNumber]);
    setCurrentPage(medicinePages.length + 1);
  };

  const handleRemoveMedicinePage = () => {
    if (medicinePages.length <= 1) return;
    
    const newPages = medicinePages.slice(0, -1);
    setMedicinePages(newPages);
    setCurrentPage(Math.min(currentPage, newPages.length));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSubmit = async (values) => {
    try {
      // Chuẩn bị dữ liệu để gửi
      const payload = {
        medicineName: values.medicines[currentPage - 1].medicineName,
        studentID: values.studentID,
        parentID: 0, // Cần được cập nhật từ thông tin đăng nhập
        allergenCheck: values.medicines[currentPage - 1].allergenCheck || '',
        requestStatus: 'Pending', // Trạng thái mặc định
        approveDate: null, // Để null khi mới gửi yêu cầu
        studentName: values.studentName,
        parentName: '', // Sẽ được điền từ thông tin đăng nhập
        dosage: values.medicines[currentPage - 1].dosage,
        time: values.medicines[currentPage - 1].time.join(', '),
        note: values.medicines[currentPage - 1].note || ''
      };

      // Gọi API gửi đơn thuốc
      await api.post('/MedicineRequest', payload);

      // Hiển thị thông báo thành công
      message.success('Gửi đơn thuốc thành công');

      // Reset form sau khi gửi
      form.resetFields();
    } catch (error) {
      console.error('Lỗi khi gửi đơn thuốc:', error);
      
      // Hiển thị thông báo lỗi
      message.error(error.response?.data?.message || 'Không thể gửi đơn thuốc. Vui lòng thử lại.');
    }
  };

  const handleGoBack = () => {
    navigate('/home');
  };

  return (
    <div className="medication-form-container" style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white'
    }}>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleGoBack}
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px',
          color: '#1677ff'
        }}
      >
        Quay lại
      </Button>

      <Form
        form={form}
        layout="vertical"
        className="medication-form"
        onFinish={handleSubmit}
      >
        <h2 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#1677ff',
          borderBottom: '2px solid #1677ff',
          paddingBottom: '10px'
        }}>
          {user ? `Phụ huynh ${user.fullName} tạo đơn gửi thuốc uống` : 'ĐƠN GỬI THUỐC UỐNG'}
        </h2>

        <Row gutter={32}>
          <Col span={12}>
            <div className="student-info" style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '20px', 
              borderRadius: '8px',
              height: '100%'
            }}>
              <h3 style={{ 
                color: '#1677ff', 
                marginBottom: '20px',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '10px'
              }}>
                Thông tin học sinh
              </h3>

              <Form.Item
                name="studentID"
                label="Chọn học sinh"
                rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
              >
                <Select
                  showSearch
                  placeholder="Tìm và chọn học sinh"
                  onChange={(studentID) => {
                    const student = students.find(s => s.studentID === studentID);
                    if (student) {
                      form.setFieldsValue({
                        studentID: student.studentID,
                        studentName: student.fullName,
                        className: student.className
                      });
                    }
                  }}
                  allowClear
                >
                  {students.map(student => (
                    <Select.Option key={student.studentID} value={student.studentID}>
                      {student.fullName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="studentName" label="Họ và tên">
                <Input disabled />
              </Form.Item>

              <Form.Item name="className" label="Lớp">
                <Input disabled />
              </Form.Item>


              <Form.Item 
                name="phone" 
                label="Số điện thoại phụ huynh"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { 
                    pattern: /^(0[1-9][0-9]{8})$/, 
                    message: 'Số điện thoại không hợp lệ' 
                  }
                ]}
              > 
                <Input 
                  placeholder="Nhập số điện thoại" 
                  prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} 
                />
              </Form.Item>
            </div>
          </Col>

          <Col span={12}>
            <div className="medicine-info" style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '20px', 
              borderRadius: '8px',
              height: '100%'
            }}>
              <div className="medicine-box-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ 
                  color: '#1677ff', 
                  margin: 0,
                  borderBottom: '1px solid #e0e0e0',
                  paddingBottom: '10px'
                }}>
                  Thông tin thuốc
                </h3>
                <div>
                  <Button 
                    size="small" 
                    style={{ marginRight: '10px' }}
                    onClick={handleRemoveMedicinePage} 
                    disabled={medicinePages.length <= 1}
                  >
                    Xóa trang
                  </Button>
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={handleAddMedicinePage}
                  >
                    Thêm trang
                  </Button>
                </div>
              </div>

              <div className="medicine-box">
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px' 
                }}>
                  <span>Trang {currentPage}</span>
                  <Pagination 
                    simple
                    current={currentPage}
                    total={medicinePages.length * 10}
                    pageSize={10}
                    onChange={handlePageChange}
                  />
                </div>

                <Form.Item 
                  name={['medicines', currentPage - 1, 'medicineName']} 
                  label="Tên thuốc" 
                  rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
                > 
                  <Input placeholder="Nhập tên thuốc" />
                </Form.Item>

                <Form.Item 
                  name={['medicines', currentPage - 1, 'dosage']} 
                  label="Liều lượng" 
                  rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
                > 
                  <Input placeholder="VD: 1 viên/1 lần uống" />
                </Form.Item>

                <Form.Item 
                  name={['medicines', currentPage - 1, 'time']} 
                  label="Thời điểm uống" 
                  rules={[{ required: true, message: 'Vui lòng chọn thời điểm uống' }]}
                > 
                  <Select 
                    mode="multiple"
                    placeholder="Chọn thời điểm uống thuốc"
                    allowClear
                  >
                    <Option value="morning">Sáng</Option>
                    <Option value="noon">Trưa</Option>
                    <Option value="evening">Tối</Option>
                  </Select>
                </Form.Item>

                <Form.Item 
                  name={['medicines', currentPage - 1, 'note']} 
                  label="Ghi chú"
                > 
                  <TextArea 
                    rows={2} 
                    placeholder="Nhập các lưu ý đặc biệt (nếu có)" 
                  />
                </Form.Item>
              </div>
            </div>
          </Col>
        </Row>

        <div className="buttons" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '30px' 
        }}>
          <Space size="large">
            <Button 
              type="default" 
              size="large" 
              onClick={() => form.resetFields()}
            >
              Nhập lại
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
            >
              Xác nhận
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default MedicationForm;