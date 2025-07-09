import React, { useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
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
} from "antd";

function Manage_account() {
  const [searchTerm, setSearchTerm] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get("admin/accounts/all");
      const accountsData = response.data.$values || [];
      if (Array.isArray(accountsData)) {
        const processedAccounts = accountsData.map((account) => ({
          ...account,
          fullName: account.fullName || "",
        }));
        setAccounts(processedAccounts);
        setFilteredAccounts(processedAccounts);
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
    try {
      await api.delete(`/admin/accounts/${record.userID}`);
      const updatedAccounts = accounts.filter(
        (account) => account.userID !== record.userID
      );
      setAccounts(updatedAccounts);
      setFilteredAccounts(updatedAccounts);
      message.success(`Đã xóa tài khoản của ${record.fullName}`);
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      message.error("Không thể xóa tài khoản. Vui lòng thử lại.");
    }
  };

  const handleEdit = (record) => {
    console.log("Chỉnh sửa:", record);
    // TODO: Implement edit functionality
  };

  const handleToggleActive = async (record) => {
    try {
      await api.put(`/admin/accounts/${record.userID}`, {
        password: record.password || "",
        role: record.role,
        active: !record.active,
      });
      message.success(
        record.active
          ? "Đã ngừng hoạt động tài khoản!"
          : "Tài khoản đã được kích hoạt!"
      );
      fetchAccounts();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái tài khoản!");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "userID",
      key: "userID",
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
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
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <span style={{ color: active ? "green" : "red" }}>
          {active ? "Đang hoạt động" : "Ngừng hoạt động"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)} type="link">
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tài khoản này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
          <Button
            type={record.active ? "default" : "primary"}
            onClick={() => handleToggleActive(record)}
          >
            {record.active ? "Ngừng hoạt động" : "Kích hoạt"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý tài khoản phụ huynh</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<FiSearch />}
          allowClear
          style={{ width: 240 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 180 }}
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="active">Đang hoạt động</Select.Option>
          <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
        </Select>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredAccounts}
        loading={loading}
        rowKey="userID"
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
}

export default Manage_account;
