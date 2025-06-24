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
  const [openedId, setOpenedId] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem("readNotificationIds");
    return saved ? JSON.parse(saved) : [];
  });
  const [readFilter, setReadFilter] = useState("ALL"); // ALL | READ | UNREAD

  const fetchDataNotificationOfParent = async (idParent) => {
    try {
      setLoading(true);
      const response = await api.get(`/ParentNotifications/parent/${idParent}`);

      // Xử lý response với cấu trúc mới có $values
      const notificationsData = response.data.$values || [];
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

  const filteredData = (
    typeFilter === "ALL"
      ? data
      : typeFilter === "OTHER"
      ? data.filter((item) => !item.notificationType)
      : typeFilter === "MEDICAL_REQUEST"
      ? data.filter(
          (item) =>
            item.notificationType === "MEDICAL_REQUEST" ||
            (item.title && item.title.toLowerCase().includes("yêu cầu thuốc"))
        )
      : data.filter((item) => item.notificationType === typeFilter)
  )
  .filter(item => {
    if (readFilter === "ALL") return true;
    if (readFilter === "UNREAD") return !readIds.includes(item.notificationID);
    if (readFilter === "READ") return readIds.includes(item.notificationID);
    return true;
  })
  .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));

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

  const handleOpen = (item) => {
    setOpenedId(item.notificationID);
    if (!readIds.includes(item.notificationID)) {
      const newReadIds = [...readIds, item.notificationID];
      setReadIds(newReadIds);
      localStorage.setItem("readNotificationIds", JSON.stringify(newReadIds));
    }
  };

  const renderNotificationContent = (item) => {
    if (
      item.notificationType === "MEDICAL_REQUEST" ||
      item.title?.toLowerCase().includes("yêu cầu thuốc")
    ) {
      const lines = item.content.includes('\n')
        ? item.content.split('\n')
        : item.content.split('-').map(line => line.trim()).filter(Boolean);

      // Lọc bỏ dòng chứa 'Nurse note:'
      const filteredLines = lines.filter(
        (line) => !line.trim().toLowerCase().startsWith("nurse note")
      );

      // Việt hóa thời gian uống thuốc
      const viLines = filteredLines.map(line => {
        if (line.toLowerCase().startsWith('thời gian uống thuốc:')) {
          return line.replace(/morning/gi, 'Sáng')
                     .replace(/noon/gi, 'Trưa')
                     .replace(/evening/gi, 'Tối');
        }
        return line;
      });

      return (
        <div style={{ whiteSpace: "pre-line" }}>
          {viLines.map((line, idx) => (
            <div key={idx} style={{ marginBottom: 4 }}>
              {line}
            </div>
          ))}
        </div>
      );
    }
    return <Paragraph style={{ margin: "8px 0" }}>{item.content}</Paragraph>;
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
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 500, marginBottom: 4 }}>Loại thông báo</span>
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 220 }}
            placeholder="Chọn loại thông báo"
          >
            <Select.Option value="ALL">Tất cả</Select.Option>
            <Select.Option value="VACCINATION">Tiêm chủng</Select.Option>
            <Select.Option value="CHECKUP">Khám sức khỏe</Select.Option>
            <Select.Option value="MEDICAL_REQUEST">Gửi thuốc</Select.Option>
            <Select.Option value="OTHER">Khác</Select.Option>
          </Select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 500, marginBottom: 4 }}>Trạng thái đọc</span>
          <Select
            value={readFilter}
            onChange={setReadFilter}
            style={{ width: 160 }}
            placeholder="Lọc trạng thái đọc"
          >
            <Select.Option value="ALL">Tất cả</Select.Option>
            <Select.Option value="UNREAD">Chưa đọc</Select.Option>
            <Select.Option value="READ">Đã đọc</Select.Option>
          </Select>
        </div>
      </div>

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
              background: readIds.includes(item.notificationID) ? "#f8faff" : "#e6f7ff",
              borderRadius: 8,
              maxWidth: 900,
              margin: "0 auto 16px auto",
              cursor: "pointer"
            }}
            onClick={() => handleOpen(item)}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <b style={{ flex: 1 }}>{item.title}</b>
              <Tag color={readIds.includes(item.notificationID) ? "default" : "blue"}>
                {readIds.includes(item.notificationID) ? "Đã đọc" : "Chưa đọc"}
              </Tag>
            </div>
            {openedId === item.notificationID && (
              <div style={{ marginTop: 12 }}>
                <Button
                  size="small"
                  style={{ float: "right", marginBottom: 8 }}
                  onClick={e => {
                    e.stopPropagation();
                    setOpenedId(null);
                  }}
                >
                  Thu gọn
                </Button>
                {renderNotificationContent(item)}
                <Tag
                  color={
                    item.status === "Sent"
                      ? "green"
                      : item.status === "Delivered"
                      ? "purple"
                      : "default"
                  }
                  style={{ marginTop: 8 }}
                >
                  {item.status}
                </Tag>
                {/* Hiển thị parentNotifications nếu có */}
                {item.parentNotifications &&
                  item.parentNotifications.length > 0 && (
                    <Paragraph type="secondary" style={{ marginTop: 8 }}>
                      Phụ huynh nhận: {item.parentNotifications.map((p) => p.parentID).join(", ")}
                    </Paragraph>
                  )}
                <Divider style={{ margin: "16px 0" }} />
              </div>
            )}
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
