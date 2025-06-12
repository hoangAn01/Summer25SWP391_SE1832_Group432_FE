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
import PsychologyIcon from "@mui/icons-material/Psychology";
import SchoolIcon from "@mui/icons-material/School";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import TimerIcon from "@mui/icons-material/Timer";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import MoodIcon from "@mui/icons-material/Mood";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GroupsIcon from "@mui/icons-material/Groups";
import Header from "../../../components/Header/Header";

const Detail3 = () => {
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
            Sức Khỏe Tâm Thần Ở Tuổi Học Đường
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
              <Typography variant="body2">8 phút đọc</Typography>
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
                Tác giả: Chuyên gia tâm lý học đường
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
              src="/images/details3.png"
              alt="Mental health in schools"
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
                Nhận Biết và Hỗ Trợ Sức Khỏe Tâm Thần Học Đường
              </Typography>
              <Typography variant="body1">
                Hướng dẫn cho phụ huynh và giáo viên về cách quan tâm đến sức
                khỏe tinh thần của học sinh
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
          Ở lứa tuổi học đường, học sinh không chỉ đối mặt với bài vở mà còn
          phải vượt qua nhiều áp lực tâm lý như thi cử, kỳ vọng từ người lớn,
          mâu thuẫn bạn bè và thay đổi tâm sinh lý. Nếu không được quan tâm đúng
          cách, các em rất dễ rơi vào trạng thái căng thẳng (stress), lo âu, mất
          ngủ hoặc thậm chí là trầm cảm nhẹ – những dấu hiệu thường bị bỏ qua vì
          tưởng là "tính cách trẻ con".
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                bgcolor: "#e3f2fd",
                borderRadius: 4,
                border: "1px solid #90caf9",
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
                  color: "#1976d2",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <FamilyRestroomIcon fontSize="large" />
                Đối với phụ huynh
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <MoodIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6">Kết nối hàng ngày</Typography>
                    }
                    secondary="Duy trì những cuộc trò chuyện nhẹ nhàng với con"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FavoriteIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        Lắng nghe không phán xét
                      </Typography>
                    }
                    secondary="Tôn trọng và thấu hiểu cảm xúc của con"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PsychologyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6">Quan sát thay đổi</Typography>
                    }
                    secondary="Chú ý đến những biểu hiện bất thường của con"
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
                bgcolor: "#f3e5f5",
                borderRadius: 4,
                border: "1px solid #ce93d8",
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
                  color: "#7b1fa2",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <SchoolIcon fontSize="large" />
                Đối với giáo viên
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <GroupsIcon sx={{ color: "#7b1fa2" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        Môi trường thân thiện
                      </Typography>
                    }
                    secondary="Tạo không gian an toàn cho học sinh"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SentimentSatisfiedIcon sx={{ color: "#7b1fa2" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6">Nhận diện dấu hiệu</Typography>
                    }
                    secondary="Theo dõi thái độ và hành vi của học sinh"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PsychologyIcon sx={{ color: "#7b1fa2" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6">Hoạt động thư giãn</Typography>
                    }
                    secondary="Tổ chức các hoạt động giảm stress"
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
            border: "1px solid #a5d6a7",
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
              mb: 4,
            }}
          >
            <FavoriteIcon />
            Dấu hiệu cần chú ý
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <MoodIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Thay đổi tâm trạng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dễ cáu gắt, buồn bã kéo dài
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <GroupsIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Thu mình
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tránh giao tiếp, không muốn tham gia hoạt động
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <PsychologyIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Suy giảm học tập
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Khó tập trung, kết quả học tập giảm sút
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
            Thông điệp cuối cùng
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
            Một học sinh khỏe mạnh không chỉ là khỏe về thể chất mà còn là người
            biết quản lý cảm xúc, biết chia sẻ khi cần giúp đỡ, và có một tâm
            hồn tích cực. Việc chăm sóc sức khỏe tâm thần học đường là trách
            nhiệm chung tay của cả gia đình và nhà trường.
          </Typography>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Detail3;
