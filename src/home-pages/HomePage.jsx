import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Header from "../components/Header";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SearchIcon from "@mui/icons-material/Search";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToSection = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header onScrollToSection={scrollToSection} />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <Box
          id="home"
          className="heroSection"
          sx={{
            position: "relative",
            py: { xs: 6, md: 10 },
            textAlign: "center",
            color: "white",
            backgroundImage: "url('/images/hinh-anh-mam-non_23202317.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: { xs: "60vh", md: "80vh" },
            display: "flex",
            alignItems: "center",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
            },
          }}
        >
          <Container
            maxWidth="lg"
            sx={{ position: "relative", zIndex: 2, px: { xs: 2, md: 4 } }}
          >
            <Box
              sx={{
                display: "inline-block",
                px: { xs: 2, md: 6 },
                py: { xs: 2, md: 4 },
                borderRadius: 4,
                background: "rgba(0,0,0,0.45)",
                boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
                mx: "auto",
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  mb: 3,
                  fontWeight: 900,
                  color: "#fff",
                  textShadow: "4px 4px 16px rgba(0,0,0,0.7), 0 2px 8px #1976d2",
                  fontSize: { xs: "2rem", md: "3rem" },
                  letterSpacing: "1.5px",
                  lineHeight: 1.1,
                }}
              ></Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  maxWidth: "900px",
                  mx: "auto",
                  color: "#fff",
                  opacity: 0.98,
                  textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
                  fontSize: { xs: "1.1rem", md: "1.5rem" },
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  lineHeight: 1.5,
                }}
              >
                Nâng cao sức khỏe, phát triển toàn diện cho học sinh
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  maxWidth: "900px",
                  mx: "auto",
                  color: "#fff",
                  opacity: 0.98,
                  textShadow: "1px 1px 6px rgba(0,0,0,0.7)",
                  fontStyle: "italic",
                  fontSize: { xs: "1.1rem", md: "1.4rem" },
                  lineHeight: 1.6,
                  fontWeight: 400,
                  letterSpacing: "0.5px",
                }}
              >
                Cùng chung tay xây dựng môi trường học đường khỏe mạnh và hạnh
                phúc cho các em học sinh thân yêu
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* Introduction Section */}
        <Box
          id="info"
          sx={{
            py: 10,
            bgcolor: "#fff",
          }}
        >
          <Container maxWidth="lg" sx={{ px: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              {/* Ảnh bên trái */}
              <Box
                sx={{
                  flex: "0 0 500px",
                  height: 500,
                  overflow: "hidden",
                  borderRadius: 4,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <Box
                  component="img"
                  src="/images/tap-the-duc.jpg"
                  alt="Hoạt động của trường"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
              {/* Văn bên phải */}
              <Box sx={{ flex: 1, pl: 4 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    color: "primary.main",
                    mb: 4,
                    fontSize: "2.2rem",
                  }}
                >
                  Giới thiệu về Trường Tiểu học ABC
                </Typography>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{
                    mb: 3,
                    lineHeight: 1.8,
                    fontSize: "1.1rem",
                  }}
                >
                  Trường Tiểu học ABC là một ngôi trường thân thiện, hiện đại và
                  giàu truyền thống dạy tốt – học tốt. Với khuôn viên rộng rãi,
                  xanh – sạch – đẹp, cùng hệ thống phòng học được trang bị đầy
                  đủ thiết bị, trường tạo điều kiện thuận lợi cho học sinh học
                  tập và phát triển toàn diện.
                </Typography>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{
                    mb: 3,
                    lineHeight: 1.8,
                    fontSize: "1.1rem",
                  }}
                >
                  Đội ngũ giáo viên của trường là những thầy cô tận tâm, giàu
                  kinh nghiệm, luôn đổi mới phương pháp giảng dạy để mang lại
                  hiệu quả cao. Bên cạnh việc dạy học, trường còn tổ chức nhiều
                  hoạt động ngoại khóa bổ ích như văn nghệ, thể thao, kỹ năng
                  sống, góp phần phát triển toàn diện cả về trí tuệ và nhân cách
                  cho học sinh.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    lineHeight: 1.8,
                    fontStyle: "italic",
                    color: "primary.main",
                    fontSize: "1.1rem",
                  }}
                >
                  Với phương châm "Học sinh là trung tâm – Chất lượng là mục
                  tiêu", Trường Tiểu học ABC luôn là nơi gửi gắm niềm tin của
                  phụ huynh và là nền tảng vững chắc cho tương lai của học sinh.
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* School Health Information Section */}
        <Box
          id="school-health"
          sx={{
            py: 10,
            bgcolor: "#f5f5f5",
          }}
        >
          <Container maxWidth="lg" sx={{ px: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              align="center"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                mb: 6,
                fontSize: "2.2rem",
              }}
            >
              Thông Tin Y Tế Học Đường
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              {/* Ảnh bên trái */}
              <Box
                sx={{
                  flex: "0 0 400px",
                  height: 400,
                  overflow: "hidden",
                  borderRadius: 4,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  bgcolor: "#fff",
                }}
              >
                <Box
                  component="img"
                  src="/images/y_te_hoc_dg.jpg"
                  alt="Y tế học đường"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
              {/* Văn bên phải */}
              <Box sx={{ flex: 1, pl: 4 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    mb: 3,
                    fontSize: "1.8rem",
                  }}
                  align="left"
                >
                  Hệ Thống Quản Lý Y Tế Trường Học
                </Typography>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{
                    mb: 3,
                    lineHeight: 1.8,
                    fontSize: "1.1rem",
                  }}
                  align="left"
                >
                  Hệ thống quản lý thông tin y tế hiện đại giúp nhà trường và
                  phụ huynh theo dõi sát sao tình hình sức khỏe của học sinh.
                  Phụ huynh có thể dễ dàng cập nhật và xem thông tin sức khỏe
                  của con em mình thông qua ứng dụng trực tuyến.
                </Typography>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{
                    mb: 3,
                    lineHeight: 1.8,
                    fontSize: "1.1rem",
                  }}
                  align="left"
                >
                  Nhà trường có thể quản lý hồ sơ y tế, lịch khám định kỳ, và
                  thông báo kịp thời đến phụ huynh về các vấn đề sức khỏe của
                  học sinh. Đồng thời, hệ thống cũng hỗ trợ theo dõi và báo cáo
                  về tình hình dịch bệnh trong trường học.
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Info Cards Section */}
        <Container
          maxWidth="lg"
          sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 4 } }}
        >
          <Grid container spacing={3} alignItems="stretch" wrap="nowrap">
            {/* Card 1 */}
            <Grid item xs={4}>
              <Card
                sx={{
                  height: "100%",
                  minHeight: 260,
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "#3f51b5",
                  color: "white",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                  },
                  borderRadius: 2,
                }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 4,
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "1.3rem", md: "1.5rem" },
                    }}
                  >
                    Phòng ngừa các bệnh trường học
                  </Typography>
                  <Typography
                    sx={{
                      mb: 2,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    Phòng ngừa các bệnh thường gặp trong trường học
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 3,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      flexGrow: 1,
                    }}
                  >
                    Các biện pháp hiệu quả giúp học sinh phòng tránh các bệnh
                    truyền nhiễm phổ biến tại trường học.
                  </Typography>
                  <Box sx={{ mt: "auto" }}>
                    <Button
                      variant="outlined"
                      sx={{
                        color: "white",
                        borderColor: "white",
                        "&:hover": {
                          borderColor: "white",
                          bgcolor: "rgba(255,255,255,0.1)",
                        },
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      }}
                      onClick={() => navigate("/blog/phong-ngua-benh")}
                    >
                      ĐỌC THÊM
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 2 */}
            <Grid item xs={4}>
              <Card
                sx={{
                  height: "100%",
                  minHeight: 260,
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "#4caf50",
                  color: "white",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                  },
                  borderRadius: 2,
                }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 4,
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "1.3rem", md: "1.5rem" },
                    }}
                  >
                    Dinh dưỡng học đường
                  </Typography>
                  <Typography
                    sx={{
                      mb: 2,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    Dinh dưỡng hợp lý cho học sinh trong giai đoạn phát triển
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 3,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      flexGrow: 1,
                    }}
                  >
                    Hướng dẫn về chế độ dinh dưỡng cân đối giúp học sinh tăng
                    cường sức khỏe và hỗ trợ phát triển thể chất.
                  </Typography>
                  <Box sx={{ mt: "auto" }}>
                    <Button
                      variant="outlined"
                      sx={{
                        color: "white",
                        borderColor: "white",
                        "&:hover": {
                          borderColor: "white",
                          bgcolor: "rgba(255,255,255,0.1)",
                        },
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      }}
                      onClick={() => navigate("/blog/dinh-duong-hoc-duong")}
                    >
                      ĐỌC THÊM
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 3 */}
            <Grid item xs={4}>
              <Card
                sx={{
                  height: "100%",
                  minHeight: 260,
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "#9c27b0",
                  color: "white",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                  },
                  borderRadius: 2,
                }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 4,
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "1.3rem", md: "1.5rem" },
                    }}
                  >
                    Sức khỏe tâm thần học đường
                  </Typography>
                  <Typography
                    sx={{
                      mb: 2,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    Sức khỏe tâm thần ở tuổi học đường - Nhận biết và hỗ trợ
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 3,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      flexGrow: 1,
                    }}
                  >
                    Hướng dẫn cho phụ huynh và giáo viên về cách nhận biết dấu
                    hiệu stress, lo âu ở học sinh và biện pháp hỗ trợ hiệu quả.
                  </Typography>
                  <Box sx={{ mt: "auto" }}>
                    <Button
                      variant="outlined"
                      sx={{
                        color: "white",
                        borderColor: "white",
                        "&:hover": {
                          borderColor: "white",
                          bgcolor: "rgba(255,255,255,0.1)",
                        },
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      }}
                      onClick={() => navigate("/blog/suc-khoe-tam-than")}
                    >
                      ĐỌC THÊM
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* View All Button */}
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              variant="outlined"
              color="primary"
              sx={{
                borderRadius: "20px",
                px: 4,
                py: 1.5,
                borderWidth: 2,
                fontSize: { xs: "0.9rem", md: "1.1rem" },
                "&:hover": {
                  borderWidth: 2,
                },
              }}
            >
              Xem tất cả bài viết
            </Button>
          </Box>
        </Container>

        {/* Blog Section */}
        <Box id="blog" sx={{ py: { xs: 6, md: 10 }, bgcolor: "#f5f5f5" }}>
          <Container
            maxWidth="lg"
            sx={{ px: { xs: 2, md: 4 }, overflowX: "auto" }}
          >
            <Typography
              variant="h4"
              component="h2"
              align="center"
              gutterBottom
              sx={{
                mb: 6,
                fontWeight: "bold",
                color: "primary.main",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
              }}
            >
              Blog học đường
            </Typography>
            <Grid container spacing={4} alignItems="stretch" wrap="nowrap">
              {/* Blog Post 1 */}
              <Grid item xs={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-8px)" },
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
                    <Box
                      component="img"
                      src="/images/ngoai_khoa.webp"
                      alt="Blog post 1"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: 4,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "1.2rem", md: "1.4rem" },
                      }}
                    >
                      Hoạt Động Ngoại Khóa Bổ Ích
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        mb: 3,
                        flexGrow: 1,
                      }}
                    >
                      Khám phá các hoạt động ngoại khóa thú vị giúp học sinh
                      phát triển toàn diện cả về thể chất và tinh thần.
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mt: "auto" }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          flex: 1,
                          fontSize: { xs: "0.8rem", md: "0.9rem" },
                        }}
                      >
                        15 phút đọc
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => {
                          navigate("/blog/hoat-dong-ngoai-khoa");
                          setTimeout(() => window.scrollTo(0, 0), 0);
                        }}
                        sx={{
                          fontSize: { xs: "0.8rem", md: "0.9rem" },
                        }}
                      >
                        Đọc thêm
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Blog Post 2 */}
              <Grid item xs={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-8px)" },
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
                    <Box
                      component="img"
                      src="/images/blog2.jpeg"
                      alt="Blog post 2"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: 4,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "1.2rem", md: "1.4rem" },
                      }}
                    >
                      Kỹ Năng Sống Cần Thiết
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        mb: 3,
                        flexGrow: 1,
                      }}
                    >
                      Những kỹ năng sống quan trọng giúp học sinh tự tin, độc
                      lập và sẵn sàng đối mặt với thử thách.
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mt: "auto" }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          flex: 1,
                          fontSize: { xs: "0.8rem", md: "0.9rem" },
                        }}
                      >
                        10 phút đọc
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => {
                          navigate("/blog/ky-nang-song");
                          setTimeout(() => window.scrollTo(0, 0), 0);
                        }}
                        sx={{
                          fontSize: { xs: "0.8rem", md: "0.9rem" },
                        }}
                      >
                        Đọc thêm
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Blog Post 3 */}
              <Grid item xs={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-8px)" },
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
                    <Box
                      component="img"
                      src="/images/congnghe.jpg"
                      alt="Blog post 3"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: 4,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "1.2rem", md: "1.4rem" },
                      }}
                    >
                      Công Nghệ Trong Giáo Dục
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        mb: 3,
                        flexGrow: 1,
                      }}
                    >
                      Khám phá cách công nghệ hiện đại đang thay đổi và nâng cao
                      chất lượng giáo dục trong trường học.
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mt: "auto" }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          flex: 1,
                          fontSize: { xs: "0.8rem", md: "0.9rem" },
                        }}
                      >
                        12 phút đọc
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => {
                          navigate("/blog/cong-nghe-giao-duc");
                          setTimeout(() => window.scrollTo(0, 0), 0);
                        }}
                        sx={{
                          fontSize: { xs: "0.8rem", md: "0.9rem" },
                        }}
                      >
                        Đọc thêm
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* View More Button */}
            <Box sx={{ textAlign: "center", mt: 6 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: { xs: "0.9rem", md: "1.1rem" },
                }}
              >
                Xem thêm bài viết
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Footer */}
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
                © {new Date().getFullYear()} Y tế học đường. Đã đăng ký bản
                quyền.
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* Scroll to Top Button */}
        <Box
          onClick={scrollToTop}
          className="scrollTopButton"
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            backgroundColor: "primary.main",
            color: "white",
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "primary.dark",
              transform: "translateY(-2px)",
            },
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUpIcon />
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
