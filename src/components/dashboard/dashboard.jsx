import React, { useState } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, Modal, theme, Avatar, Dropdown, Button } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/userSlice";
import Vaccine_event from "./dashboad_element/Create_event/Vaccine_event";

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
    getItem(
      "Tạo sự kiện tiêm chủng",
      "Vaccine_event",
      <MedicineBoxOutlined />
    ),
    getItem(
      "Tạo lịch kiểm tra sức khỏe",
      "create_health_check",
      <MedicineBoxOutlined />
    ),
    getItem(
      "Sự kiện khác",
      "other_event",
      <MedicineBoxOutlined />
    ),
  ]),
  getItem("Quản lí tài khoản  ", "manage_account", <DesktopOutlined />),
  getItem("Thống kê ","statistical", <DesktopOutlined />),
  getItem("Báo cáo ", "report", <DesktopOutlined />),
  getItem("Đăng xuất ", "logout", <DesktopOutlined />),
];
const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [openCreateEvent, setOpenCreateEvent] = useState(false);
  const [selectedEventTab, setSelectedEventTab] = useState(null);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user).user;

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      setIsLogoutModalOpen(true);
    } else if (key === "create_event") {
      setOpenCreateEvent((prev) => !prev);
      setSelectedEventTab(null);
    } else if (["Vaccine_event", "create_health_check", "other_event"].includes(key)) {
      setSelectedEventTab(key);
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
          defaultSelectedKeys={[]}
          mode="inline"
          items={items}
          onClick={handleMenuClick}
        />
        {openCreateEvent && (
          <div style={{ background: '#f5f7fa', padding: '12px 16px', borderRadius: 8, margin: 12 }}>
            <div style={{ fontWeight: 600, color: '#1976d2', marginBottom: 8 }}>Tạo sự kiện</div>
            <div>
              <Button type={selectedEventTab === 'Vaccine_event' ? 'primary' : 'default'} block style={{ marginBottom: 8 }} onClick={() => setSelectedEventTab('Vaccine_event')}>Tạo sự kiện tiêm chủng</Button>
              <Button type={selectedEventTab === 'create_health_check' ? 'primary' : 'default'} block style={{ marginBottom: 8 }} onClick={() => setSelectedEventTab('create_health_check')}>Tạo lịch kiểm tra sức khỏe</Button>
              <Button type={selectedEventTab === 'other_event' ? 'primary' : 'default'} block onClick={() => setSelectedEventTab('other_event')}>Sự kiện khác</Button>
            </div>
          </div>
        )}
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
                  marginRight: 8,
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              >
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
            {openCreateEvent && selectedEventTab === 'Vaccine_event' && <Vaccine_event />}
            {!openCreateEvent && <Outlet />}
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
