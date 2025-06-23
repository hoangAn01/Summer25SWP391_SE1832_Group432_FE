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

      // Xử lý response với cấu trúc mới có $values
      const accountsData = response.data.$values || [];

      if (Array.isArray(accountsData)) {
        // Ensure fullName is a string or empty string
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

  // Xử lý tìm kiếm theo tên
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAccounts(accounts);
    } else {
      // Trim and normalize search term
      const normalizedSearchTerm = searchTerm.trim().toLowerCase();

      const filtered = accounts.filter((account) => {
        // Remove extra spaces and normalize the full name
        const normalizedFullName = (account.fullName || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " "); // Replace multiple spaces with single space

        // Check for exact match or partial match
        return (
          normalizedFullName === normalizedSearchTerm || // Exact match
          normalizedFullName.includes(normalizedSearchTerm) || // Partial match in full name
          normalizedFullName.split(" ").some(
            (namePart) => namePart.startsWith(normalizedSearchTerm) // Match start of any name part
          )
        );
      });

      setFilteredAccounts(filtered);
    }
  }, [searchTerm, accounts]);

  // Lọc danh sách tài khoản theo trạng thái
  useEffect(() => {
    let filtered = accounts;

    // Lọc theo tên (từ logic tìm kiếm cũ)
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

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((account) => account.active === isActive);
    }

    setFilteredAccounts(filtered);
  }, [searchTerm, accounts, statusFilter]);

  // Xử lý xóa tài khoản
  const handleDelete = async (record) => {
    // Kiểm tra vai trò tài khoản
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

      // Hiển thị thông báo lỗi
      Modal.error({
        title: "Không thể xóa tài khoản",
        content: errorMessage,
        okText: "Đóng",
      });

      return;
    }

    try {
      // Gọi API xóa tài khoản
      await api.delete(`/admin/accounts/${record.userID}`);

      // Cập nhật danh sách tài khoản
      const updatedAccounts = accounts.filter(
        (account) => account.userID !== record.userID
      );
      setAccounts(updatedAccounts);
      setFilteredAccounts(updatedAccounts);

      // Hiển thị thông báo thành công
      message.success(`Đã xóa tài khoản của ${record.fullName}`);
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      message.error("Không thể xóa tài khoản. Vui lòng thử lại.");
    }
  };

  // Xử lý chỉnh sửa tài khoản
  const handleEdit = (record) => {
    console.log("Chỉnh sửa:", record);
    // TODO: Implement edit functionality
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
      // Highlight matching text
      render: (text) => {
        // Ensure text is a string
        const safeText = text || "";

        if (!searchTerm) return safeText;

        // Normalize search and text
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        const normalizedText = safeText.trim().toLowerCase();

        // Find the matching part
        const matchIndex = normalizedText.indexOf(normalizedSearchTerm);

        if (matchIndex === -1) return safeText;

        return (
          <span>
            {safeText.slice(0, matchIndex)}
            <span style={{ backgroundColor: "yellow" }}>
              {safeText.slice(matchIndex, matchIndex + searchTerm.length)}
            </span>
            {safeText.slice(matchIndex + searchTerm.length)}
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
      render: (active) => (active ? "Hoạt động" : "Ngừng hoạt động"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record)}>
            Chỉnh sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa tài khoản"
            description={`Bạn có chắc muốn xóa tài khoản của ${record.fullName}?`}
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md mt-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Quản Lý Tài Khoản
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "40px 0",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 600,
              maxWidth: "98vw",
              display: "flex",
              gap: "10px",
            }}
          >
            <Input
              prefix={<FiSearch size={24} color="#1976d2" />}
              suffix={
                searchTerm && (
                  <FiX
                    size={24}
                    color="#888"
                    onClick={() => setSearchTerm("")}
                    style={{ cursor: "pointer" }}
                  />
                )
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên để tìm kiếm"
              style={{
                width: "70%",
                padding: "12px 56px",
                fontSize: 18,
                borderRadius: 32,
                border: "2.5px solid #1976d2",
                boxShadow: "0 4px 24px 0 rgba(33,150,243,0.10)",
              }}
            />
            <Select
              style={{ width: "30%" }}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              placeholder="Trạng thái"
            >
              <Select.Option value="all">Trạng thái tài khoản </Select.Option>
              <Select.Option value="active">Đang hoạt động</Select.Option>
              <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
            </Select>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={filteredAccounts}
          loading={loading}
          rowKey="userID"
          locale={{
            emptyText: searchTerm
              ? `Không tìm thấy tài khoản có tên "${searchTerm}"`
              : "Không có dữ liệu",
          }}
        />
      </div>
    </div>
  );
}

export default Manage_account;
