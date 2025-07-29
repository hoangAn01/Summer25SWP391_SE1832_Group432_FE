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
  UserOutlined,
  HistoryOutlined,
  HeartOutlined,
  InfoCircleOutlined as InfoIcon,
} from "@ant-design/icons";
import api from "../../../../config/axios";
import { useSelector } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import dayjs from "dayjs";
import { toast } from "react-toastify";
import "./HealthProfileForm.css";

const { Title } = Typography;
const { Option } = Select;

const HealthProfileEdit = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState();
  const [isEdit, setIsEdit] = useState(false);

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
        console.log('parentID dùng để lấy học sinh:', parentID);
        const studentsResponse = await api.get(`/Student/by-parent/${parentID}`);

        // Lấy danh sách học sinh chưa được tạo profile
        // const studentsResponse = await api.get(
        //   `/HealthProfile/students-without-profile?parentId=${parentID}`
        // );

        // Xử lý response với cấu trúc mới có $values
        if (studentsResponse.status === 200) {
          const studentsData = studentsResponse.data.$values || studentsResponse.data;
          setStudents(Array.isArray(studentsData) ? studentsData : []);
          setSelectedStudent(Array.isArray(studentsData) && studentsData[0] ? studentsData[0] : null);
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

  useEffect(() => {
    form.setFieldsValue({
      fullName: selectedStudent?.fullName,
      className: selectedStudent?.className,
      dob: selectedStudent?.dateOfBirth
        ? moment(selectedStudent?.dateOfBirth)
        : null,
    });

    if (selectedStudent) {
      const fetchProfileBySelectedStudent = async () => {
        try {
          const response = await api.get(
            `/HealthProfile/student/${selectedStudent.studentID}`
          );
          if (response.status === 200 && response.data) {
            console.log("Dữ liệu profile nhận được:", response.data);
            
            // Kiểm tra xem ID có tồn tại không
            const profileData = response.data;
            const profileID = profileData.id || profileData.healthProfileID || profileData.profileID;
            
            if (!profileID) {
              console.warn("Không tìm thấy ID trong dữ liệu profile:", profileData);
              // Nếu không tìm thấy ID, log toàn bộ đối tượng để kiểm tra
              console.log("Toàn bộ đối tượng profile:", JSON.stringify(profileData));
            } else {
              console.log("Đã tìm thấy ID:", profileID);
            }
            
            setProfile(profileData);
            
            form.setFieldsValue({
              chronicDisease: profileData.chronicDiseases || "",
              visionTest: profileData.visionDetails ? parseInt(profileData.visionDetails) : undefined,
              allergy: profileData.allergies,
              weight: profileData.weight,
              height: profileData.height,
              lastCheckupDate: profileData.lastUpdated && dayjs(profileData.lastUpdated),
              treatmentHistory: profileData.treatmentHistory,
              hearingDetails: profileData.hearingDetails ? parseInt(profileData.hearingDetails) : undefined,
            });
          } else {
            setProfile(null);
            form.resetFields(); // Reset form khi không có profile
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin profile:", error);
          setProfile(null);
          form.resetFields(); // Reset form khi lỗi
   
        } finally {
          setLoading(false);
        }
      };

      fetchProfileBySelectedStudent();
    }
  }, [selectedStudent]);

  const onFinish = async (values) => {
    if (!selectedStudent) {
      message.error("Vui lòng chọn học sinh");
      return;
    }

    setSubmitting(true);

    try {
      // Log chi tiết về profile để debug
      console.log("Chi tiết profile:", profile);
      
      // Kiểm tra xem profile có tồn tại không
      if (!profile) {
        console.error("Không tìm thấy profile");
        message.error("Không tìm thấy hồ sơ. Vui lòng thử lại.");
        setSubmitting(false);
        return;
      }

      // Tìm ID từ các trường có thể có
      const profileID = profile.id || profile.healthProfileID || profile.profileID;
      
      if (!profileID) {
        console.error("Không tìm thấy ID trong profile:", profile);
        message.error("Không tìm thấy ID hồ sơ. Vui lòng thử lại.");
        setSubmitting(false);
        return;
      }
      
      console.log("ProfileID sẽ sử dụng:", profileID);
      
      const data = {
        // Đảm bảo gửi đúng ID trong body request
        id: profileID,
        healthProfileID: profileID,
        allergies: values.allergy || "",
        chronicDiseases: values.chronicDisease || "",
        treatmentHistory: values.treatmentHistory || "",
        visionDetails: values.visionTest ? values.visionTest.toString() : "",
        hearingDetails: values.hearingDetails || "",
        weight: parseFloat(values.weight) || 0,
        height: parseFloat(values.height) || 0
      };

      console.log("Health profile data gửi đi:", data);
      
      // Sửa lại cách gọi API - id là path parameter
      const response = await api.put(`/HealthProfile/${profileID}`, data);
      console.log("Response từ server:", response.data);

      toast.success("Lưu hồ sơ thành công! Mã hồ sơ: " + profileID);
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ sức khỏe:", error);
      if (error.response && error.response.data) {
        console.error("Chi tiết lỗi:", JSON.stringify(error.response.data));
      }
      message.error(
        error.response?.data?.message || "Cập nhật hồ sơ thất bại! Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
      setIsEdit(false);
    }
  };

  console.log("student: ", selectedStudent);
  console.log("profile: ", profile);

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
          Hồ sơ sức khỏe học sinh của {selectedStudent?.fullName}
        </Title>
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <Select
            value={selectedStudent?.studentID}
            placeholder="Chọn học sinh"
            loading={loading}
            onChange={(value) => {
              const student = Array.isArray(students) ? students.find((s) => s.studentID === value) : null;
              if (student) {
                setSelectedStudent(student);
              }
            }}
            style={{ width: 320, maxWidth: "100%", minWidth: 200 }}
            className="health-profile-select"
          >
            {Array.isArray(students) && students.map((student) => (
              <Option key={student.studentID} value={student.studentID}>
                {student.fullName}
              </Option>
            ))}
          </Select>
          {!isEdit && (
            <button
              style={{
                height: "100%",
                cursor: "pointer",
                backgroundColor: "rgb(22, 119, 255)",
                color: "white",
                padding: "4px 10px",
                borderRadius: "5px",
                border: "none",
              }}
              onClick={() => setIsEdit(true)}
            >
              Chỉnh sửa
            </button>
          )}
        </div>
        {profile ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="health-profile-form"
          >
            <div className="health-profile-form-row">
              <div className="health-profile-form-col">
                <Card
                  title={
                    <span>
                      <UserOutlined /> Thông tin học sinh
                    </span>
                  }
                  style={{ borderRadius: 12, background: "#f6faff" }}
                  bodyStyle={{ padding: 24 }}
                >
                  <Form.Item
                    name="fullName"
                    label={
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1677ff",
                          fontSize: 16,
                        }}
                      >
                        Họ và tên
                      </span>
                    }
                    rules={[
                      { required: true, message: "Vui lòng nhập tên học sinh" },
                    ]}
                  >
                    <Input
                      disabled
                      placeholder="Tên học sinh"
                      className="health-profile-input"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1677ff",
                          fontSize: 16,
                        }}
                      >
                        Lớp
                      </span>
                    }
                  >
                    <Input
                      name="className"
                      value={selectedStudent?.className || ""}
                      disabled
                      placeholder="Chưa có thông tin"
                      className="health-profile-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="dob"
                    label={
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1677ff",
                          fontSize: 16,
                        }}
                      >
                        Ngày tháng năm sinh
                      </span>
                    }
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      disabled
                      style={{ width: "100%" }}
                      placeholder="Chưa có thông tin"
                      className="health-profile-date"
                    />
                  </Form.Item>
                </Card>
              </div>
              <div className="health-profile-form-col">
                <Card
                  title={
                    <span>
                      <HeartOutlined /> Thông tin sức khỏe
                    </span>
                  }
                  style={{ borderRadius: 12, background: "#f9f9f9" }}
                  bodyStyle={{ padding: 24 }}
                >
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1677ff",
                          fontSize: 16,
                        }}
                      >
                        Thị lực
                      </span>
                    }
                    name="visionTest"
                    rules={[
                      { required: true, message: "Vui lòng nhập thị lực" },
                    ]}
                  >
                    {isEdit ? (
                      <Input
                        placeholder="Nhập thị lực"
                        className="health-profile-input"
                      />
                    ) : (
                      <div style={{ minHeight: 32, fontSize: 16, color: "#222", borderRadius: 8, background: "#f5f5f5", padding: 8 }}>
                        {form.getFieldValue("visionTest") || <span style={{ color: "#888" }}>Chưa có thông tin</span>}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1677ff",
                          fontSize: 16,
                        }}
                      >
                        Ngày khám gần nhất
                      </span>
                    }
                    name="lastCheckupDate"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày khám" },
                    ]}
                  >
                    {isEdit ? (
                      <DatePicker
                        format="YYYY-MM-DD"
                        style={{ width: "100%" }}
                        className="health-profile-date"
                      />
                    ) : (
                      <div style={{ minHeight: 32, fontSize: 16, color: "#222", borderRadius: 8, background: "#f5f5f5", padding: 8 }}>
                        {form.getFieldValue("lastCheckupDate") ? form.getFieldValue("lastCheckupDate").format("YYYY-MM-DD") : <span style={{ color: "#888" }}>Chưa có thông tin</span>}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1677ff",
                          fontSize: 16,
                        }}
                      >
                        Chiều cao
                      </span>
                    }
                    name="height"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập thông tin chiều cao",
                      },
                    ]}
                  >
                    {isEdit ? (
                      <Input
                        placeholder="Nhập thông tin chiều cao"
                        className="health-profile-input"
                        addonAfter="cm"
                      />
                    ) : (
                      <div style={{ minHeight: 32, fontSize: 16, color: "#222", borderRadius: 8, background: "#f5f5f5", padding: 8 }}>
                        {form.getFieldValue("height") ? `${form.getFieldValue("height")} cm` : <span style={{ color: "#888" }}>Chưa có thông tin</span>}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1677ff",
                          fontSize: 16,
                        }}
                      >
                        Cân nặng
                      </span>
                    }
                    name="weight"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập thông tin cân nặng",
                      },
                    ]}
                  >
                    {isEdit ? (
                      <Input
                        placeholder="Nhập thông tin cân nặng"
                        className="health-profile-input"
                        addonAfter="kg"
                      />
                    ) : (
                      <div style={{ minHeight: 32, fontSize: 16, color: "#222", borderRadius: 8, background: "#f5f5f5", padding: 8 }}>
                        {form.getFieldValue("weight") ? `${form.getFieldValue("weight")} kg` : <span style={{ color: "#888" }}>Chưa có thông tin</span>}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1677ff",
                          fontSize: 16,
                        }}
                      >
                        Bệnh Mãn Tính
                      </span>
                    }
                    name="chronicDisease"
                    rules={[
                      {
                        required: false,
                        message: "Nhập thông tin bệnh mãn tính (nếu có)",
                      },
                    ]}
                  >
                    {isEdit ? (
                      <Input.TextArea
                        rows={3}
                        placeholder="Nhập thông tin bệnh mãn tính (nếu không có, để trống)"
                        className="health-profile-textarea"
                      />
                    ) : (
                      <div style={{ minHeight: 48, fontSize: 16, color: "#222", borderRadius: 8, background: "#f5f5f5", padding: 8 }}>
                        {form.getFieldValue("chronicDisease")?.trim()
                          ? form.getFieldValue("chronicDisease")
                          : <span style={{ color: "#888" }}>Không có bệnh mãn tính</span>}
                      </div>
                    )}
                  </Form.Item>
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1677ff",
                          fontSize: 16,
                        }}
                      >
                        Dị ứng
                      </span>
                    }
                    name="allergy"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập dị ứng (nếu có)",
                      },
                    ]}
                  >
                    {isEdit ? (
                      <Input
                        placeholder="Nhập dị ứng (nếu có)"
                        className="health-profile-input"
                      />
                    ) : (
                      <div style={{ minHeight: 32, fontSize: 16, color: "#222", borderRadius: 8, background: "#f5f5f5", padding: 8 }}>
                        {form.getFieldValue("allergy")?.trim()
                          ? form.getFieldValue("allergy")
                          : <span style={{ color: "#888" }}>Không có dị ứng</span>}
                      </div>
                    )}
                  </Form.Item>
                </Card>
              </div>
            </div>

            {isEdit && (
              <Form.Item style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  htmlType="button"
                  loading={submitting}
                  variant="solid"
                  color="yellow"
                  className="health-profile-action-btn"
                  onClick={() => setIsEdit(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  className="health-profile-action-btn"
                >
                  {submitting ? "Đang lưu..." : "Lưu hồ sơ"}
                </Button>
              </Form.Item>
            )}
          </Form>
        ) : (
          <Card
            style={{
              width: "100%",
              marginTop: "40px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              overflow: "hidden",
              background: "linear-gradient(to right, #f0f7ff, #e6f7ff)",
              border: "1px solid #e6f0fa"
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
              <div 
                style={{ 
                  width: "100px", 
                  height: "100px", 
                  backgroundColor: "#e6f7ff", 
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 2px 10px rgba(24, 144, 255, 0.2)",
                  marginBottom: "20px"
                }}
              >
                <HeartOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
              </div>
              
              <Typography.Title level={4} style={{ marginBottom: "16px", textAlign: "center" }}>
                Chưa có hồ sơ sức khỏe
              </Typography.Title>
              
              <Typography.Paragraph style={{ fontSize: "16px", textAlign: "center", maxWidth: "600px", marginBottom: "24px", color: "#595959" }}>
                Học sinh <b>{selectedStudent?.fullName}</b> hiện chưa có hồ sơ sức khỏe. 
                Việc tạo hồ sơ sức khỏe sẽ giúp nhà trường theo dõi và chăm sóc sức khỏe học sinh tốt hơn.
              </Typography.Paragraph>
              
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate("/create-health-profile")}
                style={{ 
                  height: "48px", 
                  borderRadius: "24px", 
                  fontSize: "16px", 
                  fontWeight: "500",
                  padding: "0 32px",
                  boxShadow: "0 2px 8px rgba(24, 144, 255, 0.35)"
                }}
              >
                Tạo hồ sơ sức khỏe mới
              </Button>
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginTop: "32px", 
                padding: "12px 16px",
                background: "#f0f7ff",
                borderRadius: "8px",
                border: "1px dashed #1890ff"
              }}>
                <InfoIcon style={{ fontSize: "20px", color: "#1890ff", marginRight: "8px" }} />
                <Typography.Text style={{ color: "#1890ff" }}>
                  Hồ sơ sức khỏe chứa thông tin quan trọng về thị lực, thính lực, dị ứng và tiền sử bệnh.
                </Typography.Text>
              </div>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default HealthProfileEdit;
