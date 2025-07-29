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
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import InfoIcon from '@mui/icons-material/Info';
import "./Header.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/userSlice";
import { Modal } from "antd";
import api from "../../config/axios";
import { toast } from "react-toastify";

const Header = () => {
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [showNoProfileDialog, setShowNoProfileDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkForm, setLinkForm] = useState({ studentID: "", studentName: "" });
  const [linkLoading, setLinkLoading] = useState(false);
  const [parentId, setParentId] = useState(null);

  useEffect(() => {
    if (user) {
      // Logic for when user is logged in
    } else {
      // Logic for when user is not logged in
    }
  }, [user]);

  useEffect(() => {
    if (user && user.userID) {
      // Lấy parentID theo userID
      (async () => {
        try {
          const res = await api.get(`Parent/ByAccount/${user.userID}`);
          setParentId(res.data.parentID);
        } catch (err) {
          console.error("Không tìm thấy parent:", err);
        }
      })();
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
          paddingTop: "10px",
          paddingBottom: "10px"
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
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flexDirection: "row", flexWrap: "nowrap" }}>
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
                    placeholder="Tìm kiếm "
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
                
                <Box sx={{ 
                  display: "flex", 
                  marginLeft: 2, 
                  flexDirection: "row", 
                  flexWrap: "nowrap"
                }}>
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
                            whiteSpace: "nowrap",
                            padding: "0 12px",
                          }}
                        >
                          {item.text}
                        </Button>
                      )
                  )}
                </Box>
              </Box>

              {user ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ mr: 2, color: "white", fontWeight: 500 }}>
                    {user.fullName}
                  </Typography>
                  <IconButton
                    onClick={handleUserMenu}
                    sx={{ p: 0.5, "&:hover": { color: "#ffd600" } }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 44 }} />
                  </IconButton>
                  <IconButton
                    sx={{ ml: 2, p: 0.5, "&:hover": { color: "#ffd600" } }}
                    onClick={() => navigate("/event")}
                  >
                    <NotificationsIcon sx={{ fontSize: 32 }} />
                  </IconButton>
                  <IconButton
                    sx={{ ml: 1, p: 0.5, "&:hover": { color: "#ffd600" } }}
                    onClick={() => setShowLogoutModal(true)}
                  >
                    <LogoutIcon sx={{ fontSize: 32 }} />
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
                        setShowLinkDialog(true);
                      }}
                    >
                      Liên kết học sinh
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleUserClose();
                        navigate("/event");
                      }}
                    >
                      Tham gia sự kiện
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleUserClose();
                        navigate("/confirm-event");
                      }}
                    >
                      Xác nhận sự kiện
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
                </Box>
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
        open={showLinkDialog} 
        onClose={() => setShowLinkDialog(false)}
        PaperProps={{ 
          style: { 
            borderRadius: 12,
            padding: 8,
            width: '400px',
            maxWidth: '95vw'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex',
          alignItems: 'center', 
          gap: 1.5, 
          fontWeight: 600, 
          color: '#1976d2',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: 2
        }}>
          <PersonAddIcon sx={{ color: '#1976d2' }} />
          Liên kết học sinh với phụ huynh
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f9ff', borderRadius: 2, border: '1px solid #e3f2fd' }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0277bd' }}>
              <InfoIcon fontSize="small" />
              Liên kết học sinh với tài khoản phụ huynh giúp quản lý hồ sơ sức khỏe, tham gia sự kiện y tế và nhận thông báo liên quan đến học sinh.
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Mã học sinh"
              variant="outlined"
              fullWidth
              value={linkForm.studentID}
              onChange={(e) => setLinkForm({ ...linkForm, studentID: e.target.value })}
              placeholder="Nhập mã số học sinh"
              required
              InputProps={{
                startAdornment: <SchoolIcon sx={{ mr: 1, color: '#757575' }} />
              }}
              helperText="Nhập mã số được cấp bởi nhà trường"
            />
            
            <TextField
              label="Họ tên học sinh"
              variant="outlined"
              fullWidth
              value={linkForm.studentName}
              onChange={(e) => setLinkForm({ ...linkForm, studentName: e.target.value })}
              placeholder="Nhập họ và tên đầy đủ của học sinh"
              required
              InputProps={{
                startAdornment: <BadgeIcon sx={{ mr: 1, color: '#757575' }} />
              }}
              helperText="Viết đúng họ tên như trong hồ sơ học sinh"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setShowLinkDialog(false)} 
            variant="outlined"
            color="inherit"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Hủy bỏ
          </Button>
          
          <Button
            variant="contained"
            disabled={linkLoading || !linkForm.studentID || !linkForm.studentName.trim()}
            onClick={async () => {
              if (!parentId) return;
              setLinkLoading(true);
              try {
                await api.post("/Student/link-parent", {
                  studentID: parseInt(linkForm.studentID),
                  studentName: linkForm.studentName.trim(),
                  parentID: parentId
                });
                toast.success("✅ Liên kết học sinh thành công!", {
                  position: "top-right",
                  autoClose: 3000
                });
                setShowLinkDialog(false);
                setLinkForm({ studentID: "", studentName: "" }); // Reset form after success
              } catch (err) {
                console.error(err);
                let errorTitle = "❌ Không thể liên kết học sinh";
                let errorMsg = "Mã học sinh hoặc tên học sinh không đúng hoặc đã được liên kết trước đó";
                let suggestion = "Vui lòng kiểm tra lại thông tin và thử lại.";
                
                // Xử lý lỗi 404 Not Found - trong trường hợp này là học sinh không tồn tại
                if (err.response?.status === 404) {
                  errorMsg = "Không tìm thấy thông tin học sinh phù hợp với yêu cầu của bạn ";
                  suggestion = "Vui lòng kiểm tra lại mã học sinh và tên học sinh đã chính xác chưa.";
                } 
                // Xử lý các lỗi khác (400 Bad Request)
                else if (err.response?.status === 400) {
                  if (err.response?.data?.includes("already linked")) {
              
                    errorMsg = err.response.data || errorMsg;
                  }
                }
                // Hiển thị nội dung lỗi trong console để debug
                console.log("API Error:", {
                  status: err.response?.status,
                  data: err.response?.data,
                  url: err.config?.url
                });
                
                // Hiển thị thông báo lỗi chi tiết hơn
                toast.error(
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{errorTitle}</div>
                    <div>{errorMsg}</div>
                    <div style={{ fontSize: '0.9em', marginTop: '8px', opacity: 0.9 }}>{suggestion}</div>
                  </div>, 
                  {
                    position: "top-right",
                    autoClose: 5000,
                    closeButton: true,
                    draggable: false,
                    closeOnClick: false,
                    pauseOnHover: true
                  }
                );
              } finally {
                setLinkLoading(false);
              }
            }}
            startIcon={<PersonAddIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)'
            }}
          >
            {linkLoading ? "Đang liên kết..." : "Liên kết học sinh"}
          </Button>
        </DialogActions>
      </Dialog>

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
