import React, { useState } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  PropertySafetyOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme, Avatar, Dropdown } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiUser } from "react-icons/fi";
import { HiOutlineLogout } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/userSlice";
import NotificationDropdown from "./NotificationDropdown";

const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label: <Link to={key}>{label}</Link>,
  };
}
const items = [
  getItem("Báo cáo sự kiện y tế", "medical-event", <PieChartOutlined />),
  getItem("Danh sách học sinh", "student-profile-list", <DesktopOutlined />),
  getItem("Duyệt thuốc", "approve-medicine", <PropertySafetyOutlined />),
  getItem("User", "sub1", <UserOutlined />),
];

const Nurse = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e) => {
    if (e.key == "1") {
      navigate("profile");
    }
    if (e.key == "3") {
      // key '3' là đăng xuất
      console.log("Đăng xuất", e.key);
      dispatch(logout());
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 24px",
            background: colorBgContainer,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "#666" }}>
              Xin chào{" "}
              <span style={{ color: "#1677ff", fontWeight: 600 }}>
                {user?.fullName || "Y tá"}
              </span>
            </span>
            <NotificationDropdown />
            <Dropdown
              menu={{
                items: [
                  {
                    key: "1",
                    label: "Thông tin",
                    icon: <UserOutlined />,
                  },
                  {
                    key: "2",
                    label: "Cài đặt",
                    icon: <SettingOutlined />,
                  },
                  {
                    key: "3",
                    label: "Đăng xuất",
                    icon: <LogoutOutlined />,
                  },
                ],
                onClick: handleMenuClick,
              }}
              placement="bottomRight"
            >
              <Avatar
                size={40}
                icon={<UserOutlined />}
                style={{ cursor: "pointer" }}
              />
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[{ title: "User" }, { title: "Bill" }]}
          />
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
        <Footer style={{ textAlign: "center" }}>
          ©{new Date().getFullYear()} Được tạo ra bởi team 432
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Nurse;
