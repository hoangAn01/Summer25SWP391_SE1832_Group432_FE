import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Tag,
  Alert,
  Space,
  Divider,
  Select,
  message,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import api from "../../../config/axios";
import { useSelector } from "react-redux";

const { Title, Text, Paragraph } = Typography;

function Event() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const parent = useSelector((state) => state.parent);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchDataNotificationOfParent = async (idParent) => {
    try {
      setLoading(true);
      const response = await api.get(`/ParentNotifications/parent/${idParent}`);

      // Xử lý response với cấu trúc mới có $values
      const notificationsData = response.data.$values || [];
      console.log("Parent notifications data:", notificationsData);
      setData(notificationsData);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
      message.error("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parent?.parent?.parentID) {
      console.log("Parent ID:", parent.parent.parentID);
      fetchDataNotificationOfParent(parent.parent.parentID);
    }
  }, [parent?.parent?.parentID]);

  const filteredData =
    typeFilter === "ALL"
      ? data
      : typeFilter === "OTHER"
      ? data.filter((item) => !item.notificationType)
      : data.filter((item) => item.notificationType === typeFilter);

  const handleJoin = async (notificationId) => {
    try {
      // TODO: Uncomment when API is ready
      // await api.put(`/ParentNotifications/notification/${notificationId}/parent/${parent.parent.parentID}`);
      console.log("Joining notification:", notificationId); // eslint-disable-line no-unused-vars
      message.success("Bạn đã xác nhận tham gia sự kiện!");
      fetchDataNotificationOfParent(parent.parent.parentID);
    } catch (error) {
      console.error("Lỗi khi xác nhận tham gia:", error);
      message.error("Không thể xác nhận tham gia!");
    }
  };

  const handleDecline = async (notificationId) => {
    try {
      // TODO: Uncomment when API is ready
      // await api.delete(`/ParentNotifications/notification/${notificationId}/parent/${parent.parent.parentID}`);
      console.log("Declining notification:", notificationId); // eslint-disable-line no-unused-vars
      message.success("Bạn đã từ chối tham gia sự kiện!");
      fetchDataNotificationOfParent(parent.parent.parentID);
    } catch (error) {
      console.error("Lỗi khi từ chối sự kiện:", error);
      message.error("Không thể từ chối sự kiện!");
    }
  };

  return (
    <div
      style={{
        padding: 24,
        background: "#f0f2f5",
        minHeight: "calc(100vh - 64px)",
        marginTop: "64px",
      }}
    >
      <Title level={2} style={{ marginBottom: 24, textAlign: "center" }}>
        Thông Báo Sự Kiện
      </Title>

      {/* Bộ lọc loại thông báo */}
      <Select
        value={typeFilter}
        onChange={setTypeFilter}
        style={{ width: 220, marginBottom: 24 }}
        placeholder="Chọn loại thông báo"
      >
        <Select.Option value="ALL">Tất cả</Select.Option>
        <Select.Option value="VACCINATION">Tiêm chủng</Select.Option>
        <Select.Option value="CHECKUP">Khám sức khỏe</Select.Option>
        <Select.Option value="OTHER">Khác</Select.Option>
      </Select>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">Đang tải thông báo...</Text>
        </div>
      )}

      {/* Danh sách thông báo đã lọc */}
      {!loading && filteredData.length > 0 ? (
        filteredData.map((item) => (
          <Card
            key={item.notificationID}
            style={{
              marginBottom: 16,
              background: "#f8faff",
              borderRadius: 8,
              maxWidth: 900,
              margin: "0 auto 16px auto",
            }}
            type="inner"
            title={item.title}
            extra={
              <Tag
                color={
                  item.notificationType === "VACCINATION"
                    ? "blue"
                    : item.notificationType === "CHECKUP"
                    ? "purple"
                    : "default"
                }
              >
                {item.notificationType || "Khác"}
              </Tag>
            }
          >
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Text type="secondary">
                <CalendarOutlined style={{ marginRight: 8 }} />
                {new Date(item.sentDate).toLocaleString("vi-VN")}
              </Text>

              <Paragraph style={{ margin: "8px 0" }}>{item.content}</Paragraph>

              <Tag
                color={
                  item.status === "Sent"
                    ? "green"
                    : item.status === "Delivered"
                    ? "purple"
                    : "default"
                }
              >
                {item.status}
              </Tag>

              {/* Hiển thị parentNotifications nếu có */}
              {item.parentNotifications &&
                item.parentNotifications.length > 0 && (
                  <Paragraph type="secondary" style={{ marginTop: 8 }}>
                    Phụ huynh nhận:{" "}
                    {item.parentNotifications.map((p) => p.parentID).join(", ")}
                  </Paragraph>
                )}

              <Divider style={{ margin: "16px 0" }} />

              <Space>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleJoin(item.notificationID)}
                >
                  Tham gia
                </Button>

                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleDecline(item.notificationID)}
                >
                  Từ chối
                </Button>
              </Space>
            </Space>
          </Card>
        ))
      ) : !loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">
            {typeFilter === "ALL"
              ? "Không có thông báo nào."
              : `Không có thông báo loại "${typeFilter}" nào.`}
          </Text>
        </div>
      ) : null}
    </div>
  );
}

export default Event;
