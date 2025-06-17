import React, { useEffect } from "react";
import { Container, Typography, Box, Paper } from "@mui/material";
import Header from "../../../components/Header/Header";

const Blog2Detail = () => {
  useEffect(() => {
    if (!window.location.hash.includes("#reloaded")) {
      window.location.hash = "#reloaded";
      window.location.reload();
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="md" sx={{ pt: { xs: 12, md: 14 }, pb: 6 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, color: "#388e3c", mb: 2 }}
          >
            Kỹ Năng Sống Cần Thiết
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ngày đăng: {new Date().toLocaleDateString("vi-VN")} | 10 phút đọc |
            Tác giả: Trường Tiểu học ABC
          </Typography>
          {/* Ảnh minh họa 1 - Chèn ảnh tại đây */}
          <Box
            sx={{
              width: "100%",
              height: 320,
              mb: 4,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* <img src="/images/your-image1.jpg" alt="Kỹ năng sống" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
            <Typography color="text.secondary">
              (Chèn ảnh minh họa 1 ở đây)
            </Typography>
          </Box>
          <Typography
            variant="body1"
            paragraph
            sx={{ fontSize: "1.15rem", lineHeight: 1.8 }}
          >
            Bên cạnh các môn học chính khóa, Trường Tiểu học ABC luôn chú trọng
            rèn luyện kỹ năng sống cho học sinh. Các em được học cách gấp quần
            áo, giữ vệ sinh cá nhân, và thực hành những kỹ năng giao tiếp quan
            trọng như nói lời cảm ơn, xin lỗi đúng lúc.
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ fontStyle: "italic", mb: 2 }}
          >
            Vừa qua, lớp 3A đã tổ chức buổi sinh hoạt chủ đề "Nói lời yêu
            thương" với nhiều hoạt động cảm xúc. Các bạn được chia sẻ câu chuyện
            gia đình, viết thư cảm ơn ba mẹ, và thực hành lắng nghe bạn bè. Qua
            đó, các em học cách thể hiện tình cảm một cách nhẹ nhàng và chân
            thành.
          </Typography>
          {/* Ảnh minh họa 2 - Chèn ảnh tại đây */}
          <Box
            sx={{
              width: "100%",
              height: 320,
              mb: 4,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* <img src="/images/your-image2.jpg" alt="Kỹ năng sống" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
            <Typography color="text.secondary">
              (Chèn ảnh minh họa 2 ở đây)
            </Typography>
          </Box>
          <Typography
            variant="body1"
            paragraph
            sx={{ fontSize: "1.15rem", lineHeight: 1.8 }}
          >
            Thông qua các hoạt động kỹ năng sống, học sinh Trường Tiểu học ABC
            trở nên tự tin, hòa đồng và biết cư xử lễ phép hơn trong đời sống
            hằng ngày.
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default Blog2Detail;
