import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  InputBase,
  Container,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import "./Header.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/userSlice";

const Header = ({ onScrollToSection }) => {
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isParentLoggedIn, setIsParentLoggedIn] = useState(false); // DEMO: sau này lấy từ context hoặc localStorage
  const user = useSelector((state) => state.user).user;
  console.log(user);
  const dispatch = useDispatch();
  useEffect(() => {
    if (user) {
      setIsParentLoggedIn(true);
    } else {
      setIsParentLoggedIn(false);
    }
  }, [user]);
  const handleUserMenu = (event) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserClose = () => {
    setUserAnchorEl(null);
  };

  const handleMenuClick = (elementId) => {
    if (location.pathname !== "/") {
      // First navigate to home
      navigate("/");
      // Then set up a scroll handler that will run after navigation
      const scrollAfterNav = () => {
        const element = document.getElementById(elementId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 300); // Increased delay to ensure DOM is ready
        }
      };
      // Execute scroll after a short delay to ensure navigation is complete
      setTimeout(scrollAfterNav, 100);
    } else {
      // If already on home page, just scroll
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      if (onScrollToSection) {
        onScrollToSection(elementId);
      }
    }
  };

  // Clean up scroll position when component unmounts
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

  return (
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
        {/* Logo sát trái */}
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
          onClick={() => navigate("/")}
        />
        {/* Phần còn lại trong Container */}
        <Container maxWidth="lg" sx={{ pl: 0, pr: 0, flex: 1 }}>
          <Toolbar
            sx={{
              padding: { xs: 1, md: 0 },
              minHeight: "80px",
              alignItems: "center",

              pl: 0,
            }}
          >
            {/* Search Bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#f5fafd",
                borderRadius: "24px",
                padding: "4px 16px",
                width: "100%",
                maxWidth: "400px",
                marginLeft: { xs: 1, md: 4 },
                marginRight: { xs: 1, md: 4 },
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

            {/* Navigation Menu */}
            <Box sx={{ flexGrow: 1, display: "flex" }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() =>
                    item.isHome ? navigate("/") : handleMenuClick(item.id)
                  }
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    textShadow: "0 1px 4px rgba(0,0,0,0.10)",
                    "&:hover": {
                      color: "#ffd600",
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>

            {/* User Menu */}
            <IconButton
              onClick={handleUserMenu}
              sx={{
                ml: 2,
                p: 0.5,
                "&:hover": {
                  color: "#ffd600",
                  background: "rgba(255,255,255,0.10)",
                },
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 44 }} />
            </IconButton>
            <Typography sx={{ ml: 1, color: "white", fontWeight: 500 }}>
              {user?.fullName}
            </Typography>
            <Menu
              anchorEl={userAnchorEl}
              open={Boolean(userAnchorEl)}
              onClose={handleUserClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {isParentLoggedIn ? (
                <>
                  <MenuItem onClick={() => {}}>Thông báo</MenuItem>
                  <MenuItem onClick={() => {}}>Hồ sơ sức khỏe của con</MenuItem>
                  <MenuItem onClick={() => {}}>Gửi thuốc</MenuItem>
                  <MenuItem onClick={() => {}}>Sự kiện tiêm chủng</MenuItem>
                  <MenuItem onClick={() => {}}>
                    Sự kiện kiểm tra sức khỏe định kì
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      dispatch(logout());
                    }}
                  >
                    Đăng xuất
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={() => navigate("/login")}>
                    Đăng nhập
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/register")}>
                    Đăng ký
                  </MenuItem>
                </>
              )}
            </Menu>
          </Toolbar>
        </Container>
      </Box>
    </AppBar>
  );
};

export default Header;
