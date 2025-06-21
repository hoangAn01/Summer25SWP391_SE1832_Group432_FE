import React, { useEffect, useState } from "react";
import { Card, Descriptions, Avatar, Spin, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import api from "../config/axios";

const NurseProfile = () => {
  const [nurseInfo, setNurseInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNurseInfo = async () => {
      try {
        const res = await api.get(`Nurse`);
        setNurseInfo(res.data);
      } catch (error) {
        console.error("Error fetching nurse info:", error);
        message.error("Không thể tải thông tin y tá");
      } finally {
        setLoading(false);
      }
    };

    fetchNurseInfo();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        style={{
          maxWidth: 800,
          margin: "0 auto",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Avatar
            size={120}
            icon={<UserOutlined />}
            style={{
              backgroundColor: "#1890ff",
              marginBottom: "16px",
            }}
          />
          <h2 style={{ margin: 0, color: "#1890ff" }}>{nurseInfo?.fullName}</h2>
          <p style={{ color: "#666", margin: "8px 0" }}>Y tá trường</p>
        </div>

        <Descriptions
          bordered
          column={1}
          labelStyle={{ width: "200px", fontWeight: "bold" }}
        >
          <Descriptions.Item label="Họ và tên">
            {nurseInfo?.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {nurseInfo?.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {new Date(nurseInfo?.dateOfBirth).toLocaleDateString("vi-VN")}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default NurseProfile;
