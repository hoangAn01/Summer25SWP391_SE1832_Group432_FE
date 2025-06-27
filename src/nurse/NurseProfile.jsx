import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Avatar,
  Spin,
  message,
  Typography,
  Alert,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import api from "../config/axios";

const { Title, Text } = Typography;

const NurseProfile = () => {
  const [nurseInfo, setNurseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNurseInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`Nurse`);
        setNurseInfo(res.data);
      } catch (err) {
        setError("Không thể tải thông tin cá nhân. Vui lòng thử lại sau.");
        console.error("Error fetching nurse info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNurseInfo();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" tip="Đang tải..." />
        </div>
      );
    }

    if (error) {
      return <Alert message="Lỗi" description={error} type="error" showIcon />;
    }

    if (!nurseInfo) {
      return <Alert message="Không tìm thấy dữ liệu" type="warning" showIcon />;
    }

    return (
      <Card style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Avatar
            size={128}
            icon={<UserOutlined />}
            src={nurseInfo?.avatarUrl} // Optional: if you have an avatar URL
            style={{
              backgroundColor: "#1677ff",
              border: "4px solid #fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Title level={2} style={{ marginTop: 16, color: "#1f1f1f" }}>
            {nurseInfo.fullName}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Y tá trường
          </Text>
        </div>

        <Descriptions
          bordered
          column={1}
          title={<Title level={4}>Thông tin chi tiết</Title>}
          labelStyle={{ width: "200px", fontWeight: 500 }}
        >
          <Descriptions.Item
            label={
              <>
                <UserOutlined /> Họ và tên
              </>
            }
          >
            {nurseInfo.fullName}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <PhoneOutlined /> Số điện thoại
              </>
            }
          >
            {nurseInfo.phone}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <CalendarOutlined /> Ngày sinh
              </>
            }
          >
            {new Date(nurseInfo.dateOfBirth).toLocaleDateString("vi-VN")}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  return (
    <Card>
      <Title level={3} style={{ marginBottom: 24 }}>
        Thông tin cá nhân
      </Title>
      {renderContent()}
    </Card>
  );
};

export default NurseProfile;
