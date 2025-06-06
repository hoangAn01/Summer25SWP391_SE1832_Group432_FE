import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import Header from "../components/Header";

const Blog1Detail = () => {
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
            sx={{ fontWeight: 700, color: "#1976d2", mb: 2 }}
          >
            Hoạt Động Ngoại Khóa Bổ Ích
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ngày đăng: {new Date().toLocaleDateString("vi-VN")} | 15 phút đọc |
            Tác giả: Trường Tiểu học ABC
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ fontSize: "1.15rem", lineHeight: 1.8 }}
          >
            Những buổi học ngoài trời tại vườn rau của Trường Tiểu học ABC không
            chỉ giúp các em học sinh vận động thể chất mà còn rèn luyện tinh
            thần trách nhiệm và kỹ năng làm việc nhóm. Mỗi bạn nhỏ được phân
            công chăm sóc một luống rau nhỏ, học cách tưới nước đúng cách, nhổ
            cỏ, bắt sâu và ghi lại sự phát triển của cây hằng tuần.
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
                Ngoài việc học tập trên lớp, các hoạt động ngoại khóa như làm
                vườn, tham quan, trải nghiệm thực tế giúp các em phát triển toàn
                diện hơn. Các em được học cách quan sát thiên nhiên, yêu lao
                động và biết trân trọng thành quả của mình.
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
                  src="/public/images/ngoai_khoa.webp"
                  alt="Ảnh nhỏ bên phải"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              }
              <Typography color="text.secondary" align="center"></Typography>
            </Box>
          </Box>

          {/* Trích dẫn nổi bật */}
          <Box
            sx={{
              bgcolor: "#e3f2fd",
              borderLeft: "4px solid #1976d2",
              p: 2,
              mb: 3,
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontStyle: "italic", color: "#1976d2" }}
            >
              "Các con rất hào hứng mỗi lần được ra vườn. Bạn nào cũng mong cây
              mình trồng nhanh lớn. Từ đó, các con học được cách yêu thiên nhiên
              và quý trọng sức lao động." <br />
              <span style={{ fontWeight: 500 }}>
                - Cô Hương, giáo viên chủ nhiệm lớp 4B
              </span>
            </Typography>
          </Box>

          {/* Bullet points */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: "#1976d2" }}>
            Lợi ích của hoạt động ngoại khóa:
          </Typography>
          <ul
            style={{
              marginLeft: 24,
              marginBottom: 24,
              color: "#333",
              fontSize: "1.08rem",
            }}
          >
            <li>Phát triển kỹ năng sống và làm việc nhóm</li>
            <li>Tăng cường sức khỏe thể chất và tinh thần</li>
            <li>Khơi dậy niềm yêu thiên nhiên, bảo vệ môi trường</li>
            <li>Giúp học sinh tự tin, năng động hơn</li>
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
                src="/public/images/blog1.2.webp"
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
            Không chỉ có hoạt động làm vườn, Trường Tiểu học ABC còn thường
            xuyên tổ chức các buổi ngoại khóa như tham quan sở thú, học kỹ năng
            thoát hiểm với đội PCCC, hay thi vẽ tranh bảo vệ môi trường. Những
            hoạt động này giúp các em phát triển toàn diện về thể chất, tinh
            thần và kỹ năng sống.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Blog1Detail;
