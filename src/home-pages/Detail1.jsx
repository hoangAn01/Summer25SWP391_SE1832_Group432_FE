import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Header from "../components/Header";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TimerIcon from "@mui/icons-material/Timer";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const BlogDetail = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="md" sx={{ pt: { xs: 12, md: 14 }, pb: 6 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          {/* Tiêu đề và thông tin phụ (meta info) */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, color: "#1a237e", mb: 2 }}
          >
            Phòng ngừa các bệnh thường gặp trong trường học
          </Typography>
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
                Tác giả: Trường Tiểu học ABC
              </Typography>
            </Box>
          </Box>

          {/* Hero image (ảnh đầu bài) */}
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
              src="/public/images/ruatay.jpg"
              alt="Phòng ngừa bệnh học đường"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "scale(1.05)" },
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
                Phòng ngừa bệnh học đường – Nền tảng cho một môi trường học tập
                an toàn
              </Typography>
              <Typography variant="body1">
                Hướng dẫn các biện pháp phòng tránh bệnh truyền nhiễm, giúp học
                sinh luôn khỏe mạnh.
              </Typography>
            </Box>
          </Box>

          {/* Đoạn mở đầu */}
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
            Trường học là nơi các em học sinh vui chơi, học tập và sinh hoạt
            hằng ngày. Tuy nhiên, vì tiếp xúc gần gũi với nhau trong một môi
            trường đông người nên nguy cơ lây lan các bệnh truyền nhiễm như cảm
            cúm, tay chân miệng, sốt siêu vi, đau mắt đỏ… là điều dễ xảy ra, đặc
            biệt với trẻ nhỏ có sức đề kháng chưa cao.
          </Typography>

          {/* Bullet points (dùng MUI List) */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: "#1a237e" }}>
            Một số cách phòng bệnh hiệu quả:
          </Typography>
          <List dense={false} sx={{ mb: 3, pl: 2 }}>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Hướng dẫn các em rửa tay đúng cách bằng xà phòng, đặc biệt là trước khi ăn và sau khi đi vệ sinh." />
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Giữ vệ sinh cá nhân sạch sẽ, cắt móng tay thường xuyên, mặc quần áo gọn gàng, sạch sẽ mỗi ngày." />
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Không dùng chung vật dụng cá nhân như khăn mặt, bình nước, khẩu trang, muỗng, ly..." />
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Ăn uống đầy đủ dưỡng chất, uống nhiều nước, ngủ đủ giấc để tăng cường sức đề kháng." />
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Khi có dấu hiệu như sốt, ho, mệt mỏi, nổi ban, tiêu chảy…, phụ huynh nên cho trẻ nghỉ học và đưa đi khám bác sĩ sớm để tránh lây lan cho các bạn khác." />
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Nhà trường nên đảm bảo lớp học thoáng mát, sạch sẽ, và nhắc nhở học sinh giữ gìn vệ sinh khu vực chung." />
            </ListItem>
          </List>

          {/* Trích dẫn nổi bật (blockquote) */}
          <Divider sx={{ my: 3 }} />
          <Box
            sx={{
              bgcolor: "#e3f2fd",
              borderLeft: "4px solid #1a237e",
              p: 2,
              mb: 3,
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontStyle: "italic", color: "#1a237e" }}
            >
              Việc giáo dục trẻ biết giữ gìn vệ sinh cá nhân và tự bảo vệ sức
              khỏe là bước đầu giúp các em hình thành thói quen tốt lâu dài. Một
              môi trường học đường khỏe mạnh là nền tảng cho sự phát triển toàn
              diện cả về thể chất lẫn tinh thần của học sinh.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default BlogDetail;
