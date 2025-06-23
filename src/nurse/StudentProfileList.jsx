import React, { useEffect, useState } from "react";
import { Table, Typography, Spin, Alert } from "antd";
import api from "../config/axios";

const { Title } = Typography;

const columns = [
  {
    title: "Họ tên học sinh",
    dataIndex: "studentFullName",
    key: "studentFullName",
  },
  {
    title: "Bệnh mãn tính",
    dataIndex: "chronicDisease",
    key: "chronicDisease",
  },
  {
    title: "Thị lực",
    dataIndex: "visionTest",
    key: "visionTest",
  },
  {
    title: "Dị ứng",
    dataIndex: "allergy",
    key: "allergy",
  },
  {
    title: "Cân nặng",
    dataIndex: "weight",
    key: "weight",
    render: (w) => w + " kg",
  },
  {
    title: "Chiều cao",
    dataIndex: "height",
    key: "height",
    render: (h) => h + " cm",
  },
  {
    title: "Ngày khám gần nhất",
    dataIndex: "lastCheckupDate",
    key: "lastCheckupDate",
    render: (date) => new Date(date).toLocaleString("vi-VN"),
  },
];

const StudentProfileList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await api.get("HealthProfile");
        const data = res.data.$values;
        setData(data);
      } catch {
        setError("Không thể tải danh sách hồ sơ học sinh!");
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  if (loading) return <Spin tip="Đang tải danh sách..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div>
      <Title level={3}>Danh sách hồ sơ sức khỏe học sinh</Title>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="profileID"
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
};

export default StudentProfileList;
