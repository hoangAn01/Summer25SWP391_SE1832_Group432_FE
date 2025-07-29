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
  message,
  InputNumber,
  Divider,
  Alert,
} from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  EyeOutlined,
  SoundOutlined,
  HistoryOutlined,
  ColumnHeightOutlined,
  DashboardOutlined,
  HeartOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import api from "../../../../config/axios";
import { useSelector } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import "./HealthProfileForm.css";

const { Title } = Typography;
const { Option } = Select;

function HealthProfileCreatePage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lấy ID người dùng từ Redux store
  const user = useSelector((state) => state.user);
  const userId = user?.userID;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        // Lấy thông tin phụ huynh trước
        const parentResponse = await api.get(`Parent/ByAccount/${userId}`);
        const parentID = parentResponse.data.parentID;

        // Sau đó lấy danh sách học sinh theo parentID
        // const studentsResponse = await api.get(`/Student/${parentID}`);

        // Lấy danh sách học sinh chưa được tạo profile
        const studentsResponse = await api.get(
          `/HealthProfile/students-without-profile?parentId=${parentID}`
        );

        // Xử lý response với cấu trúc mới có $values
        if (studentsResponse.status === 200) {
          const studentsData =
            studentsResponse.data.$values || studentsResponse.data;
          setStudents(studentsData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải danh sách học sinh:", error);
        message.error("Không thể tải danh sách học sinh");
        setLoading(false);
      }
    };

    if (userId) {
      fetchStudents();
    }
  }, [userId]);

  const onFinish = async (values) => {
    if (!selectedStudent) {
      message.error("Vui lòng chọn học sinh");
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        studentID: selectedStudent.studentID,
        studentFullName: selectedStudent.fullName,
        allergies: values.allergy || "",
        chronicDiseases: values.chronicDisease || "",
        treatmentHistory: values.treatmentHistory,
        visionDetails: values.visionTest ? `${values.visionTest}/10` : "",
        hearingDetails: values.hearingDetails ? `${values.hearingDetails}/10` : "",
        weight: values.weight?.toString() || "",
        height: values.height?.toString() || "",
        lastUpdated: new Date().toISOString(),
      };

      console.log("Health profile data:", data);
      await api.post(`/HealthProfile`, data);

      // Hiển thị thông báo thành công ở giữa màn hình
      message.success({
        content: `Đã tạo hồ sơ sức khỏe cho học sinh ${selectedStudent.fullName} thành công!`,
        style: { marginTop: '20vh', fontSize: 18 },
        duration: 1.5,
      });

      setTimeout(() => {
        navigate(`/student-health-profile/edit`);
      }, 1500);

      // Reset form sau khi tạo thành công
      // setTimeout(() => {
      //   form.resetFields();
      //   setSelectedStudent(null);
      // }, 2000);
    } catch (error) {
      console.error("Lỗi tạo hồ sơ sức khỏe:", error);
      message.error(
        error.response?.data?.message || "Tạo hồ sơ thất bại! Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="health-profile-wrapper" style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card 
        className="health-profile-card" 
        style={{ 
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderRadius: "12px", 
          overflow: "hidden",
          border: "1px solid #e9e9e9",
        }}
      >
        <Button
          type="primary"
          shape="round"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/home")}
          className="health-profile-back-btn"
          style={{ marginBottom: "20px" }}
        >
          Quay lại trang chủ
        </Button>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <HeartOutlined style={{ fontSize: "32px", color: "#1890ff", marginRight: "16px" }} />
          <Title level={3} className="health-profile-title" style={{ margin: 0 }}>
            Tạo hồ sơ sức khỏe học sinh
          </Title>
        </div>

        <Alert
          message="Thông tin quan trọng"
          description="Hồ sơ sức khỏe là cơ sở để theo dõi sức khỏe của học sinh và đưa ra các chương trình chăm sóc phù hợp. Vui lòng nhập thông tin chính xác để đảm bảo hiệu quả."
          type="info"
          showIcon
          style={{ marginBottom: "24px" }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="health-profile-form"
        >
          <div className="health-profile-form-row" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {/* THÔNG TIN CƠ BẢN */}
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <UserOutlined style={{ fontSize: "18px", color: "#1890ff", marginRight: "8px" }} />
                  <span>Thông tin học sinh</span>
                </div>
              } 
              style={{ 
                flex: "1 1 45%", 
                minWidth: "300px", 
                borderRadius: "8px",
                background: "#f6faff",
                marginBottom: "20px" 
              }}
              bordered={true}
            >
              <Form.Item
                name="fullName"
                label={<span style={{ fontWeight: "600" }}>Họ và tên</span>}
                rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
              >
                <Select
                  placeholder="Chọn học sinh"
                  loading={loading}
                  onChange={async (value) => {
                    const student = students.find((s) => s.studentID === value);
                    if (student) {
                      let className = student.className;
                      if (!className && student.classID) {
                        try {
                          const classRes = await api.get(`/Class/${student.classID}`);
                          className = classRes.data.className || "Chưa có thông tin";
                        } catch {
                          className = "Chưa có thông tin";
                        }
                      }

                      let parentFullName = student.parentFullName;
                      if (!parentFullName && student.parentID) {
                        try {
                          const parentRes = await api.get(`/Parent/${student.parentID}`);
                          parentFullName = parentRes.data.fullName || "";
                        } catch {
                          parentFullName = "";
                        }
                      }

                      form.setFieldsValue({
                        className,
                        dob: student.dateOfBirth ? moment(student.dateOfBirth) : null,
                        // Có thể set thêm parentFullName nếu cần
                      });
                      setSelectedStudent({
                        ...student,
                        className,
                        parentFullName,
                      });
                    }
                  }}
                  style={{ width: "100%" }}
                  allowClear
                  className="health-profile-select"
                  size="large"
                >
                  {students.map((student) => (
                    <Option key={student.studentID} value={student.studentID}>
                      {student.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                label={<span style={{ fontWeight: "600" }}>Lớp</span>} 
                name="className"
              >
                <Input
                  disabled
                  placeholder="Chưa có thông tin"
                  className="health-profile-input"
                  prefix={<CalendarOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Form.Item>

              <Form.Item 
                name="dob" 
                label={<span style={{ fontWeight: "600" }}>Ngày tháng năm sinh</span>}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  disabled
                  style={{ width: "100%" }}
                  placeholder="Chưa có thông tin"
                  className="health-profile-date"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: "600" }}>Dị ứng</span>}
                name="allergy"
                rules={[
                  { required: false, message: "Vui lòng nhập dị ứng (nếu có)" },
                ]}
                tooltip="Nếu không có dị ứng, có thể bỏ trống"
              >
                <Input 
                  placeholder="Nhập dị ứng (nếu không có, có thể bỏ trống)" 
                  className="health-profile-input" 
                  prefix={<MedicineBoxOutlined style={{ color: "#ff4d4f" }} />}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: "600" }}>Bệnh Mãn Tính</span>}
                name="chronicDisease"
                rules={[
                  {
                    required: false,
                    message: "Nhập thông tin bệnh mãn tính (nếu có)",
                  },
                ]}
                tooltip="Nếu không có bệnh mãn tính, có thể để trống trường này"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập thông tin bệnh mãn tính (nếu không có, để trống)"
                  className="health-profile-textarea"
                />
              </Form.Item>
            </Card>

            {/* THÔNG TIN SỨC KHỎE */}
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <HeartOutlined style={{ fontSize: "18px", color: "#1890ff", marginRight: "8px" }} />
                  <span>Chỉ số sức khỏe</span>
                </div>
              } 
              style={{ 
                flex: "1 1 45%", 
                minWidth: "300px", 
                borderRadius: "8px",
                background: "#fcfcfc",
                marginBottom: "20px"
              }}
              bordered={true}
            >
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Form.Item
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <EyeOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                      <span style={{ fontWeight: "600" }}>Thị lực</span>
                    </div>
                  }
                  name="visionTest"
                  rules={[
                    { required: true, message: "Vui lòng nhập thị lực" },
                    {
                      validator: (_, value) => {
                        if (!/^\d+(\.\d+)?$/.test(value)) {
                          return Promise.reject("Thị lực phải chỉ chứa số");
                        }
                        
                        const vision = parseFloat(value);
                        if (vision < 1 || vision > 10) {
                          return Promise.reject("Thị lực phải từ 1 đến 10");
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                  tooltip="Nhập giá trị từ 1-10"
                  style={{ flex: "1 1 45%", minWidth: "200px" }}
                >
                  <Input
                    placeholder="Nhập thị lực"
                    className="health-profile-input"
                    suffix="/10"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <SoundOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                      <span style={{ fontWeight: "600" }}>Thính lực</span>
                    </div>
                  }
                  name="hearingDetails"
                  rules={[
                    { required: true, message: "Vui lòng nhập thính lực" },
                    {
                      validator: (_, value) => {
                        if (!/^\d+(\.\d+)?$/.test(value)) {
                          return Promise.reject("Thính lực phải chỉ chứa số");
                        }
                        
                        const hearing = parseFloat(value);
                        if (hearing < 1 || hearing > 10) {
                          return Promise.reject("Thính lực phải từ 1 đến 10");
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                  tooltip="Nhập giá trị từ 1-10"
                  style={{ flex: "1 1 45%", minWidth: "200px" }}
                >
                  <Input
                    placeholder="Nhập thính lực"
                    className="health-profile-input"
                    suffix="/10"
                  />
                </Form.Item>
              </div>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Form.Item
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <ColumnHeightOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                      <span style={{ fontWeight: "600" }}>Chiều cao (cm)</span>
                    </div>
                  }
                  name="height"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập thông tin chiều cao",
                    },
                    {
                      validator: (_, value) => {
                        if (!/^\d+(\.\d+)?$/.test(value)) {
                          return Promise.reject("Chiều cao phải chỉ chứa số");
                        }
                        
                        const height = parseFloat(value);
                        if (height < 80 || height > 160) {
                          return Promise.reject("Chiều cao phải từ 80cm đến 160cm");
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                  tooltip="Nhập giá trị từ 80-160cm"
                  style={{ flex: "1 1 45%", minWidth: "200px" }}
                >
                  <Input
                    placeholder="Nhập thông tin chiều cao" 
                    className="health-profile-input"
                    suffix="cm"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <DashboardOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                      <span style={{ fontWeight: "600" }}>Cân nặng (kg)</span>
                    </div>
                  }
                  name="weight"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập thông tin cân nặng",
                    },
                    {
                      validator: (_, value) => {
                        if (!/^\d+(\.\d+)?$/.test(value)) {
                          return Promise.reject("Cân nặng phải chỉ chứa số");
                        }
                        
                        const weight = parseFloat(value);
                        if (weight < 15 || weight > 70) {
                          return Promise.reject("Cân nặng phải từ 15kg đến 70kg");
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                  tooltip="Nhập giá trị từ 15-70kg"
                  style={{ flex: "1 1 45%", minWidth: "200px" }}
                >
                  <Input
                    placeholder="Nhập thông tin cân nặng"
                    className="health-profile-input"
                    suffix="kg"
                  />
                </Form.Item>
              </div>

              <Form.Item
                label={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <CalendarOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                    <span style={{ fontWeight: "600" }}>Ngày khám gần nhất</span>
                  </div>
                }
                name="lastCheckupDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày khám" }]}
              >
                <DatePicker 
                  format="YYYY-MM-DD" 
                  style={{ width: "100%" }} 
                  className="health-profile-date"
                  placeholder="Chọn ngày khám gần nhất"
                />
              </Form.Item>

              <Form.Item
                label={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <HistoryOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                    <span style={{ fontWeight: "600" }}>Lịch sử điều trị</span>
                  </div>
                }
                name="treatmentHistory"
                rules={[{ required: true, message: "Vui lòng nhập lịch sử điều trị" }]}
                tooltip="Nếu không có lịch sử điều trị, ghi 'Không có'"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Nhập lịch sử điều trị (nếu không có, ghi 'Không có')" 
                  className="health-profile-textarea"
                />
              </Form.Item>
            </Card>
          </div>

          <Divider style={{ margin: "24px 0" }} />

          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/student-health-profile/edit")}
              style={{ 
                height: "44px", 
                borderRadius: "8px", 
                padding: "0 24px",
                fontSize: "16px"
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="health-profile-action-btn"
              icon={<PlusOutlined />}
              style={{ 
                height: "44px", 
                borderRadius: "8px", 
                padding: "0 32px",
                fontSize: "16px",
                fontWeight: "500",
                boxShadow: "0 2px 8px rgba(24, 144, 255, 0.35)"
              }}
            >
              {submitting ? "Đang tạo..." : "Tạo hồ sơ sức khỏe"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default HealthProfileCreatePage;
