import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,

  IconButton,
} from "@mui/material";
import Header from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";


import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../config/axios";

const HomePage = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/Blog");
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.$values)
          ? res.data.$values
          : [];
        setBlogs(data.filter(blog => blog.isPublished));
      } catch {
        setBlogs([]);
      }
    };
    fetchBlogs();
  }, []);

  const scrollToSection = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Trước phần render blogs
  // Sắp xếp blogs theo ngày tạo mới nhất và chỉ lấy 3 blog đầu tiên
  const sortedBlogs = [...blogs].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  const top3Blogs = sortedBlogs.slice(0, 3);

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
            <Grid container spacing={5} alignItems="stretch" justifyContent="center" wrap="nowrap">
              {top3Blogs.length === 0 && (
                <Grid item xs={12}>
                  <Typography align="center" color="text.secondary">
                    Hiện chưa có blog nào được duyệt.
                  </Typography>
                </Grid>
              )}
              {top3Blogs.map((blog) => {
                let md = 4;
                if (top3Blogs.length === 1) md = 6;
                else if (top3Blogs.length === 2) md = 5;
                return (
                  <Grid item xs={12} md={md} key={blog.blogID} sx={{display: 'flex', justifyContent: 'center', minWidth: 320, maxWidth: 500}}>
                    <Card
                      sx={{
                        width: '100%',
                        maxWidth: 500,
                        height: 420,
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s",
                        cursor: "pointer",
                        "&:hover": { transform: "translateY(-12px) scale(1.03)" },
                        borderRadius: 4,
                        boxShadow: 6,
                        justifyContent: "flex-start",
                        alignItems: 'stretch',
                        mx: 'auto',
                      }}
                      onClick={() => navigate(`/blog/${blog.blogID}`)}
                    >
                      <Box sx={{ width: "100%", aspectRatio: "16/9", position: "relative", bgcolor: '#f0f0f0' }}>
                        <Box
                          component="img"
                          src={blog.imageUrl}
                          alt={blog.title}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                          }}
                        />
                      </Box>
                      <CardContent
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          p: 5,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="h5"
                          gutterBottom
                          sx={{
                            fontWeight: "bold",
                            fontSize: {
                              xs: 'clamp(0.95rem, 2.5vw, 1.15rem)',
                              md: 'clamp(1.05rem, 1.5vw, 1.25rem)'
                            },
                            textAlign: "center",
                            maxHeight: 84,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.2,
                          }}
                        >
                          {blog.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center', fontSize: '0.95rem' }}>
                          Ngày đăng: {new Date(blog.createdDate).toLocaleDateString('vi-VN')}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", mt: "auto" }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/blog/${blog.blogID}`);
                            }}
                            sx={{ fontSize: { xs: "1rem", md: "1.15rem" }, px: 3, py: 1 }}
                          >
                            Đọc thêm
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
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
                onClick={() => navigate('/blog/list')}
              >
                Xem thêm bài viết
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default HomePage;
