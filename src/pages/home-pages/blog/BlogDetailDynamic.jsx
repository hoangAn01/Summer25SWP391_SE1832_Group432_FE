import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Breadcrumbs, 
  Link, 
  Chip, 
  Divider, 
  Avatar,
  Button,
  Skeleton,
  CircularProgress,
  Fade
} from "@mui/material";
import { 
  CalendarToday, 
  Person, 
  ArrowBack,
  Home,
  AccessTime,
  NavigateNext
} from '@mui/icons-material';
import Header from "../../../components/header/Header";
import { Footer } from "../../../components/Footer/Footer";
import '../../../components/Blog/BlogContent.css';

const BlogDetailDynamic = () => {
  const { blogPostId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/Blog/${blogPostId}`);
        console.log("Blog Detail Response:", res.data); 
        setBlog(res.data);
        setError(null);
        
        // Scroll to top when blog loads
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Lỗi tải chi tiết blog:", error.response ? error.response.data : error);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogPostId]);

  // Format date with validation
  const formatDate = (dateString) => {
    if (!dateString) return "Không có thông tin";
    const date = new Date(dateString);
    return !isNaN(date.getTime()) 
      ? date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        })
      : "Không có thông tin";
  };

  // Format time with validation
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return !isNaN(date.getTime()) 
      ? date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        })
      : "";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Container maxWidth={false} sx={{ maxWidth: 900, pt: 6, pb: 6, mt: { xs: 8, md: 10 } }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="text" height={30} width="60%" sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ mb: 4, borderRadius: 2 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} width="80%" sx={{ mb: 3 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
        </Container>
        <Footer />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Container maxWidth={false} sx={{ maxWidth: 900, pt: 6, pb: 6, mt: { xs: 8, md: 10 } }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<ArrowBack />}
              onClick={() => navigate('/blog')}
              sx={{ mt: 2, borderRadius: '50px' }}
            >
              Quay lại danh sách blog
            </Button>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Header />
      
      {/* Hero section with image */}
      {blog.imageUrl && (
        <Box 
          sx={{ 
            position: 'relative', 
            height: { xs: '200px', md: '350px' },
            width: '100%',
            mt: { xs: 8, md: 10 },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
              zIndex: 1
            }
          }}
        >
          <Box 
            component="img"
            src={blog.imageUrl}
            alt={blog.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          
          <Container 
            maxWidth={false} 
            sx={{ 
              maxWidth: 900, 
              position: 'absolute', 
              bottom: 0, 
              left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 2,
              pb: 4
            }}
          >
            <Fade in={true} timeout={1000}>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
              >
                {blog.title}
              </Typography>
            </Fade>
          </Container>
        </Box>
      )}
      
      <Container maxWidth={false} sx={{ maxWidth: 900, pt: 4, pb: 6 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 4, mt: blog.imageUrl ? 0 : { xs: 10, md: 12 } }}
        >
          <Link 
            underline="hover" 
            color="inherit" 
            sx={{ display: 'flex', alignItems: 'center' }}
            onClick={() => navigate('/home')}
            style={{ cursor: 'pointer' }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Trang chủ
          </Link>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/blog')}
            style={{ cursor: 'pointer' }}
          >
            Blog
          </Link>
          <Typography color="text.primary" sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {blog.title}
          </Typography>
        </Breadcrumbs>
        
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 4, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              bgcolor: 'white'
            }}
          >
            {/* Show title only if no hero image */}
            {!blog.imageUrl && (
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {blog.title}
              </Typography>
            )}
            
            {/* Author and date info */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                alignItems: 'center', 
                gap: 3,
                mb: 4
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, mr: 1 }}>
                  <Person />
                </Avatar>
                <Typography variant="body2">
                  {blog.accountName || "Y tá trường"}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(blog.publishDate)}
                  {formatTime(blog.publishDate) && ` - ${formatTime(blog.publishDate)}`}
                </Typography>
              </Box>
              
              <Chip 
                label="Y tế học đường" 
                size="small" 
                color="primary" 
                sx={{ fontWeight: 500, borderRadius: '50px' }}
              />
            </Box>
            
            {/* Main image (if no hero) */}
            {!blog.imageUrl && blog.imageUrl && (
              <Box sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  style={{ 
                    display: 'block', 
                    width: '100%', 
                    maxHeight: '500px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            )}
            
            {/* Content */}
            <Box sx={{ mb: 4 }}>
              <div 
                className="blog-content" 
                dangerouslySetInnerHTML={{ __html: blog.content }}
                style={{
                  fontSize: '1.1rem',
                  lineHeight: 1.7,
                  color: '#333'
                }}
              />
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<ArrowBack />}
                onClick={() => navigate('/blog')}
                sx={{ 
                  borderRadius: '50px',
                  px: 3,
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
                }}
              >
                Quay lại danh sách
              </Button>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/home')}
                sx={{ 
                  borderRadius: '50px',
                  px: 3,
                  boxShadow: '0 4px 8px rgba(25,118,210,0.25)',
                  '&:hover': { boxShadow: '0 6px 12px rgba(25,118,210,0.35)' }
                }}
              >
                Trang chủ
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
      <Footer />
    </Box>
  );
};

export default BlogDetailDynamic; 