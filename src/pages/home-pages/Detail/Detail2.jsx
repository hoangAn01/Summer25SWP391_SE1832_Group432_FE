import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Fade,
} from "@mui/material";
import Header from "../../../components/Header/Header";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import NoFoodIcon from "@mui/icons-material/NoFood";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import TimerIcon from "@mui/icons-material/Timer";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";

const Detail2 = () => {
  const scrollToSection = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#fafafa",
      }}
    >
      <Header onScrollToSection={scrollToSection} />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              textAlign: "center",
              mb: 3,
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Hướng Dẫn Chế Độ Dinh Dưỡng Cho Học Sinh Tiểu Học
          </Typography>

          {/* Article Meta Info */}
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 6 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 20, mr: 1 }} />
              <Typography variant="body2">
                Ngày đăng: {new Date().toLocaleDateString("vi-VN")}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <TimerIcon sx={{ fontSize: 20, mr: 1 }} />
              <Typography variant="body2">10 phút đọc</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <PersonIcon sx={{ fontSize: 20, mr: 1 }} />
              <Typography variant="body2">
                Tác giả: Chuyên gia dinh dưỡng
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "500px",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
              mb: 6,
            }}
          >
            <Box
              component="img"
              src="/images/detail2.jpg"
              alt="Healthy eating for students"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                color: "white",
                p: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                Dinh dưỡng - Nền tảng cho sự phát triển toàn diện
              </Typography>
              <Typography variant="body1">
                Khám phá cách xây dựng thực đơn cân bằng và lành mạnh cho học
                sinh tiểu học
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Typography
          variant="body1"
          paragraph
          sx={{
            fontSize: "1.2rem",
            mb: 6,
            lineHeight: 1.8,
            color: "text.primary",
            textAlign: "justify",
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Giai đoạn tiểu học là thời kỳ vàng để trẻ phát triển thể chất, trí tuệ
          và hình thành thói quen sinh hoạt lành mạnh. Một chế độ dinh dưỡng đầy
          đủ và cân bằng sẽ giúp các em tăng trưởng tốt, có đủ năng lượng học
          tập, vui chơi và phòng tránh được nhiều bệnh tật.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                bgcolor: "#f8f9fa",
                borderRadius: 4,
                border: "1px solid #e0e0e0",
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: "primary.main",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <LocalDiningIcon fontSize="large" />4 Nhóm Chất Thiết Yếu
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LocalDiningIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="h6">Tinh bột</Typography>}
                    secondary="Cơm, bún, bánh mì, khoai..."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalDiningIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="h6">Chất đạm</Typography>}
                    secondary="Thịt, cá, trứng, đậu hũ, sữa..."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalDiningIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="h6">Chất béo</Typography>}
                    secondary="Dầu ăn, mỡ cá, bơ thực vật..."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalDiningIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        Vitamin và khoáng chất
                      </Typography>
                    }
                    secondary="Rau củ, trái cây, nước, sữa..."
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                bgcolor: "#fff3e0",
                borderRadius: 4,
                border: "1px solid #ffe0b2",
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: "#ed6c02",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <RestaurantIcon />
                Gợi Ý Một Ngày Ăn Uống Hợp Lý
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        3 bữa chính: sáng, trưa, tối
                      </Typography>
                    }
                    secondary="Đảm bảo đủ chất và đa dạng món ăn"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="h6">1–2 bữa phụ</Typography>}
                    secondary="Sữa, trái cây, bánh ít ngọt hoặc ngũ cốc"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="h6">Uống đủ nước</Typography>}
                    secondary="1–1,5 lít/ngày, tăng cường vận động thể chất"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 6,
            bgcolor: "#e8f5e9",
            borderRadius: 4,
            border: "1px solid #c8e6c9",
            transition:
              "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: "#2e7d32",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <NoFoodIcon />
            Lưu Ý Cho Phụ Huynh
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <NoFoodIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Hạn chế thực phẩm không có lợi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đồ chiên, nước ngọt, bánh kẹo
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <RestaurantIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Khuyến khích ăn rau xanh
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mỗi ngày và không bỏ bữa sáng
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <WatchLaterIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Tạo thói quen ăn uống đúng giờ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Không vừa ăn vừa chơi điện thoại hay xem tivi
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box
          sx={{
            bgcolor: "#f5f5f5",
            p: 4,
            borderRadius: 4,
            textAlign: "center",
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              mb: 3,
            }}
          >
            Kết Luận
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{
              fontSize: "1.1rem",
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            Dinh dưỡng tốt là nền tảng cho một cơ thể khỏe mạnh và một tinh thần
            sẵn sàng học hỏi. Hãy cùng nhau chăm sóc bữa ăn hàng ngày cho các em
            thật đầy đủ và yêu thương!
          </Typography>
        </Box>
      </Container>
      <Footer />
    </Box>
     
  );
};

export default Detail2;
