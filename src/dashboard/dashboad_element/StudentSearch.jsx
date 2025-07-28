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
  Badge,
  Space,
  Tag,
  Avatar,
  Empty
} from "antd";
import { SearchOutlined, TeamOutlined, FilterOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import api from "../../config/axios";

const { Title, Text } = Typography;
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
      } catch (error) { // Changed from err to error to fix the linter error
        console.error("Lỗi khi tải danh sách học sinh:", error);
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
      render: (text) => (
        <Tag color="blue" style={{ 
          fontSize: '14px', 
          padding: '2px 8px', 
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          {text}
        </Tag>
      )
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (text) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: '#1890ff',
              boxShadow: '0 2px 4px rgba(24,144,255,0.2)'
            }} 
            size="small"
          />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      align: "center",
      render: (text) => {
        if (!text) return "";
        const lower = String(text).toLowerCase();
        const isNam = lower === "m" || lower === "male" || lower === "nam";
        return (
          <Tag 
            color={isNam ? "blue" : "magenta"}
            style={{
              padding: '2px 10px',
              borderRadius: '12px',
              fontWeight: '500'
            }}
          >
            {isNam ? "Nam" : "Nữ"}
          </Tag>
        );
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <span>{new Date(date).toLocaleDateString("vi-VN")}</span>
        </Space>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
      render: (text) => (
        <Tag color="green" style={{ 
          fontSize: '14px', 
          padding: '2px 8px', 
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          {text || "Chưa phân lớp"}
        </Tag>
      ),
    },
    {
      title: "Phụ huynh",
      dataIndex: "parentFullName",
      key: "parentFullName",
      render: (text) => text || <Text type="secondary">Chưa liên kết</Text>,
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
          padding: "80px 0",
          background: "linear-gradient(to bottom, #f0f5ff, #f9fbff)"
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
        style={{
          margin: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
        }}
      />
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(to bottom, #f0f5ff, #f9fbff)',
      minHeight: '100vh'
    }}>
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
          border: 'none',
          overflow: 'hidden'
        }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ 
              margin: 0,
              color: '#1e3a8a',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center'
            }}>
              <TeamOutlined style={{ 
                marginRight: 12, 
                color: '#1890ff',
                fontSize: '24px'
              }} /> 
              Danh sách học sinh
            </Title>
          </Col>
          <Col>
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ 
                minWidth: 160,
                borderRadius: '8px' 
              }}
              dropdownStyle={{ borderRadius: '8px' }}
              suffixIcon={<FilterOutlined style={{ color: selectedYear !== 'all' ? '#1890ff' : undefined }} />}
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

        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm theo tên học sinh..."
              prefix={<SearchOutlined style={{ color: '#1890ff' }}/>}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                padding: '8px 12px',
                height: 'auto'
              }}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              value={selectedClass}
              onChange={setSelectedClass}
              style={{ width: "100%" }}
              dropdownStyle={{ borderRadius: '8px' }}
              size="large"
              suffixIcon={<FilterOutlined style={{ color: selectedClass !== 'all' ? '#1890ff' : undefined }} />}
            >
              <Option value="all">Tất cả lớp</Option>
              {classes.map((cls) => (
                <Option key={cls.classID} value={cls.classID}>
                  {cls.className}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} lg={12} style={{ textAlign: 'right' }}>
            <Badge 
              count={filteredData.length} 
              overflowCount={999}
              style={{ 
                backgroundColor: '#52c41a',
                fontSize: '14px',
                padding: '0 12px',
                height: '28px',
                borderRadius: '14px',
                lineHeight: '28px',
                fontWeight: 'bold',
                boxShadow: '0 2px 6px rgba(82, 196, 26, 0.3)'
              }}
            >
              <Text strong style={{ fontSize: '16px' }}>Số lượng học sinh</Text>
            </Badge>
          </Col>
        </Row>

        <div style={{ 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="studentID"
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: true,
              showTotal: (total) => `Tổng cộng ${total} học sinh`,
              style: { marginTop: '16px' },
              itemRender: (page, type, originalElement) => {
                if (type === 'page') {
                  return (
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      fontWeight: 'bold' 
                    }}>
                      {originalElement}
                    </div>
                  );
                }
                return originalElement;
              }
            }}
            scroll={{ x: "max-content" }}
            locale={{ 
              emptyText: (
                <Empty
                  description={
                    <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                      Không có dữ liệu học sinh
                    </Text>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: '40px 0' }}
                />
              ) 
            }}
            rowClassName={(record, index) => `student-table-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
            style={{ borderRadius: '12px', overflow: 'hidden' }}
          />
        </div>
      </Card>

      <style jsx="true">{`
        .student-table-row:hover {
          background-color: #e6f7ff !important;
        }
        
        .even-row {
          background-color: white;
        }
        
        .odd-row {
          background-color: #fafafa;
        }
        
        .ant-table-thead > tr > th {
          background: linear-gradient(to bottom, #f0f5ff, #e6f7ff);
          color: #1890ff;
          font-weight: bold;
          border-bottom: 2px solid #91caff;
          padding: 16px;
        }
      `}</style>
    </div>
  );
};

export default StudentSearch;
