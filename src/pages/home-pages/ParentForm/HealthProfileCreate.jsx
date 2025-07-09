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
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import api from "../../../config/axios";
import { useSelector } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom";

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
        fullName: selectedStudent.fullName,
        className: selectedStudent.className,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
        chronicDisease: values.chronicDisease || "",
        visionTest: values.visionTest,
        allergy: values.allergy,
        weight: values.weight,
        height: values.height,
        lastCheckupDate: values.lastCheckupDate
          ? values.lastCheckupDate.format("YYYY-MM-DD")
          : new Date().toISOString().split("T")[0],
      };

      console.log("Health profile data:", data);
      const res = await api.post(`/HealthProfile`, data);

      message.success("Tạo hồ sơ thành công! Mã hồ sơ: " + res.data.profileID);
      navigate(`/student-health-profile/${res.data.studentID}`);

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
        <Button
          type="primary"
          shape="round"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/home")}
          style={{
            position: "absolute",
            left: 24,
            top: 24,
            background: "#f0f5ff",
            color: "#1677ff",
            border: "none",
            boxShadow: "0 2px 8px #1677ff22",
            fontWeight: 600,
            fontSize: 16,
            zIndex: 10,
            transition: "all 0.2s",
          }}
        >
          Quay lại trang chủ
        </Button>
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
                    const student = students.find((s) => s.studentID === value);
                    if (student) {
                      form.setFieldsValue({
                        className: student.className,
                        dob: student.dateOfBirth
                          ? moment(student.dateOfBirth)
                          : null,
                      });
                      setSelectedStudent(student);
                    }
                  }}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {students.map((student) => (
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

              <Form.Item name="dob" label="Ngày tháng năm sinh">
                <DatePicker
                  format="DD/MM/YYYY"
                  disabled
                  style={{ width: "100%" }}
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
              <Form.Item
                label="Thị lực"
                name="visionTest"
                rules={[{ required: true, message: "Vui lòng nhập thị lực" }]}
              >
                <Input placeholder="Nhập thị lực" />
              </Form.Item>

              <Form.Item
                label="Ngày khám gần nhất"
                name="lastCheckupDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày khám" }]}
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Chiều cao(Cm)"
                name="height"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thông tin chiều cao",
                  },
                ]}
              >
                <Input placeholder="Nhập thông tin chiều cao (cm)" />
              </Form.Item>

              <Form.Item
                label="Cân nặng(Kg)"
                name="weight"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thông tin cân nặng",
                  },
                ]}
              >
                <Input placeholder="Nhập thông tin cân nặng (kg)" />
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
              loading={submitting}
              style={{ minWidth: 180, fontWeight: 600, fontSize: 16 }}
            >
              {submitting ? "Đang tạo..." : "Tạo hồ sơ"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default HealthProfileCreatePage;
