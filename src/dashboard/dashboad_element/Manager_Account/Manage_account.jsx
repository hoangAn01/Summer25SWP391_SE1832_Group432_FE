import React, { useEffect, useState } from "react";
import { FiSearch, FiUser, FiUserCheck, FiUserX } from "react-icons/fi";
import api from "../../../config/axios";
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Input,
  Popconfirm,
  Select,
  Card,
  Typography,
  Tag,
  Tooltip,
  Row,
  Col,
  Divider,
  Statistic,
} from "antd";

const { Title, Text } = Typography;

function Manage_account() {
  const [searchTerm, setSearchTerm] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    parents: 0,
    nurses: 0,
    admins: 0,
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get("admin/accounts/all");
      const accountsData = response.data.$values || [];
      if (Array.isArray(accountsData)) {
        const processedAccounts = accountsData.map((account) => ({
          ...account,
          fullName: account.fullName || "",
          // Map database status to active boolean property
          active: account.status ? account.status.toLowerCase() === "active" : true,
        }));
        console.log("Fetched accounts:", processedAccounts);
        setAccounts(processedAccounts);
        setFilteredAccounts(processedAccounts);
        
        // Calculate stats
        const activeAccounts = processedAccounts.filter(acc => acc.active);
        const inactiveAccounts = processedAccounts.filter(acc => !acc.active);
        const parentAccounts = processedAccounts.filter(acc => acc.role === "Parent");
        const nurseAccounts = processedAccounts.filter(acc => acc.role === "Nurse");
        const adminAccounts = processedAccounts.filter(acc => acc.role === "Admin");
        
        setStats({
          total: processedAccounts.length,
          active: activeAccounts.length,
          inactive: inactiveAccounts.length,
          parents: parentAccounts.length,
          nurses: nurseAccounts.length,
          admins: adminAccounts.length,
        });
      } else {
        message.error("Dữ liệu trả về không đúng định dạng");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài khoản:", error);
      message.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredAccounts(accounts);
    } else {
      const normalizedSearchTerm = searchTerm.trim().toLowerCase();
      const filtered = accounts.filter((account) => {
        const normalizedFullName = (account.fullName || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");
        return (
          normalizedFullName === normalizedSearchTerm ||
          normalizedFullName.includes(normalizedSearchTerm) ||
          normalizedFullName
            .split(" ")
            .some((namePart) => namePart.startsWith(normalizedSearchTerm))
        );
      });
      setFilteredAccounts(filtered);
    }
  }, [searchTerm, accounts]);

  useEffect(() => {
    let filtered = accounts;
    if (searchTerm) {
      const normalizedSearchTerm = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((account) => {
        const normalizedFullName = (account.fullName || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");
        return (
          normalizedFullName === normalizedSearchTerm ||
          normalizedFullName.includes(normalizedSearchTerm) ||
          normalizedFullName
            .split(" ")
            .some((namePart) => namePart.startsWith(normalizedSearchTerm))
        );
      });
    }
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((account) => account.active === isActive);
    }
    setFilteredAccounts(filtered);
  }, [searchTerm, accounts, statusFilter]);

  // Hàm để lấy ID chính xác của tài khoản
  const getAccountId = (record) => {
    // Kiểm tra và sử dụng accountID nếu có, nếu không thì dùng userID
    const id = record.accountID || record.userID || record.id;
    console.log("Using account ID:", id, "for record:", record);
    return id;
  };

  const handleDelete = async (record) => {
    if (record.role !== "Parent") {
      let errorMessage = "";
      switch (record.role) {
        case "Nurse":
          errorMessage = "Không thể xóa tài khoản y tá";
          break;
        case "Admin":
          errorMessage = "Không thể xóa tài khoản quản trị viên";
          break;
        default:
          errorMessage = "Chỉ được xóa tài khoản phụ huynh";
      }
      Modal.error({
        title: "Không thể xóa tài khoản",
        content: errorMessage,
        okText: "Đóng",
      });
      return;
    }
    
    const accountId = getAccountId(record);
    if (!accountId) {
      message.error("Không tìm thấy ID tài khoản");
      return;
    }
    
    try {
      await api.delete(`/admin/accounts/${accountId}`);
      const updatedAccounts = accounts.filter(
        (account) => getAccountId(account) !== accountId
      );
      setAccounts(updatedAccounts);
      setFilteredAccounts(updatedAccounts);
      message.success(`Đã xóa tài khoản của ${record.fullName}`);
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      message.error("Không thể xóa tài khoản. Vui lòng thử lại.");
    }
  };

  const handleToggleActive = async (record) => {
    const accountId = getAccountId(record);
    if (!accountId) {
      message.error("Không tìm thấy ID tài khoản");
      return;
    }
    
    try {
      const newStatus = record.active ? "inactive" : "active";
      
      // Gọi API PUT với đầy đủ các trường theo API spec
      await api.put(`/admin/accounts/${accountId}`, {
        password: record.password || "", // Giữ nguyên mật khẩu hiện tại
        email: record.email || "",
        role: record.role,
        status: newStatus,
      });
      
      message.success(
        record.active
          ? "Đã ngừng hoạt động tài khoản!"
          : "Tài khoản đã được kích hoạt!"
      );
      fetchAccounts();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái tài khoản:", error, "với ID:", accountId);
      message.error("Không thể cập nhật trạng thái tài khoản!");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "gold";
      case "Nurse":
        return "blue";
      case "Parent":
        return "green";
      default:
        return "default";
    }
  };
  
  const getVietnameseRole = (role) => {
    switch (role) {
      case "Admin":
        return "Quản trị viên";
      case "Nurse":
        return "Y tá";
      case "Parent":
        return "Phụ huynh";
      default:
        return role;
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "accountID",
      key: "accountID",
      width: 70,
      render: (text, record) => getAccountId(record),
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => {
        const safeText = text || "";
        if (!searchTerm) return safeText;
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        const normalizedText = safeText.trim().toLowerCase();
        const matchIndex = normalizedText.indexOf(normalizedSearchTerm);
        if (matchIndex === -1) return safeText;
        return (
          <span>
            {safeText.slice(0, matchIndex)}
            <span style={{ backgroundColor: "yellow" }}>
              {safeText.slice(
                matchIndex,
                matchIndex + normalizedSearchTerm.length
              )}
            </span>
            {safeText.slice(matchIndex + normalizedSearchTerm.length)}
          </span>
        );
      },
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={getRoleColor(role)}>{getVietnameseRole(role)}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <Tag color={active ? "success" : "error"} icon={active ? <FiUserCheck /> : <FiUserX />}>
          {active ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {!record.active && (
            <>
              <Tooltip title="Xóa tài khoản">
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa tài khoản này?"
                  onConfirm={() => handleDelete(record)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="primary" danger>
                    Xóa
                  </Button>
                </Popconfirm>
              </Tooltip>
              <Tooltip title="Kích hoạt tài khoản">
                <Button
                  type="primary"
                  onClick={() => handleToggleActive(record)}
                >
                  Kích hoạt
                </Button>
              </Tooltip>
            </>
          )}
          {record.active && (
            <Tooltip title="Ngừng hoạt động tài khoản">
              <Button
                danger
                onClick={() => handleToggleActive(record)}
              >
                Ngừng hoạt động
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Card
        bordered={false}
        style={{ marginBottom: 24, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.09)" }}
      >
        <Title level={2} style={{ marginBottom: 24, color: "#1890ff" }}>
          <FiUser style={{ marginRight: 8 }} /> Quản lý tài khoản
        </Title>
        
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8} md={8} lg={8} xl={4}>
            <Card bordered={false} style={{ backgroundColor: "#e6f7ff", borderRadius: 8 }}>
              <Statistic
                title="Tổng số tài khoản"
                value={stats.total}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={8} lg={8} xl={4}>
            <Card bordered={false} style={{ backgroundColor: "#f6ffed", borderRadius: 8 }}>
              <Statistic
                title="Đang hoạt động"
                value={stats.active}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={8} lg={8} xl={4}>
            <Card bordered={false} style={{ backgroundColor: "#fff2e8", borderRadius: 8 }}>
              <Statistic
                title="Ngừng hoạt động"
                value={stats.inactive}
                valueStyle={{ color: "#fa541c" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={8} lg={8} xl={4}>
            <Card bordered={false} style={{ backgroundColor: "#e6fffb", borderRadius: 8 }}>
              <Statistic
                title="Phụ huynh"
                value={stats.parents}
                valueStyle={{ color: "#13c2c2" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={8} lg={8} xl={4}>
            <Card bordered={false} style={{ backgroundColor: "#fcffe6", borderRadius: 8 }}>
              <Statistic
                title="Y tá"
                value={stats.nurses}
                valueStyle={{ color: "#7cb305" }}
              />
            </Card>
          </Col>
       
        </Row>

        <Divider style={{ margin: "12px 0 24px" }} />

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12} lg={8}>
            <Input
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<FiSearch style={{ color: "#1890ff" }} />}
              allowClear
              style={{ width: "100%", borderRadius: 6 }}
              size="large"
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%", borderRadius: 6 }}
              size="large"
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="active">Đang hoạt động</Select.Option>
              <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
            </Select>
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={filteredAccounts}
          loading={loading}
          rowKey={(record) => getAccountId(record).toString()}
          pagination={{ 
            pageSize: 8,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài khoản`,
            showSizeChanger: true,
            pageSizeOptions: ['8', '16', '24', '32'],
          }}
          style={{ marginTop: 16 }}
          bordered
          size="middle"
          rowClassName={(record) => (!record.active ? "table-row-inactive" : "")}
        />
      </Card>

      <style jsx global>{`
        .table-row-inactive {
          background-color: #fafafa;
        }
        .ant-table-thead > tr > th {
          background-color: #f0f5ff;
          color: #1890ff;
          font-weight: 600;
        }
        .ant-card {
          transition: all 0.3s;
        }
        .ant-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}

export default Manage_account;
