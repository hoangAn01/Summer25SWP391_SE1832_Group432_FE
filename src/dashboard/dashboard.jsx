import React, { useState, useEffect } from "react";
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  LogoutOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Modal, theme, Avatar, Dropdown, Input, Button, Typography } from "antd";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/features/userSlice";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

function getItem(label, key, icon, children, isParentOnly = false) {
  return {
    key,
    icon,
    children,
    label:
      key === "logout" ? (
        label
      ) : isParentOnly ? (
        label
      ) : (
        <Link to={`/dashboard/${key}`}>{label}</Link>
      ),
  };
}

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState("student_profile");
  const {
    token: { colorBgContainer, borderRadiusLG, colorPrimary },
  } = theme.useToken();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định menu item hiện tại dựa trên URL
  useEffect(() => {
    const path = location.pathname.split("/").pop();
    if (path) {
      setSelectedKey(path);
    }
  }, [location]);

  const items = [

    getItem("Tìm kiếm học sinh", "student_profile", <SearchOutlined />),
    getItem("Tạo sự kiện mới", "create_event", <CalendarOutlined />),
    getItem(
      "Quản lý sự kiện",
      "event_group",
      <ScheduleOutlined />,
      [
        getItem("Sự kiện đang diễn ra", "event_now", <CalendarOutlined />),
      ],
      true
    ),
    getItem(
      "Quản lý tài khoản",
      "manage_account",
      <TeamOutlined />
    ),
    getItem("Thống kê báo cáo", "report", <BarChartOutlined />),
    getItem("Quản lí blog", "manager_blog", <FileTextOutlined />),
    getItem("Đăng xuất", "logout", <LogoutOutlined />),
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      setIsLogoutModalOpen(true);
    } else {
      setSelectedKey(key);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/home");
    setIsLogoutModalOpen(false);
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
      icon: <ScheduleOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: () => setIsLogoutModalOpen(true),
    },
  ];

  // Lấy tiêu đề trang từ selectedKey
  const getPageTitle = () => {
    const selectedItem = items.find(item => item.key === selectedKey);
    if (selectedItem) return selectedItem.label;
    
    // Tìm trong submenu
    for (const item of items) {
      if (item.children) {
        const childItem = item.children.find(child => child.key === selectedKey);
        if (childItem) return childItem.label;
      }
    }
    

  };

  // Chiều cao của logo container
  const logoContainerHeight = 60; // 90px là chiều cao của container logo

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        style={{
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          background: "#001529",
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
        }}
      >
        <div
          style={{
            height: `${logoContainerHeight}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: collapsed ? "10px" : "16px",
            background: "rgba(255,255,255,0.04)",
            margin: "16px 0",
          }}
        >
          <div
            style={{
              width: collapsed ? "80px" : "220px",
              height: collapsed ? "60px" : "70px",
              borderRadius: "10px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
              padding: "6px",
            }}
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              style={{ 
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "6px",
              }}
            />
          </div>
        </div>
        
        <Menu
          theme="dark"
          selectedKeys={[selectedKey]}
          mode="inline"
          items={items}
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
            fontSize: "15px",
          }}
        />
        
        <div
          style={{
            padding: collapsed ? "8px 0" : "16px 24px",
            textAlign: "center",
            position: "absolute",
            bottom: "48px",
            width: "100%",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          {!collapsed && (
            <div>
              <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>
                © 2025 Y tế học đường
              </Text>
            </div>
          )}
        </div>
      </Sider>
      
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            position: "sticky",
            top: 0,
            zIndex: 1,
            height: `${logoContainerHeight + 32}px`, // Chiều cao bằng với logo container + margin
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "18px", width: 56, height: 56 }}
            />
            <Title level={3} style={{ margin: 0, marginLeft: 16 }}>
              {getPageTitle()}
            </Title>
          </div>
          
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: 24 }}>
              <Input
                prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
                placeholder="Tìm kiếm..."
                style={{ width: 280, borderRadius: 20, height: 42 }}
                size="large"
              />
            </div>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
              trigger={["click"]}
            >
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(0,0,0,0.02)",
                  padding: "8px 16px",
                  borderRadius: "50px",
                  transition: "all 0.3s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  "&:hover": {
                    background: "rgba(0,0,0,0.05)",
                  },
                }}
              >
                <Avatar
                  size={46}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: colorPrimary,
                    color: "#fff",
                  }}
                />
                <div style={{ marginLeft: 12, textAlign: "left" }}>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    Quản trị viên
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: "24px",
            padding: 0,
            minHeight: 280,
          }}
        >
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: "calc(100vh - 170px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Outlet />
          </div>
        </Content>
        
        <Footer
          style={{
            textAlign: "center",
            padding: "12px 50px",
            background: colorBgContainer,
            color: "rgba(0,0,0,0.45)",
          }}
        >
          Y tế học đường ©2025 - Phần mềm quản lý y tế trường học
        </Footer>
      </Layout>

      <Modal
        title="Xác nhận đăng xuất"
        open={isLogoutModalOpen}
        onOk={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        okText="Đăng xuất"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "12px 0" }}>
          <LogoutOutlined style={{ fontSize: 24, color: "#ff4d4f", marginRight: 16 }} />
          <p style={{ margin: 0, fontSize: 16 }}>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</p>
        </div>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
