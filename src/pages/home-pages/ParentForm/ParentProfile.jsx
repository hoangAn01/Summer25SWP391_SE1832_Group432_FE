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
import { useNavigate } from "react-router-dom";
import moment from "moment";
import api from "../../../config/axios";
import { useSelector } from "react-redux";

const { Title } = Typography;

const ParentProfile = () => {
  const navigate = useNavigate();
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
        const parentResponse = await api.get(`/Parent/user/${userId}`);
        console.log("Parent Response:", parentResponse);

        setParentProfile(parentResponse.data);

        // Lấy parentID để gọi API học sinh
        const parentID = parentResponse.data.parentID;

        // Gọi API lấy danh sách học sinh với parentID
        const studentsResponse = await api.get(`/Student/${parentID}`);
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
          parentID: parentResponse.data.parentID,
          fullName: parentResponse.data.fullName,
          gender: parentResponse.data.gender,
          dateOfBirth: parentResponse.data.dateOfBirth
            ? moment(parentResponse.data.dateOfBirth)
            : null,
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

  const handleGoBack = () => {
    navigate("/home");
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async (values) => {
    try {
      setLoading(true);

      // Gọi API cập nhật - sử dụng PUT thay vì GET
      const response = await api.put(`/Parent/${values.parentID}`, {
        parentID: values.parentID,
        fullName: values.fullName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,
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
      render: (gender) =>
        gender === "M" ? "Nam" : gender === "F" ? "Nữ" : "Khác",
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

  // Render phần thông tin học sinh
  const renderStudentSection = () => (
    <Card
      title="Thông Tin Học Sinh"
      style={{
        marginTop: 24,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        borderRadius: "12px",
      }}
    >
      <Table
        columns={studentColumns}
        dataSource={studentList}
        rowKey="studentID"
        pagination={false}
        locale={{ emptyText: "Không có học sinh" }}
      />
    </Card>
  );

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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 64px)",
        paddingTop: "64px",
        padding: "20px",
        backgroundColor: "#f0f2f5",
        boxSizing: "border-box",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 900,
          textAlign: "center",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          borderRadius: "12px",
          position: "relative",
        }}
      >
        {/* Nút quay lại */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined style={{ fontSize: "20px" }} />}
          onClick={handleGoBack}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Quay lại
        </Button>

        {/* Nút chỉnh sửa */}
        <Button
          type="text"
          icon={<EditOutlined style={{ fontSize: "20px" }} />}
          onClick={handleEditProfile}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Chỉnh sửa
        </Button>

        <Title level={3} style={{ marginBottom: 24, paddingTop: 40 }}>
          Thông Tin Cá Nhân Phụ Huynh
        </Title>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Avatar
            size={180}
            icon={<UserOutlined />}
            style={{
              border: "4px solid #1890ff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          />
        </div>

        <Title level={4} style={{ marginBottom: 16 }}>
          {parentProfile?.fullName}
        </Title>

        <Descriptions title="Thông Tin Chi Tiết" bordered column={1}>
          <Descriptions.Item
            label={
              <>
                <UserOutlined style={{ marginRight: 8 }} />
                Mã Phụ Huynh
              </>
            }
          >
            {parentProfile?.parentID || "Chưa cập nhật"}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <ManOutlined style={{ marginRight: 8 }} />
                Giới Tính
              </>
            }
          >
            {parentProfile?.gender === "M"
              ? "Nam"
              : parentProfile?.gender === "F"
              ? "Nữ"
              : "Khác"}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <CalendarOutlined style={{ marginRight: 8 }} />
                Ngày Sinh
              </>
            }
          >
            {parentProfile?.dateOfBirth
              ? moment(parentProfile.dateOfBirth).format("DD/MM/YYYY")
              : "Chưa cập nhật"}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <HomeOutlined style={{ marginRight: 8 }} />
                Địa Chỉ
              </>
            }
            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
          >
            {parentProfile?.address}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <PhoneOutlined style={{ marginRight: 8 }} />
                Số Điện Thoại
              </>
            }
          >
            {parentProfile?.phone}
          </Descriptions.Item>
        </Descriptions>

        {/* Modal chỉnh sửa thông tin */}
        <Modal
          title="Chỉnh Sửa Thông Tin Cá Nhân"
          open={isEditing}
          onCancel={handleCancelEdit}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
            {/* Ẩn các trường ID */}
            <Form.Item name="parentID" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="parentID" label="Mã Phụ Huynh">
              <Input
                prefix={<UserOutlined />}
                disabled
                placeholder="Mã phụ huynh"
              />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Họ và Tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Giới Tính"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select placeholder="Chọn giới tính">
                <Select.Option value="F">Nữ</Select.Option>
                <Select.Option value="M">Nam</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="dateOfBirth" label="Ngày Sinh">
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>

            <Form.Item name="address" label="Địa Chỉ">
              <Input prefix={<HomeOutlined />} placeholder="Nhập địa chỉ" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số Điện Thoại"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Số điện thoại phải có 10 chữ số",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>

            <Form.Item
              name="studentID"
              label="Chọn học sinh"
              rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
            >
              <Select
                placeholder="Tìm và chọn học sinh"
                onChange={handleStudentSelect}
                showSearch
                optionFilterProp="children"
              >
                {students.map((student) => (
                  <Select.Option key={student.value} value={student.value}>
                    {student.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="studentName" label="Tên học sinh">
              <Input disabled />
            </Form.Item>
            <Form.Item name="className" label="Lớp">
              <Input disabled />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Lưu Thay Đổi
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Thêm phần hiển thị thông tin học sinh */}
        {studentList.length > 0 && renderStudentSection()}
      </Card>
    </div>
  );
};

export default ParentProfile;
