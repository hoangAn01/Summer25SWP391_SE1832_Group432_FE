import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import "./Header.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/userSlice";
import { Modal } from "antd";
import api from "../../config/axios";

const Header = () => {
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [showNoProfileDialog, setShowNoProfileDialog] = useState(false);
  const [hasHealthProfile, setHasHealthProfile] = useState(false);

  useEffect(() => {
    if (user) {
      // Logic for when user is logged in
    } else {
      // Logic for when user is not logged in
    }
  }, [user]);

  const handleUserMenu = (event) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserClose = () => {
    setUserAnchorEl(null);
  };

  const handleMenuClick = (elementId) => {
    if (elementId === "contact") {
      setShowContactModal(true);
      return;
    }
    if (location.pathname !== "/home" && location.pathname !== "/") {
      navigate("/home");
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    } else {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    return () => {
      window.scrollTo(0, 0);
    };
  }, []);

  const menuItems = [
    { text: "TRANG CHỦ", id: "home", isHome: true },
    { text: "GIỚI THIỆU", id: "info" },
    { text: "THÔNG TIN", id: "school-health" },
    { text: "BLOG", id: "blog" },
    { text: "LIÊN HỆ", id: "contact" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/login");
    setShowLogoutModal(false);
  };

  // Giả lập kiểm tra có hồ sơ hay không (bạn thay bằng logic thực tế)
  // const hasHealthProfile = false;

  const handleHealthProfileMenuClick = () => {
    navigate("/student-health-profile/edit");
    // if (!hasHealthProfile) {
    //   setShowNoProfileDialog(true);
    // } else {
    //   navigate("/health-profile");
    // }
  };

  const handleCreateProfile = () => {
    setShowNoProfileDialog(false);
    navigate("/create-health-profile");
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)",
          color: "white",
          boxShadow: "0 4px 24px 0 rgba(33,150,243,0.10)",
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minHeight: "80px",
            width: "100%",
          }}
        >
          <Box
            component="img"
            src="/public/images/logo.png"
            alt="Logo Y Tế Học Đường"
            className="logo"
            sx={{
              height: 65,
              maxHeight: 65,
              width: "auto",
              mr: 2,
              ml: 1.5,
              cursor: "pointer",
              objectFit: "contain",
              display: "block",
              borderRadius: "16px",
              boxShadow: "0 2px 8px 0 rgba(33,150,243,0.10)",
            }}
          />
          <Container maxWidth="lg" sx={{ pl: 0, pr: 0, flex: 1 }}>
            <Toolbar
              sx={{
                padding: { xs: 1, md: 0 },
                minHeight: "80px",
                alignItems: "center",
                pl: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f5fafd",
                  borderRadius: "24px",
                  padding: "4px 16px",
                  width: "100%",
                  maxWidth: "400px",
                  marginLeft: 0,
                  marginRight: 1,
                  boxShadow: "0 1px 6px 0 rgba(33,150,243,0.08)",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                  },
                }}
              >
                <SearchIcon sx={{ color: "#2196f3", mr: 1 }} />
                <InputBase
                  placeholder="Tìm kiếm thông tin y tế, tin tức..."
                  sx={{
                    width: "100%",
                    color: "#2196f3",
                    fontWeight: 500,
                    "& input": {
                      padding: "8px 0",
                      color: "#2196f3",
                      "::placeholder": {
                        color: "#bdbdbd",
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ flexGrow: 1, display: "flex" }}>
                {menuItems.map(
                  (item) =>
                    item.id !== "health-profile" && (
                      <Button
                        key={item.text}
                        onClick={() => handleMenuClick(item.id)}
                        sx={{
                          color: item.id === "contact" ? "#ffd600" : "white",
                          fontWeight: 500,
                          textShadow: "0 1px 4px rgba(0,0,0,0.10)",
                          "&:hover": {
                            color: "#ffd600",
                          },
                        }}
                      >
                        {item.text}
                      </Button>
                    )
                )}
              </Box>

              {user ? (
                <>
                  <Typography sx={{ ml: 1, color: "white", fontWeight: 500 }}>
                    {user.fullName}
                  </Typography>
                  <IconButton
                    onClick={handleUserMenu}
                    sx={{ ml: 1, p: 0.5, "&:hover": { color: "#ffd600" } }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 44 }} />
                  </IconButton>
                  <IconButton
                    sx={{ ml: 2, p: 0.5, "&:hover": { color: "#ffd600" } }}
                    onClick={() => navigate("/event")}
                  >
                    <NotificationsIcon sx={{ fontSize: 32 }} />
                  </IconButton>
                  <Menu
                    anchorEl={userAnchorEl}
                    open={Boolean(userAnchorEl)}
                    onClose={handleUserClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleUserClose();
                        navigate("/parent-profile");
                      }}
                    >
                      Thông tin cá nhân
                    </MenuItem>
                    <MenuItem onClick={handleHealthProfileMenuClick}>
                      Hồ sơ sức khỏe học sinh
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleUserClose();
                        navigate("/medication_form");
                      }}
                    >
                      Gửi thuốc
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleUserClose();
                        navigate("");
                      }}
                    >
                      Quản lý
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleUserClose();
                        setShowLogoutModal(true);
                      }}
                    >
                      Đăng xuất
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: "flex", gap: 2, ml: 2 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    sx={{
                      borderRadius: 3,
                      borderColor: "#fff",
                      color: "#fff",
                      fontWeight: 600,
                      px: 2,
                      "&:hover": {
                        background: "rgba(255,255,255,0.15)",
                        borderColor: "#ffd600",
                        color: "#ffd600",
                      },
                    }}
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    sx={{
                      borderRadius: 3,
                      fontWeight: 600,
                      px: 2,
                      boxShadow: "0 2px 8px 0 rgba(255,214,0,0.15)",
                      color: "#fff",
                      "&:hover": { background: "#ffb300" },
                    }}
                    onClick={() => navigate("/register")}
                  >
                    Đăng ký
                  </Button>
                </Box>
              )}
            </Toolbar>
          </Container>
        </Box>

        <Modal
          title="Đăng xuất"
          open={showLogoutModal}
          onOk={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
          okText="Đăng xuất"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn đăng xuất?</p>
        </Modal>

        <Modal
          open={showContactModal}
          onCancel={() => setShowContactModal(false)}
          footer={null}
          title="Thông tin liên hệ"
        >
          <p>Email: support@example.com</p>
          <p>Phone: 123-456-7890</p>
        </Modal>
      </AppBar>

      <Dialog
        open={showNoProfileDialog}
        onClose={() => setShowNoProfileDialog(false)}
      >
        <DialogTitle>Chưa có hồ sơ sức khỏe</DialogTitle>
        <DialogContent>
          Học sinh chưa có hồ sơ sức khỏe. Bấm "Tạo hồ sơ" để tiếp tục.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowNoProfileDialog(false)}
            color="secondary"
          >
            Đóng
          </Button>
          <Button
            onClick={handleCreateProfile}
            color="primary"
            variant="contained"
          >
            Tạo hồ sơ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
