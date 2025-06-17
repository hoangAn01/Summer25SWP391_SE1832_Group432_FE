import React from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Grid,
  Button
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export function Footer() {
  return (
    <Box sx={{ bgcolor: "#2196f3", color: "white", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
        <Grid
          container
          spacing={4}
          alignItems="flex-start"
          justifyContent="space-between"
        >
          {/* First Section */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ textAlign: { xs: "center", md: "left" } }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Y Tế Học Đường
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Hỗ trợ công tác chăm sóc sức khỏe học sinh toàn diện.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Lô L2a-7, Đường D1, Khu Công Nghệ Cao,
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Phường Long Thạnh Mỹ, TP.Thủ Đức, TP.Hồ Chí Minh
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Hotline: (028) 1234 5678
            </Typography>
            <Typography variant="body2">
              Email: info@ytehocduong.edu.vn
            </Typography>
          </Grid>

          {/* Second Section */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ textAlign: { xs: "center", md: "left" } }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Liên Kết Nhanh
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "flex-start",
              }}
            >
              {[
                "TRANG CHỦ",
                "BLOG",
                "GIỚI THIỆU",
                "LIÊN HỆ",
                "THÔNG TIN",
              ].map((item) => (
                <Button
                  key={item}
                  color="inherit"
                  sx={{
                    display: "block",
                    textAlign: "left",
                    textTransform: "none",
                    padding: "4px 0",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    minWidth: 0,
                    color: "white",
                    fontWeight: 500,
                    background: "none",
                    "&:hover": { background: "none", color: "#0d47a1" },
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>
          </Grid>

          {/* Third Section - Social */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ textAlign: { xs: "center", md: "left" } }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Kết Nối Với Chúng Tôi
            </Typography>
            <Box
              sx={{
                mb: 1,
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <IconButton color="inherit" size="small" sx={{ mx: 0.5 }}>
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" size="small" sx={{ mx: 0.5 }}>
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" size="small" sx={{ mx: 0.5 }}>
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" size="small" sx={{ mx: 0.5 }}>
                <LinkedInIcon />
              </IconButton>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "0.95rem", md: "1rem" },
                mt: 1,
                maxWidth: 260,
                ml: 0,
                mr: 0,
              }}
            >
              Theo dõi chúng tôi để cập nhật những thông tin mới nhất về sức
              khỏe học đường
            </Typography>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            pt: 2,
            mt: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} Y tế học đường. Đã đăng ký bản quyền.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 