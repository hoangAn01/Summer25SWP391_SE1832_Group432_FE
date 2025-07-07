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
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Title, Text, Paragraph } = Typography;

function Created_event() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState(false);
  const [notificationForm] = Form.useForm();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/VaccinationEvent");
      const eventsData = response.data.$values || response.data;
      const transformedNotifications = eventsData.map((event) => ({
        id: event.eventID,
        title: event.eventName,
        content: `Địa điểm: ${event.location} - Khối lớp: ${event.classID}`,
        date: event.date,
        status: "created",
        type: "vaccine",
        grade: event.classID === 0 ? "Toàn trường" : `Khối ${event.classID}`,
      }));
      transformedNotifications.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
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
        vaccinationEventID:
          values.notificationType === "VACCINATION"
            ? selectedNotification.id
            : null,
        medicalEventID:
          values.notificationType === "MEDICAL_EVENT"
            ? selectedNotification.id
            : null,
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
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification.status === "sent") {
        message.error("Không thể xóa sự kiện đã gửi");
        return;
      }
      await api.delete(`/VaccinationEvent/${notificationId}`);
      const updatedNotifications = notifications.filter(
        (notif) => notif.id !== notificationId
      );
      setNotifications(updatedNotifications);
      if (selectedNotification?.id === notificationId) {
        handleCloseModal();
      }
      message.success("Xóa sự kiện thành công");
    } catch (error) {
      console.error("Lỗi khi xóa sự kiện:", error);
      message.error("Không thể xóa sự kiện");
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
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa sự kiện này?"
                  onConfirm={() => handleDeleteNotification(item.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedNotification(item);
                    setIsNotificationModalVisible(true);
                  }}
                >
                  Tạo thông báo
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
                        Đã tạo sự kiện
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
        title="Chi tiết sự kiện"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedNotification && (
          <div>
            <Title level={4}>{selectedNotification.title}</Title>
            <Paragraph>{selectedNotification.content}</Paragraph>
            <Text strong>Ngày tổ chức: </Text>
            <Text>{selectedNotification.date}</Text>
            <br />
            <Text strong>Khối lớp: </Text>
            <Text>{selectedNotification.grade}</Text>
          </div>
        )}
      </Modal>
      <Modal
        title="Tạo thông báo cho sự kiện"
        open={isNotificationModalVisible}
        onCancel={() => setIsNotificationModalVisible(false)}
        footer={null}
      >
        <Form
          form={notificationForm}
          layout="vertical"
          onFinish={handleCreateNotification}
        >
          <Form.Item
            name="title"
            label="Tiêu đề thông báo"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung thông báo"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="notificationType"
            label="Loại thông báo"
            rules={[
              { required: true, message: "Vui lòng chọn loại thông báo" },
            ]}
          >
            <Select>
              <Select.Option value="VACCINATION">Tiêm chủng</Select.Option>
              <Select.Option value="MEDICAL_EVENT">Sự kiện y tế</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo thông báo
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Created_event;
