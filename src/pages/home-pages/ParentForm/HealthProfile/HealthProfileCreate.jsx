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
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
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
        allergies: values.allergy,
        chronicDiseases: values.chronicDisease || "",
        treatmentHistory: values.treatmentHistory,
        visionDetails: values.visionTest ? `${values.visionTest}/10` : "",
        hearingDetails: values.hearingDetails ? `${values.hearingDetails}/10` : "",
        weight: values.weight,
        height: values.height,
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
    <div className="health-profile-wrapper">
      <Card className="health-profile-card">
        <Button
          type="primary"
          shape="round"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/home")}
          className="health-profile-back-btn"
        >
          Quay lại trang chủ
        </Button>
        <Title level={3} className="health-profile-title">
          Tạo hồ sơ sức khỏe học sinh
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="health-profile-form"
        >
          <div className="health-profile-form-row">
            <div className="health-profile-form-col">
              <Form.Item
                name="fullName"
                label="Họ và tên"
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
                >
                  {students.map((student) => (
                    <Option key={student.studentID} value={student.studentID}>
                      {student.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Lớp" name="className">
                <Input
                  disabled
                  placeholder="Chưa có thông tin"
                  className="health-profile-input"
                />
              </Form.Item>

              <Form.Item name="dob" label="Ngày tháng năm sinh">
                <DatePicker
                  format="DD/MM/YYYY"
                  disabled
                  style={{ width: "100%" }}
                  placeholder="Chưa có thông tin"
                  className="health-profile-date"
                />
              </Form.Item>

              <Form.Item
                label="Dị ứng"
                name="allergy"
                rules={[
                  { required: true, message: "Vui lòng nhập dị ứng (nếu có)" },
                ]}
              >
                <Input placeholder="Nhập dị ứng (nếu có)" className="health-profile-input" />
              </Form.Item>
            </div>

            <div className="health-profile-form-col">
              <Form.Item
                label="Thị lực"
                name="visionTest"
                rules={[
                  { required: true, message: "Vui lòng nhập thị lực" },
                  {
                    type: "number",
                    min: 1,
                    max: 10,
                    message: "Chỉ nhập số từ 1 đến 10",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: "100%" }}
                  addonAfter="/10"
                  placeholder="Nhập thị lực"
                  className="health-profile-input"
                />
              </Form.Item>

              <Form.Item
                label="Thính lực"
                name="hearingDetails"
                rules={[
                  { required: true, message: "Vui lòng nhập thính lực" },
                  {
                    type: "number",
                    min: 1,
                    max: 10,
                    message: "Chỉ nhập số từ 1 đến 10",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: "100%" }}
                  addonAfter="/10"
                  placeholder="Nhập thính lực"
                  className="health-profile-input"
                />
              </Form.Item>

              <Form.Item
                label="Ngày khám gần nhất"
                name="lastCheckupDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày khám" }]}
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} className="health-profile-date" />
              </Form.Item>

              <Form.Item
                label="Lịch sử điều trị"
                name="treatmentHistory"
                rules={[{ required: true, message: "Vui lòng nhập lịch sử điều trị" }]}
              >
                <Input.TextArea rows={2} placeholder="Nhập lịch sử điều trị (nếu có)" className="health-profile-textarea" />
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
                <Input placeholder="Nhập thông tin chiều cao (cm)" className="health-profile-input" />
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
                <Input placeholder="Nhập thông tin cân nặng (kg)" className="health-profile-input" />
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
                  className="health-profile-textarea"
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="health-profile-action-btn"
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
