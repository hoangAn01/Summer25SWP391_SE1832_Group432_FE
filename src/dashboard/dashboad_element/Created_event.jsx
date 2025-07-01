import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Typography,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Popconfirm,
  Form,
  Input,
  Select,
} from "antd";
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  SendOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Title, Text, Paragraph } = Typography;

function Created_event() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [notificationForm] = Form.useForm();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/VaccinationEvent");
      const eventsData = response.data.$values || response.data;
      const transformedNotifications = eventsData.map(event => ({
        id: event.eventID, // Ẩn không hiển thị trên UI
        title: event.eventName,
        content: `Địa điểm: ${event.location} - Khối lớp: ${event.classID}`,
        date: event.date,
        status: "created", // hoặc map theo logic nếu có
        type: "vaccine",
        grade: event.classID === 0 ? "Toàn trường" : `Khối ${event.classID}`,
        // Không hiển thị vaccineRecords, managerID
      }));
      // Sắp xếp theo thời gian mới nhất lên đầu
      transformedNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự kiện tiêm chủng:", error);
      message.error("Không thể tải danh sách sự kiện tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "vaccine":
        return (
          <MedicineBoxOutlined style={{ color: "#1890ff", fontSize: "24px" }} />
        );
      case "health_check":
        return (
          <MedicineBoxOutlined style={{ color: "#1890ff", fontSize: "24px" }} />
        );
      default:
        return (
          <CalendarOutlined style={{ color: "#faad14", fontSize: "24px" }} />
        );
    }
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedNotification(null);
  };

  const handleCreateNotification = async (values) => {
    try {
      const payload = {
        title: values.title,
        content: values.content,
        status: "created",
        notificationType: values.notificationType,
        vaccinationEventID: values.notificationType === "VACCINATION" ? selectedNotification.id : null,
        medicalEventID: values.notificationType === "MEDICAL_EVENT" ? selectedNotification.id : null,
        parentIds: [],
        eventTime: selectedNotification.date,
      };
      await api.post("/Notifications", payload);
      message.success("Tạo thông báo thành công!");
      setIsNotificationModalVisible(false);
      notificationForm.resetFields();
    } catch {
      message.error("Không thể tạo thông báo");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // Kiểm tra trạng thái trước khi xóa
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification.status === "sent") {
        message.error("Không thể xóa thông báo đã gửi");
        return;
      }

      // Gọi API xóa thông báo
      await api.delete(`/VaccinationEvent/${notificationId}`);

      // Cập nhật danh sách thông báo
      const updatedNotifications = notifications.filter(
        (notif) => notif.id !== notificationId
      );
      setNotifications(updatedNotifications);

      // Đóng modal nếu đang mở thông báo bị xóa
      if (selectedNotification?.id === notificationId) {
        handleCloseModal();
      }

      message.success("Xóa thông báo thành công");
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
      message.error("Không thể xóa thông báo");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        Danh sách sự kiện đã tạo 
      </Title>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={notifications}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <Button type="link" onClick={() => handleViewDetails(item)}>
                  Chi tiết
                </Button>,
              ]}
            >
              <Card.Meta
                avatar={getEventIcon(item.type)}
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{item.title}</span>
                    {item.status === "created" && (
                      <Tag color="orange" style={{ marginLeft: 8 }}>
                        Đã tạo sự kiện, chưa gửi
                      </Tag>
                    )}
                    {item.status === "sent" && (
                      <Tag color="green" style={{ marginLeft: 8 }}>
                        Đã gửi
                      </Tag>
                    )}
                    {item.status === "in_progress" && (
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        Đang xử lý
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <Space direction="vertical">
                    <Text>
                      <CalendarOutlined /> {item.date}
                    </Text>
                    <Tag color="blue">{item.grade}</Tag>
                  </Space>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Chi tiết sự kiện "
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="back" onClick={handleCloseModal}>
            Đóng
          </Button>,
          selectedNotification?.status === "created" && (
            <>
              <Button
                key="create-notification"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsNotificationModalVisible(true)}
              >
                Tạo thông báo
              </Button>
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa sự kiện  này?"
                onConfirm={() =>
                  handleDeleteNotification(selectedNotification.id)
                }
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button key="delete" type="danger" icon={<DeleteOutlined />}>
                  Xóa thông báo
                </Button>
              </Popconfirm>
            </>
          ),
        ]}
        width={800}
        bodyStyle={{
          padding: "30px",
          maxHeight: "600px",
          overflowY: "auto",
        }}
        style={{
          top: "50px",
        }}
      >
        {selectedNotification && (
          <div>
            <Title level={3} style={{ marginBottom: 20 }}>
              {selectedNotification.title}
            </Title>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Text strong style={{ marginRight: 10 }}>
                  Thời gian:{" "}
                </Text>
                <Text>{selectedNotification.date}</Text>
              </div>
              <div>
                <Text strong style={{ marginRight: 10, verticalAlign: "top" }}>
                  Nội dung:{" "}
                </Text>
                <Paragraph
                  style={{
                    backgroundColor: "#f0f2f5",
                    padding: "15px",
                    borderRadius: "8px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedNotification.content}
                </Paragraph>
              </div>
              <div>
                <Text strong style={{ marginRight: 10 }}>
                  Trạng thái:{" "}
                </Text>
                {selectedNotification.status === "created" && (
                  <Tag color="orange">Đã tạo sự kiện, chưa gửi</Tag>
                )}
                {selectedNotification.status === "sent" && (
                  <Tag color="green">Đã gửi</Tag>
                )}
                {selectedNotification.status === "in_progress" && (
                  <Tag color="blue">Đang xử lý</Tag>
                )}
              </div>
            </Space>
          </div>
        )}
      </Modal>

      <Modal
        title="Tạo thông báo cho sự kiện tiêm chủng"
        open={isNotificationModalVisible}
        onCancel={() => setIsNotificationModalVisible(false)}
        footer={null}
      >
        <Form form={notificationForm} layout="vertical" onFinish={handleCreateNotification}>
          <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Nội dung" name="content" rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Loại thông báo" name="notificationType" rules={[{ required: true, message: "Vui lòng chọn loại thông báo" }]}>
            <Select placeholder="Chọn loại thông báo">
              <Select.Option value="VACCINATION">Tiêm chủng</Select.Option>
              <Select.Option value="MEDICAL_EVENT">Sự kiện y tế</Select.Option>
              <Select.Option value="CHECKUP_CONSENT">Đồng ý kiểm tra sức khỏe</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo thông báo
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Created_event;
