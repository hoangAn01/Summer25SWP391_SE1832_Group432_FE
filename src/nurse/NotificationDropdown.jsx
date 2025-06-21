import React, { useState, useEffect } from "react";
import { Badge, Dropdown, List, Avatar, Typography, Space } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock API call to get notifications
  const fetchNotifications = async () => {
    // This will be replaced with actual API call later
    const mockNotifications = [
      {
        id: 1,
        title: "Bệnh nhân mới",
        message: "Bệnh nhân Nguyễn Văn A đã được thêm vào hệ thống",
        time: "5 phút trước",
        read: false,
      },
      {
        id: 2,
        title: "Cập nhật lịch hẹn",
        message: "Lịch hẹn với bệnh nhân Trần Thị B đã được cập nhật",
        time: "1 giờ trước",
        read: true,
      },
      {
        id: 3,
        title: "Nhắc nhở",
        message: "Bạn có lịch hẹn với bệnh nhân Lê Văn C trong 30 phút tới",
        time: "2 giờ trước",
        read: false,
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter((n) => !n.read).length);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const notificationItems = {
    items: [
      {
        key: "notifications",
        label: (
          <List
            style={{ width: 350, maxHeight: 400, overflow: "auto" }}
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "8px 16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={item.title}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text>{item.message}</Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {item.time}
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
