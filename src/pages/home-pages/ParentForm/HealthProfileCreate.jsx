import React, { useEffect, useState } from "react";
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  DatePicker, 
  Select,
  message
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import api from "../../../config/axios";
import { useSelector } from "react-redux";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;

function HealthProfileCreatePage() {
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Lấy ID người dùng từ Redux store
  const user = useSelector(state => state.user.user);
  const userId = user?.userID;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách học sinh
        const response = await api.get(`/Student`);
        
        // Lọc học sinh theo parentID
        const parentStudents = response.data.filter(
          student => student.parentID === userId
        );
        
        setStudents(parentStudents);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải danh sách học sinh:', error);
        message.error('Không thể tải danh sách học sinh');
        setLoading(false);
      }
    };

    if (userId) {
      fetchStudents();
    }
  }, [userId]);

  const onFinish = (values) => {
    // Gửi dữ liệu lên API ở đây
    const data = {
      ...values,
      studentID: selectedStudent?.studentID,
      fullName: selectedStudent?.fullName,
      className: selectedStudent?.className,
      dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
      // Đảm bảo chronicDisease được gửi lên, nếu không có thì là chuỗi rỗng
      chronicDisease: values.chronicDisease || ''
    };
    console.log("Dữ liệu hồ sơ sức khỏe:", data);
    alert("Tạo hồ sơ thành công!");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "40px auto",
          boxShadow: "0 4px 24px 0 rgba(33,150,243,0.10)",
        }}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          Tạo hồ sơ sức khỏe học sinh
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 24 }}
        >
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 320 }}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
              >
                <Select
                  placeholder="Chọn học sinh"
                  loading={loading}
                  onChange={(value) => {
                    const student = students.find(s => s.studentID === value);
                    if (student) {
                      form.setFieldsValue({
                        className: student.className,
                        dob: student.dateOfBirth ? moment(student.dateOfBirth) : null
                      });
                      setSelectedStudent(student);
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  {students.map(student => (
                    <Option key={student.studentID} value={student.studentID}>
                      {student.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Lớp">
                <Input
                  name="className"
                  value={selectedStudent?.className || ""}
                  disabled
                  placeholder="Chưa có thông tin"
                />
              </Form.Item>
              <Form.Item 
                name="dob"
                label="Ngày tháng năm sinh"
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  disabled
                  style={{ width: '100%' }}
                  placeholder="Chưa có thông tin"
                />
              </Form.Item>
              <Form.Item
                label="Dị ứng"
                name="allergy"
                rules={[
                  { required: true, message: "Vui lòng nhập dị ứng (nếu có)" },
                ]}
              >
                <Input placeholder="Nhập dị ứng (nếu có)" />
              </Form.Item>
            </div>
            <div style={{ flex: 1, minWidth: 320 }}>
              <Form.List name="treatmentHistory">
                {(fields, { add, remove }) => (
                  <div>
                    <label>Tiền sử điều trị</label>
                    {fields.map((field, idx) => (
                      <Space
                        key={field.key}
                        align="baseline"
                        style={{ display: "flex", marginBottom: 8 }}
                      >
                        <Form.Item
                          name={[field.name, "date"]}
                          fieldKey={[field.fieldKey, "date"]}
                          rules={[{ required: true, message: "Chọn ngày" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <DatePicker
                            format="DD/MM/YYYY"
                            placeholder="Ngày"
                            style={{ width: 120 }}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, "desc"]}
                          fieldKey={[field.fieldKey, "desc"]}
                          rules={[
                            {
                              required: true,
                              message: "Nhập nội dung điều trị",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            placeholder={`Tiền sử điều trị ${idx + 1}`}
                            style={{ width: 220 }}
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                          />
                        )}
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      style={{ width: "100%" }}
                    >
                      Thêm tiền sử điều trị
                    </Button>
                  </div>
                )}
              </Form.List>
              <Form.Item
                label="Thị lực"
                name="vision"
                rules={[{ required: true, message: "Vui lòng nhập thị lực" }]}
              >
                <Input placeholder="Nhập thị lực" />
              </Form.Item>

              
              <Form.Item
                label="Chiều cao "
                name="height"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thông tin chiều cao",
                  },
                ]}
              >
                <Input placeholder="Nhập thông tin chiều cao" />
              </Form.Item>
              <Form.Item
                label="Cân nặng "
                name="weight"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thông tin Cân nặng ",
                  },
                ]}
              >
                <Input placeholder="Nhập thông tin cân nặng " />
              </Form.Item>

              <Form.Item
                label="Bệnh Mãn Tính"
                name="chronicDisease"
                rules={[
                  {
                    required: false,
                    message: "Nhập thông tin bệnh mãn tính (nếu có)",
                  },
                ]}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Nhập thông tin bệnh mãn tính (nếu không có, để trống)" 
                />
              </Form.Item>
            </div>
          </div>
          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{ minWidth: 180, fontWeight: 600, fontSize: 16 }}
            >
              Tạo hồ sơ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default HealthProfileCreatePage;
