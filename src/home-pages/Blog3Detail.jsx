import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Typography, Box, Paper, Divider } from "@mui/material";
import Header from "../components/Header";

const Blog3Detail = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="md" sx={{ pt: { xs: 12, md: 14 }, pb: 6 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          {/* Tiêu đề và thông tin phụ */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, color: "#7b1fa2", mb: 2 }}
          >
            Công Nghệ Trong Giáo Dục
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ngày đăng: {new Date().toLocaleDateString("vi-VN")} | 12 phút đọc |
            Tác giả: Trường Tiểu học ABC
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ fontSize: "1.15rem", lineHeight: 1.8 }}
          >
            Tại Trường Tiểu học ABC, công nghệ hiện đại đang làm thay đổi hoàn
            toàn cách dạy và học. Không còn những tiết học khô khan, giờ đây học
            sinh được sử dụng máy chiếu, máy tính bảng, phần mềm học tập thông
            minh để tiếp cận kiến thức một cách sinh động và trực quan.
          </Typography>

          {/* Đoạn văn + ảnh nhỏ: flexbox 2 cột, không float */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "flex-start",
              gap: 3,
              mb: 3,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                paragraph
                sx={{ fontSize: "1.15rem", lineHeight: 1.8, m: 0 }}
              >
                Trong tiết học Khoa học, lớp 5C đã trải nghiệm kính thực tế ảo
                (VR) để "tham quan" một nhà máy sữa và quan sát quy trình sản
                xuất – tất cả ngay trong phòng học. Học sinh vô cùng thích thú
                và ghi nhớ bài học nhanh hơn.
              </Typography>
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: "100%", md: 340 },
                height: { xs: 180, md: 220 },
                maxWidth: "100%",
                minHeight: 180,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#f5f5f5",
                boxShadow: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: { xs: 2, md: 0 },
                p: 0,
              }}
            >
              {
                <img
                  src="/public/images/blog4.png"
                  alt="Ảnh nhỏ bên phải"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              }
            </Box>
          </Box>

          {/* Trích dẫn nổi bật */}
          <Box
            sx={{
              bgcolor: "#ede7f6",
              borderLeft: "4px solid #7b1fa2",
              p: 2,
              mb: 3,
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontStyle: "italic", color: "#7b1fa2" }}
            >
              "Công nghệ giúp các con không chỉ học tốt hơn mà còn rèn luyện tư
              duy logic, khả năng tìm kiếm và xử lý thông tin." <br />
              <span style={{ fontWeight: 500 }}>
                - Thầy Minh, giáo viên Tin học
              </span>
            </Typography>
          </Box>

          {/* Bullet points */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: "#7b1fa2" }}>
            Lợi ích của việc ứng dụng công nghệ trong giáo dục:
          </Typography>
          <ul
            style={{
              marginLeft: 24,
              marginBottom: 24,
              color: "#333",
              fontSize: "1.08rem",
            }}
          >
            <li>Tiếp cận kiến thức sinh động, trực quan hơn</li>
            <li>Phát triển tư duy logic, kỹ năng tìm kiếm thông tin</li>
            <li>Tăng sự hứng thú, chủ động trong học tập</li>
            <li>Chuẩn bị tốt cho tương lai số hóa</li>
          </ul>

          <Divider sx={{ my: 3 }} />

          {/* Ảnh minh họa cuối bài */}
          <Box
            sx={{
              width: "100%",
              height: 220,
              mb: 3,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0,
            }}
          >
            {
              <img
                src="/public/images/blog3.2.jpg"
                alt="Ảnh cuối bài"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            }
          </Box>

          <Typography
            variant="body1"
            paragraph
            sx={{ fontSize: "1.12rem", lineHeight: 1.8 }}
          >
            Trường Tiểu học ABC đang từng bước đưa công nghệ vào mọi hoạt động
            học tập – tạo nên một môi trường giáo dục hiện đại, nơi học sinh
            được truyền cảm hứng và phát triển toàn diện cho tương lai.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Blog3Detail;
