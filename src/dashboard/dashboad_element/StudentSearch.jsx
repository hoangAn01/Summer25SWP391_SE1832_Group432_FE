import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Input,
  Select,
  Card,
  Spin,
  Alert,
  Typography,
  Row,
  Col,
} from "antd";
import { SearchOutlined, TeamOutlined } from "@ant-design/icons";
import api from "../../config/axios";

const { Title } = Typography;
const { Option } = Select;

const StudentSearch = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    // Fetch all classes once
    const fetchClasses = async () => {
      try {
        const res = await api.get("/Class");
        const classList = res.data.$values || res.data; // $values để support kiểu .NET
        setClasses(classList);
      } catch (err) {
        console.error("Lỗi khi tải danh sách lớp:", err);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchAllStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get("/Student");
        const allStudents = res.data.$values || res.data;
        setStudents(allStudents);
      } catch (err) {
        setError("Không thể tải danh sách học sinh!");
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, []);

  // Gọi API tìm kiếm khi searchText thay đổi
  useEffect(() => {
    const controller = new AbortController();
    const searchStudents = async () => {
      if (!searchText) return; // không tìm khi ô trống
      try {
        const res = await api.get(
          `/Student/search/${encodeURIComponent(searchText)}`,
          {
            signal: controller.signal,
          }
        );
        const result = res.data.$values || res.data;
        setStudents(result);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Lỗi tìm kiếm học sinh:", err);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchText) {
        searchStudents();
      }
      if (!searchText) {
        // Nếu xóa ô tìm kiếm thì load lại toàn bộ
        (async () => {
          try {
            const res = await api.get("/Student");
            const allStudents = res.data.$values || res.data;
            setStudents(allStudents);
          } catch (err) {
            console.error(err);
          }
        })();
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchText]);

  // Danh sách năm học lấy từ classes
  const schoolYears = useMemo(() => {
    const years = classes.map((c) => c.schoolYear).filter(Boolean);
    // bỏ trùng
    return Array.from(new Set(years));
  }, [classes]);

  const filteredData = useMemo(() => {
    let data = students;
    if (selectedClass !== "all") {
      data = data.filter((s) => s.classID === parseInt(selectedClass));
    }
    if (selectedYear !== "all") {
      data = data.filter((s) => {
        const cls = classes.find((c) => c.classID === s.classID);
        return cls?.schoolYear === selectedYear;
      });
    }
    return data;
  }, [students, selectedClass, selectedYear, classes]);

  const columns = [
    {
      title: "Mã HS",
      dataIndex: "studentID",
      key: "studentID",
      width: 80,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 90,
      render: (text) => {
        if (!text) return "";
        const lower = String(text).toLowerCase();
        return lower === "m" || lower === "male" || lower === "nam"
          ? "Nam"
          : "Nữ";
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Phụ huynh",
      dataIndex: "parentFullName",
      key: "parentFullName",
    },
  ];

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
        <Spin tip="Đang tải dữ liệu..." size="large" />
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <TeamOutlined style={{ marginRight: 8 }} /> Danh sách học sinh
          </Title>
        </Col>
        <Col>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ minWidth: 140 }}
          >
            <Option value="all">Tất cả năm học</Option>
            {schoolYears.map((y) => (
              <Option key={y} value={y}>
                {y}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input
            placeholder="Tìm kiếm theo tên học sinh..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            value={selectedClass}
            onChange={setSelectedClass}
            style={{ width: "100%" }}
          >
            <Option value="all">Tất cả lớp</Option>
            {classes.map((cls) => (
              <Option key={cls.classID} value={cls.classID}>
                {cls.className}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="studentID"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có dữ liệu học sinh" }}
      />
    </Card>
  );
};

export default StudentSearch;
