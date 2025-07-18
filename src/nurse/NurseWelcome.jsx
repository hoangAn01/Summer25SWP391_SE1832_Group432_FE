import React from "react";
import { Card, Typography, Row, Col, Button, Space } from "antd";
import {
  SmileTwoTone,
  FileTextOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const quickLinks = [
  {
    icon: <FileTextOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    label: "Báo cáo sự cố",
    to: "/nurse/medical-event",
  },
  {
    icon: <MedicineBoxOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
    label: "Duyệt đơn thuốc",
    to: "/nurse/approve-medicine",
  },
  {
    icon: <TeamOutlined style={{ fontSize: 32, color: "#faad14" }} />,
    label: "Hồ sơ học sinh",
    to: "/nurse/student-profile-list",
  },
  {
    icon: <ScheduleOutlined style={{ fontSize: 32, color: "#eb2f96" }} />,
    label: "Khám định kỳ",
    to: "/nurse/checkup",
  },
];

const NurseWelcome = () => {
  const navigate = useNavigate();
  return (
    <Card
      style={{
        maxWidth: 700,
        margin: "40px auto",
        borderRadius: 16,
        boxShadow: "0 4px 24px 0 rgba(33,150,243,0.10)",
      }}
      bodyStyle={{ padding: 36 }}
    >
      <Row gutter={[24, 24]} align="middle">
        <Col span={24} style={{ textAlign: "center" }}>
          <SmileTwoTone style={{ fontSize: 64 }} twoToneColor="#1890ff" />
          <Title level={2} style={{ marginTop: 16 }}>
            Chào mừng đến với hệ thống Y Tế Học Đường!
          </Title>
          <Text type="secondary" style={{ fontSize: 18 }}>
            Hãy chọn chức năng ở menu bên trái hoặc sử dụng các lối tắt bên dưới
            để bắt đầu công việc.
          </Text>
        </Col>
        <Col span={24} style={{ marginTop: 32 }}>
          <Row gutter={[24, 24]} justify="center">
            {quickLinks.map((link) => (
              <Col
                xs={24}
                sm={12}
                md={6}
                key={link.to}
                style={{ textAlign: "center" }}
              >
                <Button
                  type="default"
                  size="large"
                  icon={link.icon}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: 100,
                    fontWeight: 500,
                    fontSize: 16,
                    borderRadius: 12,
                  }}
                  onClick={() => navigate(link.to)}
                >
                  <span style={{ marginTop: 8 }}>{link.label}</span>
                </Button>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default NurseWelcome;
