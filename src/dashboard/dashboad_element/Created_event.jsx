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
} from "antd";
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  SendOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Title, Text, Paragraph } = Typography;

function Created_event() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/Notifications");

      // Xử lý response với cấu trúc mới có $values
      const notificationsData = response.data.$values || [];

      if (Array.isArray(notificationsData)) {
        // Transform notifications to match existing component structure
        const transformedNotifications = notificationsData.map(
          (notification) => ({
            id: notification.notificationID,
            title: notification.title,
            content: notification.content,
            date: notification.sentDate,
            status:
              notification.status === "Published" ? "created" : "in_progress",
            type: "notification", // Default type
            grade: "Toàn trường", // Default grade
          })
        );

        setNotifications(transformedNotifications);
      } else {
        message.error("Dữ liệu thông báo không đúng định dạng");
      }
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
      message.error("Không thể tải danh sách thông báo");
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

  const handleSendNotification = async () => {
    try {
      // Gọi API để gửi thông báo
      await api.post(`/Notifications/${selectedNotification.id}/send`);

      // Cập nhật trạng thái thông báo
      const updatedNotifications = notifications.map((notif) =>
        notif.id === selectedNotification.id
          ? { ...notif, status: "sent" }
          : notif
      );

      setNotifications(updatedNotifications);
      setSelectedNotification((prev) => ({ ...prev, status: "sent" }));

      message.success("Gửi thông báo thành công");
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
      message.error("Không thể gửi thông báo");
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
      await api.delete(`/Notifications/${notificationId}`);

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
        Danh sách thông báo
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
        title="Chi tiết thông báo"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="back" onClick={handleCloseModal}>
            Đóng
          </Button>,
          selectedNotification?.status === "created" && (
            <>
              <Button
                key="send"
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendNotification}
              >
                Gửi thông báo
              </Button>
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa thông báo này?"
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
    </div>
  );
}

export default Created_event;
