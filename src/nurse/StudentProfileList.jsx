import React, { useEffect, useState, useMemo } from "react";
import { Table, Typography, Spin, Alert, Card, Input } from "antd";
import { TeamOutlined, SearchOutlined } from "@ant-design/icons";
import api from "../config/axios";

const { Title } = Typography;

const columns = [
  {
    title: "Họ tên học sinh",
    dataIndex: "studentFullName",
    key: "studentFullName",
    sorter: (a, b) => a.studentFullName.localeCompare(b.studentFullName),
  },
  {
    title: "Bệnh mãn tính",
    dataIndex: "chronicDisease",
    key: "chronicDisease",
    render: (text) => text || <span style={{ color: "#ccc" }}>Không có</span>,
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
    render: (text) => text || <span style={{ color: "#ccc" }}>Không có</span>,
  },
  {
    title: "Cân nặng (kg)",
    dataIndex: "weight",
    key: "weight",
    align: "right",
    sorter: (a, b) => a.weight - b.weight,
  },
  {
    title: "Chiều cao (cm)",
    dataIndex: "height",
    key: "height",
    align: "right",
    sorter: (a, b) => a.height - b.height,
  },
  {
    title: "Ngày khám gần nhất",
    dataIndex: "lastCheckupDate",
    key: "lastCheckupDate",
    render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    sorter: (a, b) => new Date(a.lastCheckupDate) - new Date(b.lastCheckupDate),
  },
];

const StudentProfileList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const res = await api.get("HealthProfile");
        setData(res.data.$values || []);
      } catch {
        setError("Không thể tải danh sách hồ sơ sức khỏe học sinh!");
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchText) {
      return data;
    }
    return data.filter((item) =>
      item.studentFullName.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Spin tip="Đang tải danh sách..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Lỗi tải dữ liệu"
        description={error}
        showIcon
      />
    );
  }

  return (
    <Card>
      <Title level={3} style={{ marginBottom: 16 }}>
        <TeamOutlined style={{ marginRight: 8 }} />
        Danh sách hồ sơ sức khỏe học sinh
      </Title>
      <Input
        placeholder="Tìm kiếm theo tên học sinh..."
        prefix={<SearchOutlined />}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 20, maxWidth: 400 }}
        allowClear
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="profileID"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: "Không có dữ liệu hồ sơ nào",
        }}
      />
    </Card>
  );
};

export default StudentProfileList;
