import React, { useState, useEffect } from "react";
import {
  Avatar,
  Typography,
  Card,
  Button,
  Form,
  Input,
  Modal,
  message,
  DatePicker,
  Select,
  Descriptions,
  Spin,
  Alert,
  Table,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  ManOutlined,
} from "@ant-design/icons";
import moment from "moment";
import api from "../../../../config/axios";
import { useSelector } from "react-redux";
import "./ParentProfile.css";

const { Title } = Typography;

const ParentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [parentProfile, setParentProfile] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);

  // Lấy ID người dùng từ Redux store
  const user = useSelector((state) => state.user);
  const userId = user?.userID;

  useEffect(() => {
    const fetchParentAndStudentInfo = async () => {
      try {
        // Kiểm tra nếu không có userId
        if (!userId) {
          throw new Error("Không tìm thấy ID người dùng");
        }

        // Gọi API lấy thông tin phụ huynh
        const parentResponse = await api.get(`Parent/ByAccount/${userId}`);
        console.log("Parent Response:", parentResponse);

        setParentProfile(parentResponse.data);

        // Lấy parentID để gọi API học sinh
        const parentID = parentResponse.data.parentID;

        // Gọi API lấy danh sách học sinh với parentID
        const studentsResponse = await api.get(`Student/by-parent/${parentID}`);
        console.log("Students Response:", studentsResponse);

        // Lấy danh sách học sinh từ $values
        const studentsData =
          studentsResponse.data.$values || studentsResponse.data;
        setStudentList(studentsData);

        // Mapping danh sách học sinh cho form select
        const mappedStudents = studentsData.map((student) => ({
          value: student.studentID.toString(),
          label: student.fullName,
          studentName: student.fullName,
          className: student.className,
        }));
        setStudents(mappedStudents);

        // Điền thông tin vào form chỉnh sửa
        form.setFieldsValue({
          fullName: parentResponse.data.fullName,
          address: parentResponse.data.address,
          phone: parentResponse.data.phone,
        });

        setLoading(false);
      } catch (err) {
        console.error("Full error object:", err);
        console.error("Error response:", err.response);
        console.error("Error request:", err.request);
        console.error("Error message:", err.message);

        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Không thể tải thông tin",
          status: err.response?.status,
        });
        setLoading(false);
        message.error(
          `Lỗi tải thông tin: ${err.response?.status || "Unknown"}`
        );
      }
    };

    fetchParentAndStudentInfo();
  }, [userId, form]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async (values) => {
    try {
      setLoading(true);

      // Gọi API cập nhật - sử dụng PUT thay vì GET
      const response = await api.put(`Parent/${parentProfile?.parentID}`, {
        fullName: values.fullName,
        address: values.address,
        phone: values.phone,
      });

      message.success("Cập nhật thông tin thành công");

      // Cập nhật lại thông tin
      setParentProfile(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      message.error("Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleStudentSelect = (studentID) => {
    const student = students.find((s) => s.value === studentID);
    if (student) {
      form.setFieldsValue({
        studentName: student.studentName,
        className: student.className,
      });
    }
  };

  // Cột cho bảng học sinh
  const studentColumns = [
    {
      title: "Mã Học Sinh",
      dataIndex: "studentID",
      key: "studentID",
    },
    {
      title: "Họ và Tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Giới Tính",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Ngày Sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (dateOfBirth) => moment(dateOfBirth).format("DD/MM/YYYY"),
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }

  return (
    <div className="parent-profile-wrapper">
      <div className="parent-profile-container">
        {/* Cột trái: Thông tin phụ huynh */}
        <div className="parent-profile-left">
          <div style={{ position: 'relative', width: '100%' }}>
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined style={{ fontSize: "20px" }} />}
              onClick={handleEditProfile}
              className="parent-profile-edit-btn"
            />
          </div>
          <Avatar
            size={140}
            icon={<UserOutlined />}
            className="parent-profile-avatar"
          />
          <Title level={4} className="parent-profile-title">
            {parentProfile?.fullName}
          </Title>
          <Descriptions bordered column={1} className="parent-profile-desc">
            <Descriptions.Item
              label={<span style={{ color: '#1976d2', fontWeight: 500 }}><HomeOutlined style={{ marginRight: 8, color: '#1976d2' }} />Địa Chỉ</span>}
              style={{ wordBreak: "break-word", whiteSpace: "normal" }}
            >
              {parentProfile?.address}
            </Descriptions.Item>
            <Descriptions.Item
              label={<span style={{ color: '#1976d2', fontWeight: 500 }}><PhoneOutlined style={{ marginRight: 8, color: '#1976d2' }} />Số Điện Thoại</span>}
            >
              {parentProfile?.phone}
            </Descriptions.Item>
          </Descriptions>
        </div>
        {/* Cột phải: Bảng học sinh */}
        <div className="parent-profile-right">
          <Card
            title={<span style={{ color: '#1976d2', fontWeight: 700 }}>Thông Tin Học Sinh</span>}
            className="parent-profile-student-card"
            headStyle={{ background: '#e3f2fd', borderRadius: '18px 18px 0 0', fontWeight: 700, fontSize: 18 }}
            bodyStyle={{ borderRadius: '0 0 18px 18px', padding: 0 }}
          >
            <Table
              columns={studentColumns}
              dataSource={studentList}
              rowKey="studentID"
              pagination={false}
              locale={{ emptyText: "Không có học sinh" }}
              className="parent-profile-student-table"
              bordered
              size="middle"
            />
          </Card>
        </div>
      </div>
      {/* Modal chỉnh sửa thông tin */}
      <Modal
        title={<span style={{ color: '#1976d2', fontWeight: 700 }}>Chỉnh Sửa Thông Tin Cá Nhân</span>}
        open={isEditing}
        onCancel={handleCancelEdit}
        footer={null}
        centered
        bodyStyle={{ padding: 32, borderRadius: 16, background: '#f5fafd' }}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProfile} style={{ maxWidth: 400, margin: '0 auto' }}>
          {/* Ẩn các trường ID */}

          <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}> 
            <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="address" label="Địa Chỉ">
            <Input prefix={<HomeOutlined />} placeholder="Nhập địa chỉ" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="phone" label="Số Điện Thoại" rules={[{ pattern: /^[0-9]{10}$/, message: "Số điện thoại phải có 10 chữ số" }]}> 
            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="studentID" label="Chọn học sinh" rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}> 
            <Select placeholder="Tìm và chọn học sinh" onChange={handleStudentSelect} showSearch optionFilterProp="children" style={{ borderRadius: 8 }}>
              {students.map((student) => (
                <Select.Option key={student.value} value={student.value}>
                  {student.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="studentName" label="Tên học sinh">
            <Input disabled style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="className" label="Lớp">
            <Input disabled style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 8, fontWeight: 700, fontSize: 16, background: '#1976d2', boxShadow: '0 2px 8px rgba(33,150,243,0.10)' }}>
              Lưu Thay Đổi
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ParentProfile;
