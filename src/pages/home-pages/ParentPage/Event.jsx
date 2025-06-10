import React, { useState } from "react";
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
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const eventData = {
  title: "Chương Trình Tiêm Chủng Vaccine Mùa Hè 2024",
  date: "2024-07-15",
  time: "08:00 AM - 11:00 AM",
  location: "Hội trường trung tâm y tế quận",
  description:
    "Nhằm nâng cao sức khỏe cộng đồng cho các em học sinh, nhà trường phối hợp cùng trung tâm y tế quận tổ chức chương trình tiêm chủng vaccine phòng các bệnh mùa hè. Các loại vaccine bao gồm sởi, quai bị, rubella. Phụ huynh vui lòng xác nhận tham gia để công tác chuẩn bị được chu đáo.",
};

function Event() {
  const [confirmation, setConfirmation] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleConfirm = () => {
    setConfirmation("confirmed");
    setShowAlert(true);
  };

  const handleDecline = () => {
    setConfirmation("declined");
    setShowAlert(true);
  };

  const getAlertMessage = () => {
    if (confirmation === "confirmed") {
      return "Cảm ơn bạn đã xác nhận tham gia! Vui lòng kiểm tra email để biết thêm chi tiết.";
    }
    if (confirmation === "declined") {
      return "Chúng tôi đã ghi nhận bạn không tham gia. Cảm ơn đã phản hồi.";
    }
    return "";
  };

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "calc(100vh - 64px)", marginTop: '64px' }}>
      <Title level={2} style={{ marginBottom: 24, textAlign: 'center' }}>
        Thông Báo Sự Kiện
      </Title>
      <Card bordered={false} style={{ borderRadius: 8, maxWidth: 900, margin: '0 auto' }}>
        <Row gutter={[32, 16]} align="middle">
          <Col xs={24} md={4} style={{ textAlign: "center" }}>
            <CalendarOutlined style={{ fontSize: 60, color: "#1890ff" }} />
          </Col>
          <Col xs={24} md={20}>
            <Title level={4}>{eventData.title}</Title>
            <Space wrap style={{ marginBottom: 16 }}>
              <Tag color="blue">Ngày: {eventData.date}</Tag>
              <Tag color="purple">Thời gian: {eventData.time}</Tag>
            </Space>
            <Text strong>Địa điểm: {eventData.location}</Text>
            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              {eventData.description}
            </Paragraph>
          </Col>
        </Row>

        <Divider dashed />

        <div style={{ textAlign: "center" }}>
          <Title level={5}>Xác nhận tham gia</Title>
          {showAlert ? (
            <Alert
              message={getAlertMessage()}
              type={confirmation === "confirmed" ? "success" : "info"}
              showIcon
              closable
              onClose={() => setShowAlert(false)}
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Space size="large">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="large"
                onClick={handleConfirm}
              >
                Đồng ý tham gia
              </Button>
              <Button
                type="default"
                danger
                icon={<CloseCircleOutlined />}
                size="large"
                onClick={handleDecline}
              >
                Từ chối
              </Button>
            </Space>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Event;
