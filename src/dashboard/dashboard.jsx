import React, { useState } from "react";
import {
  DesktopOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Modal, theme, Avatar, Dropdown } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/userSlice";

const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label:
      key === "logout" ? label : <Link to={`/dashboard/${key}`}>{label}</Link>,
  };
}
const items = [
  getItem("Tìm kiếm học sinh", "student_profile", <DesktopOutlined />),
  getItem("Tạo sự kiện ", "create_event", <CalendarOutlined />, [
    getItem("Tạo sự kiện tiêm chủng", "Vaccine_event", <MedicineBoxOutlined />),
    getItem(
      "Tạo lịch kiểm tra sức khỏe",
      "create_health_check",
      <MedicineBoxOutlined />
    ),
    getItem("Sự kiện khác", "other_event", <MedicineBoxOutlined />),
  ]),
  getItem("Sự kiện đã tạo  ", "created_event", <DesktopOutlined />),
  getItem(
    "Quản lí tài khoản phụ huynh ",
    "manage_account",
    <DesktopOutlined />
  ),
  getItem("Sự kiện đang diển ra", "event_now", <DesktopOutlined />),

  getItem("Báo cáo ", "report", <DesktopOutlined />),

  getItem("Đăng xuất ", "logout", <DesktopOutlined />),
];
const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      setIsLogoutModalOpen(true);
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
      key: "logout",
      label: "Đăng xuất",
      onClick: () => setIsLogoutModalOpen(true),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={260}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "all 0.3s",
                "&:hover": {
                  background: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <span
                style={{
                  marginRight: 16,
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "white",
                  letterSpacing: 0.5,
                }}
              >
                <span style={{ marginRight: 8 }}>
                  <strong>Xin chào! Admin</strong>
                </span>
                {user?.fullName}
              </span>
              <Avatar
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#fff",
                  color: "#2196f3",
                }}
              />
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <div
            style={{
              padding: 24,
              height: "100%",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}></Footer>
      </Layout>

      <Modal
        title="Xác nhận đăng xuất"
        open={isLogoutModalOpen}
        onOk={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        okText="Đăng xuất"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn đăng xuất không?</p>
      </Modal>
    </Layout>
  );
};
export default Dashboard;
