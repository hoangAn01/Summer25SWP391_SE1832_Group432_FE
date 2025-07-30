import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
} from "@mui/material";
import Header from "../../components/header/Header";
import { Footer } from "../../components/Footer/Footer";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { motion } from "framer-motion";
import "./HomePage.css";


const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      ease: "easeOut",
    },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      ease: "easeOut",
    },
  }),
};

const HomePage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const timerRef = useRef(null);

  // Mảng chứa các ảnh nền
  const backgroundImages = [
    "/images/hinh-anh-mam-non_23202317.jpg",
    "/images/ngoai_khoa.webp",
    "/images/3embe.jpg"
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/Blog");
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.$values)
          ? res.data.$values
          : [];
        setBlogs(data.filter(blog => blog.status === "Đã xuất bản" || blog.status === "Published"));
      } catch {
        setBlogs([]);
      }
    };
    fetchBlogs();
  }, []);

  // Thiết lập hẹn giờ để thay đổi ảnh nền
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const scrollToSection = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % backgroundImages.length
    );
  };
  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + backgroundImages.length) % backgroundImages.length
    );
  };

  const sortedBlogs = [...blogs].sort((a, b) => {
    const dateA = new Date(a.createdDate || a.publishDate || a.account?.createdAt || 0);
    const dateB = new Date(b.createdDate || b.publishDate || b.account?.createdAt || 0);
    return dateB - dateA;
  });
  const top3Blogs = sortedBlogs.slice(0, 3);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f6f8fb" }}>
      <Header onScrollToSection={scrollToSection} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          style={{
            position: "relative",
            minHeight: "85vh",
            backgroundImage: `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.35)), url(${backgroundImages[currentImageIndex]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-image 1.5s ease-in-out",
          }}
        >
          {/* Nút điều hướng */}
          <Box className="slider-nav prev" onClick={goToPrevImage} sx={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", zIndex: 10, cursor: "pointer", color: "white", width: 50, height: 50, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)", transition: "all 0.3s", "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" } }}>
            <span style={{ fontSize: 30 }}>‹</span>
          </Box>
          <Box className="slider-nav next" onClick={goToNextImage} sx={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 10, cursor: "pointer", color: "white", width: 50, height: 50, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)", transition: "all 0.3s", "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" } }}>
            <span style={{ fontSize: 30 }}>›</span>
          </Box>
          {/* Chỉ số ảnh */}
          <Box sx={{ position: "absolute", bottom: 20, left: 0, right: 0, zIndex: 10, display: "flex", justifyContent: "center", gap: 2 }}>
            {backgroundImages.map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.2 }}
                onClick={() => setCurrentImageIndex(index)}
                style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: index === currentImageIndex ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer", margin: 2, border: index === currentImageIndex ? "2px solid #1976d2" : "none", boxShadow: index === currentImageIndex ? "0 0 8px #1976d2" : "none" }}
              />
            ))}
          </Box>
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, width: "100%" }}>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Paper elevation={4} sx={{ py: 6, px: { xs: 3, md: 8 }, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", width: { xs: "95%", sm: "85%", md: "75%" }, maxWidth: 1100, mx: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.13)", textAlign: "center" }}>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: "2.1rem", md: "2.8rem" }, color: "primary.main", textShadow: "1px 1px 2px rgba(0,0,0,0.08)" }}>
                  Nâng cao sức khỏe, phát triển toàn diện
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, fontSize: { xs: "1.1rem", md: "1.35rem" }, fontWeight: 500, color: "text.primary", lineHeight: 1.6 }}>
                  Cùng chung tay xây dựng môi trường học đường khỏe mạnh và hạnh phúc cho các em học sinh thân yêu
                </Typography>
              </Paper>
            </motion.div>
          </Container>
        </motion.div>

        {/* Introduction Section */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
          <Box id="info" className="introduction-section">
            <Container maxWidth="lg" sx={{ px: 4 }}>
              <Box className="introduction-content">
                <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="introduction-image">
                  <Box component="img" src="/images/tap-the-duc.jpg" alt="Hoạt động của trường" sx={{ borderRadius: 4, boxShadow: 4, width: "100%", maxWidth: 420 }} />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="introduction-text">
                  <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: "bold", color: "primary.main", mb: 4, fontSize: "2.2rem" }}>
                    Giới thiệu về Trường Tiểu học ABC
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
                    Trường Tiểu học ABC là một ngôi trường thân thiện, hiện đại và giàu truyền thống dạy tốt – học tốt. Với khuôn viên rộng rãi, xanh – sạch – đẹp, cùng hệ thống phòng học được trang bị đầy đủ thiết bị, trường tạo điều kiện thuận lợi cho học sinh học tập và phát triển toàn diện.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
                    Đội ngũ giáo viên của trường là những thầy cô tận tâm, giàu kinh nghiệm, luôn đổi mới phương pháp giảng dạy để mang lại hiệu quả cao. Bên cạnh việc dạy học, trường còn tổ chức nhiều hoạt động ngoại khóa bổ ích như văn nghệ, thể thao, kỹ năng sống, góp phần phát triển toàn diện cả về trí tuệ và nhân cách cho học sinh.
                  </Typography>
            
                </motion.div>
              </Box>
            </Container>
          </Box>
        </motion.div>

        {/* School Health Information Section */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
          <Box id="school-health" sx={{ py: 10, bgcolor: "#f5f5f5" }}>
            <Container maxWidth="lg" sx={{ px: 4 }}>
              <Typography variant="h4" component="h2" align="center" sx={{ fontWeight: "bold", color: "primary.main", mb: 6, fontSize: "2.2rem" }}>
                Thông Tin Y Tế Học Đường
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6 }}>
                <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
                  <Box sx={{ flex: "0 0 400px", height: 400, overflow: "hidden", borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", bgcolor: "#fff" }}>
                    <Box component="img" src="/images/y_te_hoc_dg.jpg" alt="Y tế học đường" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Box>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
                  <Box sx={{ flex: 1, pl: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3, fontSize: "1.8rem" }} align="left">
                      Hệ Thống Quản Lý Y Tế Trường Học
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }} align="left">
                      Hệ thống quản lý thông tin y tế hiện đại giúp nhà trường và phụ huynh theo dõi sát sao tình hình sức khỏe của học sinh. Phụ huynh có thể dễ dàng cập nhật và xem thông tin sức khỏe của con em mình thông qua ứng dụng trực tuyến.
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }} align="left">
                      Nhà trường có thể quản lý hồ sơ y tế, lịch khám định kỳ, và thông báo kịp thời đến phụ huynh về các vấn đề sức khỏe của học sinh. Đồng thời, hệ thống cũng hỗ trợ theo dõi và báo cáo về tình hình dịch bệnh trong trường học.
                    </Typography>
                  </Box>
                </motion.div>
              </Box>
            </Container>
          </Box>
        </motion.div>

        {/* Info Cards Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 4 } }}>
          <Grid container spacing={3} alignItems="stretch" wrap="nowrap">
            {[{
              title: "Phòng ngừa các bệnh trường học",
              desc: "Phòng ngừa các bệnh thường gặp trong trường học",
              detail: "Các biện pháp hiệu quả giúp học sinh phòng tránh các bệnh truyền nhiễm phổ biến tại trường học.",
              color: "#3f51b5",
              link: "/blog/phong-ngua-benh"
            }, {
              title: "Dinh dưỡng học đường",
              desc: "Dinh dưỡng hợp lý cho học sinh trong giai đoạn phát triển",
              detail: "Hướng dẫn về chế độ dinh dưỡng cân đối giúp học sinh tăng cường sức khỏe và hỗ trợ phát triển thể chất.",
              color: "#4caf50",
              link: "/blog/dinh-duong-hoc-duong"
            }, {
              title: "Sức khỏe tâm thần học đường",
              desc: "Sức khỏe tâm thần ở tuổi học đường - Nhận biết và hỗ trợ",
              detail: "Hướng dẫn cho phụ huynh và giáo viên về cách nhận biết dấu hiệu stress, lo âu ở học sinh và biện pháp hỗ trợ hiệu quả.",
              color: "#9c27b0",
              link: "/blog/suc-khoe-tam-than"
            }].map((card, idx) => (
              <Grid item xs={4} key={card.title} style={{ display: 'flex' }}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeInUp}
                  custom={idx + 1}
                  style={{ width: '100%', display: 'flex', flex: 1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: card.color,
                      color: 'white',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      boxShadow: 6,
                      borderRadius: 3,
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-10px) scale(1.04)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        filter: 'brightness(1.08)'
                      },
                    }}
                    onClick={() => navigate(card.link)}
                  >
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '1.3rem', md: '1.5rem' } }}>{card.title}</Typography>
                      <Typography sx={{ mb: 2, fontSize: { xs: '0.9rem', md: '1rem' } }}>{card.desc}</Typography>
                      <Typography variant="body2" sx={{ mb: 3, fontSize: { xs: '0.9rem', md: '1rem' }, flexGrow: 1 }}>{card.detail}</Typography>
                      <Box sx={{ mt: 'auto' }}>
                        <Button variant="outlined" sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.13)' }, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                          ĐỌC THÊM
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          {/* View All Button */}
      
        </Container>

        {/* Blog Section */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeInUp}>
          <Box id="blog" sx={{ py: { xs: 6, md: 10 }, bgcolor: "#f5f5f5" }}>
            <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
              <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 6, fontWeight: "bold", color: "primary.main", fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
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
                {top3Blogs.map((blog, idx) => {
                  let md = 4;
                  if (top3Blogs.length === 1) md = 6;
                  else if (top3Blogs.length === 2) md = 5;
                  return (
                    <Grid item xs={12} md={md} key={blog.blogPostId} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeInUp}
                        custom={idx + 1}
                        style={{ width: '100%' }}
                      >
                        <Card
                          sx={{
                            width: '100%',
                            maxWidth: 500,
                            height: 420,
                            display: "flex",
                            flexDirection: "column",
                            transition: "transform 0.3s, box-shadow 0.3s",
                            cursor: "pointer",
                            '&:hover': { transform: "translateY(-12px) scale(1.04)", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" },
                            borderRadius: 4,
                            boxShadow: 6,
                            justifyContent: "flex-start",
                            alignItems: 'stretch',
                            mx: 'auto',
                          }}
                          onClick={() => navigate(`/blog/${blog.blogPostId}`)}
                        >
                          <Box sx={{ width: "100%", aspectRatio: "16/9", position: "relative", bgcolor: '#f0f0f0', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' }}>
                            <motion.img
                              src={blog.imageUrl}
                              alt={blog.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              initial={{ scale: 1.08 }}
                              whileHover={{ scale: 1.13 }}
                              transition={{ duration: 0.5 }}
                            />
                          </Box>
                          <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 5, justifyContent: "center", alignItems: "center" }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", fontSize: { xs: 'clamp(0.95rem, 2.5vw, 1.15rem)', md: 'clamp(1.05rem, 1.5vw, 1.25rem)' }, textAlign: "center", maxHeight: 84, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', lineHeight: 1.2 }}>
                              {blog.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Ngày đăng: {(() => {
                                try {
                                  const date = blog.createdDate || blog.publishDate || blog.account?.createdAt;
                                  return date ? new Date(date).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Không có ngày đăng";
                                } catch (error) {
                                  console.error("Lỗi định dạng ngày:", error);
                                  return "Không xác định";
                                }
                              })()}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", mt: "auto" }}>
                              <Button variant="outlined" color="primary" size="large" onClick={e => { e.stopPropagation(); navigate(`/blog/${blog.blogPostId}`); }} sx={{ fontSize: { xs: "1rem", md: "1.15rem" }, px: 3, py: 1 }}>
                                Đọc thêm
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
              {/* View More Button */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} custom={4}>
                <Box sx={{ textAlign: "center", mt: 6 }}>
                  <Button variant="contained" color="primary" size="large" sx={{ px: 4, py: 1.5, borderRadius: 2, fontSize: { xs: "0.9rem", md: "1.1rem" }, boxShadow: 3, '&:hover': { background: "#1976d2" } }} onClick={() => navigate('/blog')}>
                    Xem thêm bài viết
                  </Button>
                </Box>
              </motion.div>
            </Container>
          </Box>
        </motion.div>
      </Box>



      <Footer />
    </Box>
  );
};

export default HomePage;
