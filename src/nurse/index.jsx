import React, { useState, useMemo } from "react";
import {
  FileOutlined,
  PieChartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  PropertySafetyOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  DashboardOutlined,
  MedicineBoxTwoTone,
  FileTextOutlined,
  HomeOutlined,
  ScheduleOutlined,
  ReadOutlined,
  BellOutlined
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
  Badge,
  Divider,
  Button,
  Image
} from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/features/userSlice";
import NotificationDropdown from "./NotificationDropdown";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

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
  getItem("Khám định kỳ", "/nurse/checkup", <ScheduleOutlined />),
  getItem("Báo cáo vaccine", "/nurse/vaccine-event-report", <FileTextOutlined />),
  getItem("Đăng blog", "/nurse/blog", <ReadOutlined />),
];

// Mapping path to breadcrumb name
const breadcrumbNameMap = {
  "/nurse": "Trang chủ",
  "/nurse/medical-event": "Báo cáo sự cố y tế",
  "/nurse/student-profile-list": "Danh sách hồ sơ học sinh",
  "/nurse/approve-medicine": "Duyệt đơn thuốc",
  "/nurse/profile": "Thông tin cá nhân",
  "/nurse/checkup": "Khám định kỳ",
  "/nurse/vaccine-event-report": "Báo cáo Vaccine",
  "/nurse/medical-inventory": "Quản lí kho thuốc",
  "/nurse/blog": "Đăng blog học đường",
};

const Nurse = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const {
    token: { colorBgContainer },
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
    return [
      {
        key: '/nurse',
        title: <Link to="/nurse"><HomeOutlined /> Trang chủ</Link>,
      },
      ...extraBreadcrumbItems.slice(1)
    ].filter(Boolean);
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

  // Logo container height
  const logoHeight = 70;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={250}
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: logoHeight,
            padding: collapsed ? '12px' : '12px 24px',
            background: 'rgba(0, 21, 41, 0.85)',
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <MedicineBoxTwoTone 
            style={{ 
              fontSize: collapsed ? 24 : 28, 
              marginRight: collapsed ? 0 : 12,
              color: '#1890ff'
            }} 
          />
          {!collapsed && (
            <Title level={4} style={{ color: "white", margin: 0, fontSize: 18 }}>
              Y Tế Học Đường
            </Title>
          )}
        </div>
        
        <div style={{ padding: '16px 0' }}>
          <Menu
            theme="dark"
            defaultSelectedKeys={[location.pathname]}
            selectedKeys={[location.pathname]}
            mode="inline"
            items={items}
            style={{ 
              borderRight: 0,
              fontSize: '14px',
            }}
          />
        </div>
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
            background: colorBgContainer,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            height: logoHeight,
            position: 'sticky',
            top: 0,
            zIndex: 999,
          }}
        >
          <Breadcrumb
            items={breadcrumbItems}
            style={{ 
              textTransform: "capitalize",
              fontSize: '14px'
            }}
          />
          
          <Space align="center" size={24}>
            <NotificationDropdown />
            
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleMenuClick,
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1677ff" }}
                />
                {user?.fullName && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text strong>{user.fullName}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Y tá trường</Text>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ margin: "24px 24px 0", overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              minHeight: "100%",
              background: colorBgContainer,
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Outlet />
          </div>
        </Content>
        
        <Footer 
          style={{ 
            textAlign: "center", 
            background: "transparent",
            padding: '16px 50px',
            color: '#666'
          }}
        >
          <Divider style={{ margin: '12px 0' }} />
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text>Hệ thống Y Tế Học Đường ©{new Date().getFullYear()}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>Tạo bởi Team 432 - SWP391</Text>
          </Space>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Nurse;
