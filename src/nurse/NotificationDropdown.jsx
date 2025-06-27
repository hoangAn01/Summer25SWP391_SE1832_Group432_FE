import React, { useState, useEffect } from "react";
import {
  Badge,
  Dropdown,
  List,
  Avatar,
  Typography,
  Space,
  Button,
  message,
} from "antd";
import {
  BellOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import api from "../config/axios";
import { useSelector } from "react-redux";

const { Text } = Typography;

const NotificationDropdown = () => {
  const user = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Lấy thông báo từ localStorage
  const getStoredNotifications = () => {
    try {
      const stored = localStorage.getItem(
        `notifications_${user?.userID || "nurse"}`
      );
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Lỗi khi đọc thông báo từ localStorage:", error);
      return [];
    }
  };

  // Lưu thông báo vào localStorage
  const saveNotifications = (notifs) => {
    try {
      localStorage.setItem(
        `notifications_${user?.userID || "nurse"}`,
        JSON.stringify(notifs)
      );
    } catch (error) {
      console.error("Lỗi khi lưu thông báo:", error);
    }
  };

  // Tạo thông báo mới
  const createNotification = (type, title, message, data = {}) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      data,
      time: new Date().toISOString(),
      read: false,
      timestamp: Date.now(),
    };

    const currentNotifications = getStoredNotifications();
    const updatedNotifications = [
      newNotification,
      ...currentNotifications,
    ].slice(0, 50); // Giữ tối đa 50 thông báo
    saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter((n) => !n.read).length);
  };

  // Đánh dấu thông báo đã đọc
  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter((n) => !n.read).length);
  };

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));
    saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  // Xóa thông báo
  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(
      (notif) => notif.id !== notificationId
    );
    saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter((n) => !n.read).length);
  };

  // Kiểm tra đơn thuốc mới
  const checkNewMedicineRequests = async () => {
    try {
      const res = await api.get("/MedicineRequest/getAll");
      const medicineRequests = res.data.$values || [];

      // Lấy thời gian kiểm tra cuối cùng
      const lastCheck = localStorage.getItem(
        `lastMedicineCheck_${user?.userID || "nurse"}`
      );
      const currentTime = Date.now();

      if (!lastCheck) {
        // Lần đầu chạy, lưu thời gian hiện tại
        localStorage.setItem(
          `lastMedicineCheck_${user?.userID || "nurse"}`,
          currentTime.toString()
        );
        return;
      }

      // Kiểm tra đơn thuốc mới (tạo sau lần kiểm tra cuối)
      const newRequests = medicineRequests.filter((request) => {
        const requestTime = new Date(request.date).getTime();
        return (
          requestTime > parseInt(lastCheck) &&
          request.requestStatus === "Chờ duyệt"
        );
      });

      // Tạo thông báo cho đơn thuốc mới
      newRequests.forEach((request) => {
        createNotification(
          "medicine_request",
          "Đơn thuốc mới cần duyệt",
          `Phụ huynh ${request.parentName} đã gửi đơn thuốc cho học sinh ${request.studentName}`,
          { requestID: request.requestID, type: "medicine_request" }
        );
      });

      // Cập nhật thời gian kiểm tra cuối
      localStorage.setItem(
        `lastMedicineCheck_${user?.userID || "nurse"}`,
        currentTime.toString()
      );
    } catch (error) {
      console.error("Lỗi khi kiểm tra đơn thuốc mới:", error);
    }
  };

  // Kiểm tra sự kiện y tế mới
  const checkNewHealthEvents = async () => {
    try {
      const res = await api.get("/HealthCheck/getAll");
      const healthEvents = res.data.$values || [];

      const lastCheck = localStorage.getItem(
        `lastHealthCheck_${user?.userID || "nurse"}`
      );
      const currentTime = Date.now();

      if (!lastCheck) {
        localStorage.setItem(
          `lastHealthCheck_${user?.userID || "nurse"}`,
          currentTime.toString()
        );
        return;
      }

      const newEvents = healthEvents.filter((event) => {
        const eventTime = new Date(event.date).getTime();
        return eventTime > parseInt(lastCheck);
      });

      newEvents.forEach((event) => {
        createNotification(
          "health_event",
          "Sự kiện y tế mới",
          `Sự kiện y tế "${event.eventName}" đã được tạo`,
          { eventID: event.eventID, type: "health_event" }
        );
      });

      localStorage.setItem(
        `lastHealthCheck_${user?.userID || "nurse"}`,
        currentTime.toString()
      );
    } catch (error) {
      console.error("Lỗi khi kiểm tra sự kiện y tế:", error);
    }
  };

  // Khởi tạo thông báo
  const initializeNotifications = () => {
    const storedNotifications = getStoredNotifications();
    setNotifications(storedNotifications);
    setUnreadCount(storedNotifications.filter((n) => !n.read).length);
  };

  // Xử lý click vào thông báo
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    // Xử lý theo loại thông báo
    switch (notification.type) {
      case "medicine_request":
        // Có thể navigate đến trang duyệt đơn thuốc
        message.info(`Chuyển đến đơn thuốc ID: ${notification.data.requestID}`);
        break;
      case "health_event":
        // Có thể navigate đến trang sự kiện y tế
        message.info(
          `Chuyển đến sự kiện y tế ID: ${notification.data.eventID}`
        );
        break;
      default:
        break;
    }
  };

  // Lấy icon theo loại thông báo
  const getNotificationIcon = (type) => {
    switch (type) {
      case "medicine_request":
        return <MedicineBoxOutlined style={{ color: "#1890ff" }} />;
      case "health_event":
        return <HeartOutlined style={{ color: "#52c41a" }} />;
      case "appointment":
        return <CalendarOutlined style={{ color: "#faad14" }} />;
      default:
        return <UserOutlined />;
    }
  };

  // Format thời gian
  const formatTime = (timeString) => {
    const now = new Date();
    const time = new Date(timeString);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  useEffect(() => {
    initializeNotifications();

    // Kiểm tra dữ liệu mới mỗi 30 giây
    const interval = setInterval(() => {
      checkNewMedicineRequests();
      checkNewHealthEvents();
    }, 30000);

    // Kiểm tra ngay lập tức
    checkNewMedicineRequests();
    checkNewHealthEvents();

    return () => clearInterval(interval);
  }, [user]);

  const notificationItems = {
    items: [
      {
        key: "header",
        label: (
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Thông báo</Text>
            {unreadCount > 0 && (
              <Button
                type="link"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        ),
      },
      {
        key: "notifications",
        label: (
          <List
            style={{ width: 350, maxHeight: 400, overflow: "auto" }}
            dataSource={notifications}
            locale={{ emptyText: "Không có thông báo nào" }}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "8px 16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                  backgroundColor: item.read ? "transparent" : "#f0f8ff",
                  borderLeft: item.read ? "none" : "3px solid #1890ff",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = item.read
                    ? "transparent"
                    : "#f0f8ff")
                }
                onClick={() => handleNotificationClick(item)}
                actions={[
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    style={{ color: "#ff4d4f" }}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={getNotificationIcon(item.type)} />}
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text strong={!item.read}>{item.title}</Text>
                      {!item.read && <Badge status="processing" size="small" />}
                    </div>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text>{item.message}</Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {formatTime(item.time)}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ),
      },
    ],
  };

  return (
    <Dropdown
      menu={notificationItems}
      trigger={["click"]}
      placement="bottomRight"
      overlayStyle={{ width: 350 }}
    >
      <Badge count={unreadCount} offset={[-2, 2]}>
        <BellOutlined
          style={{
            fontSize: "20px",
            cursor: "pointer",
            color: "#666",
          }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
