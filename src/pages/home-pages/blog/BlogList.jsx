import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Box, 
  Chip, 
  Avatar, 
  CircularProgress,
  Divider,
  TextField,
  InputAdornment,
  Skeleton,
  Fade
} from "@mui/material";
import { 
  ArrowBack, 
  CalendarToday, 
  Search, 
  Person, 
  ArrowForward, 
  Bookmark 
} from '@mui/icons-material';
import Header from "../../../components/header/Header";
import { Footer } from "../../../components/Footer/Footer";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Loại bỏ '/list' khỏi endpoint
        const res = await api.get("/Blog");
        console.log("API Response:", res.data); // Log toàn bộ response để kiểm tra
        
        // Xử lý dữ liệu trả về
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.$values)
          ? res.data.$values
          : [];
        
        // Lọc blog đã xuất bản
        const publishedBlogs = data.filter(blog => 
          blog.status === "Đã xuất bản" || 
          blog.status === "Published" ||
          blog.status === "published"
        );
        
        // Sắp xếp blog theo thời gian gần nhất
        const sortedBlogs = publishedBlogs.sort((a, b) => {
          const dateA = new Date(a.createdDate || a.publishDate || a.account?.createdAt || 0);
          const dateB = new Date(b.createdDate || b.publishDate || b.account?.createdAt || 0);
          return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
        });
        
        console.log("Published Blogs:", sortedBlogs);
        setBlogs(sortedBlogs);
      } catch (error) {
        console.error("Lỗi tải blog:", error.response ? error.response.data : error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Lọc blog theo từ khóa tìm kiếm
  const filteredBlogs = blogs.filter(blog => 
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Không xác định";
      
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric"
      });
    } catch (error) {
      return "Không xác định";
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Header />
      <Box 
        sx={{ 
          bgcolor: '#1976d2', 
          color: 'white', 
          py: 6, 
          mt: { xs: 8, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(25,118,210,0.95) 0%, rgba(21,101,192,0.95) 100%)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              fontWeight: 800, 
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Blog Y Tế Học Đường
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              fontWeight: 400, 
              mb: 4, 
              maxWidth: '800px', 
              mx: 'auto',
              opacity: 0.9,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Chia sẻ kiến thức, kinh nghiệm và thông tin bổ ích về sức khỏe học đường
          </Typography>
          
          <Box sx={{ maxWidth: '500px', mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm bài viết..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  borderRadius: '50px',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& ::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1,
                  }
                }
              }}
            />
          </Box>
        </Container>
        
        {/* Decorative elements */}
        <Box sx={{ 
          position: 'absolute', 
          width: '300px', 
          height: '300px', 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          top: '-100px',
          right: '-100px',
          zIndex: 0
        }} />
        <Box sx={{ 
          position: 'absolute', 
          width: '200px', 
          height: '200px', 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          bottom: '-50px',
          left: '10%',
          zIndex: 0
        }} />
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate('/home')}
            startIcon={<ArrowBack />}
            sx={{ 
              borderRadius: '50px',
              px: 2,
              boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.12)'
              }
            }}
          >
            Quay lại trang chủ
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            {filteredBlogs.length} bài viết
          </Typography>
        </Box>
        
        {loading ? (
          <Grid container spacing={4}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card sx={{ 
                  height: 350, 
                  borderRadius: 4, 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}>
                  <Skeleton variant="rectangular" height={180} animation="wave" />
                  <CardContent>
                    <Skeleton variant="text" height={32} width="80%" animation="wave" />
                    <Skeleton variant="text" height={20} width="60%" animation="wave" />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Skeleton variant="rectangular" height={36} width={120} animation="wave" sx={{ borderRadius: 18 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : filteredBlogs.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            bgcolor: 'white',
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Không tìm thấy bài viết nào
        </Typography>
            <Typography variant="body1" color="text.secondary">
              Vui lòng thử lại với từ khóa khác
              </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {filteredBlogs.map((blog, index) => (
              <Grid item xs={12} sm={6} md={4} key={blog.blogID || index}>
                <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card
                sx={{
                      height: 350,
                  display: "flex",
                  flexDirection: "column",
                      transition: "all 0.3s ease",
                  cursor: "pointer",
                      "&:hover": { 
                        transform: "translateY(-10px)", 
                        boxShadow: '0 12px 28px rgba(0,0,0,0.15)' 
                      },
                  borderRadius: 4,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      position: 'relative'
                }}
                onClick={() => navigate(`/blog/${blog.blogPostId}`)}
              >
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Box
                    component="img"
                        src={blog.imageUrl || 'https://placehold.co/600x400/e0e0e0/7d7d7d?text=No+Image'}
                    alt={blog.title}
                    sx={{
                      width: "100%",
                          height: 180,
                      objectFit: "cover",
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                      <Chip
                        label="Y tế học đường"
                        color="primary"
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 12, 
                          right: 12,
                          fontWeight: 500,
                          bgcolor: 'rgba(25, 118, 210, 0.85)',
                          backdropFilter: 'blur(4px)'
                    }}
                  />
                </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          lineHeight: 1.4,
                          mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                          height: 50
                    }}
                  >
                    {blog.title}
                  </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: '#1976d2' }}>
                          <Person sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {blog.accountName || "Y tá trường"}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(blog.createdDate || blog.publishDate || blog.account?.createdAt)}
                  </Typography>
                      </Box>
                      
                  <Button
                        variant="contained"
                    color="primary"
                    size="small"
                        endIcon={<ArrowForward />}
                        onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/blog/${blog.blogPostId}`);
                    }}
                        sx={{ 
                          mt: 'auto', 
                          borderRadius: '50px',
                          textTransform: 'none',
                          boxShadow: '0 4px 8px rgba(25,118,210,0.25)',
                          '&:hover': {
                            boxShadow: '0 6px 12px rgba(25,118,210,0.35)'
                          }
                        }}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
                </Fade>
            </Grid>
          ))}
        </Grid>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

export default BlogList; 