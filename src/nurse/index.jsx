import React, { useState, useMemo } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  PropertySafetyOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  Space,
  Typography,
} from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/features/userSlice";
import NotificationDropdown from "./NotificationDropdown";

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

// Helper function to create menu items
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label: children ? label : <Link to={key}>{label}</Link>,
  };
}

const items = [
  getItem("Quản lý sự cố", "/nurse/medical-event", <PieChartOutlined />),
  getItem("Hồ sơ học sinh", "/nurse/student-profile-list", <TeamOutlined />),
  getItem(
    "Duyệt đơn thuốc",
    "/nurse/approve-medicine",
    <PropertySafetyOutlined />
  ),
  getItem(
    "Quản lí kho thuốc",
    "/nurse/medical-inventory",
    <MedicineBoxOutlined />
  ),
];

// Mapping path to breadcrumb name
const breadcrumbNameMap = {
  "/nurse": "Trang chủ",
  "/nurse/medical-event": "Báo cáo sự cố y tế",
  "/nurse/student-profile-list": "Danh sách hồ sơ học sinh",
  "/nurse/approve-medicine": "Duyệt đơn thuốc",
  "/nurse/profile": "Thông tin cá nhân",
  "/nurse/medical-inventory": "Quản lí kho thuốc",
};

const Nurse = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Dynamic Breadcrumb
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = useMemo(() => {
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const name =
        breadcrumbNameMap[url] ||
        url.substring(url.lastIndexOf("/") + 1).replace(/-/g, " ");
      return {
        key: url,
        title: <Link to={url}>{name}</Link>,
      };
    });
    // We only want the last part for the nurse dashboard
    return [extraBreadcrumbItems[1]].filter(Boolean);
  }, [location.pathname]);

  const handleMenuClick = (e) => {
    if (e.key === "profile") {
      navigate("/nurse/profile");
    }
    if (e.key === "logout") {
      dispatch(logout());
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
      >
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Title level={4} style={{ color: "white", margin: 0 }}>
            {collapsed ? "Y Tế" : "Y Tế Học Đường"}
          </Title>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["/nurse/medical-event"]}
          selectedKeys={[location.pathname]}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
            background: colorBgContainer,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Breadcrumb
            items={breadcrumbItems}
            style={{ textTransform: "capitalize" }}
          />
          <Space align="center" size="middle">
            <span style={{ color: "#666" }}>
              Xin chào y tá{" "}
              <span style={{ color: "#1677ff", fontWeight: 600 }}>
                {user?.fullName || "Y tá"}
              </span>
            </span>
            <NotificationDropdown />
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleMenuClick,
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Avatar
                size={40}
                icon={<UserOutlined />}
                style={{ cursor: "pointer", backgroundColor: "#1677ff" }}
              />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: "16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: "100%",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center", background: "transparent" }}>
          Hệ thống Y Tế Học Đường ©{new Date().getFullYear()} - Tạo bởi Team 432
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Nurse;
