import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../config/axios";
import { Container, Typography, Grid, Card, CardContent, Button, Box } from "@mui/material";
import Header from "../../../components/Header/Header";
import { Footer } from "../../../components/Footer/Footer";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="lg" sx={{ pt: 6, pb: 6, mt: { xs: 8, md: 10 } }}>
        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" color="primary" onClick={() => navigate('/home')}>
            Quay lại trang chủ
          </Button>
        </Box>
        <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4 }}>
          Danh sách Blog 
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {blogs.length === 0 && !loading && (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary">
              
              </Typography>
            </Grid>
          )}
          {blogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} key={blog.blogID} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                sx={{
                  width: '100%',
                  maxWidth: 320,
                  height: 270,
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  "&:hover": { transform: "translateY(-8px) scale(1.02)" },
                  borderRadius: 4,
                  boxShadow: 4,
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
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  />
                </Box>
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      textAlign: "center",
                      maxHeight: 40,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.2,
                    }}
                  >
                    {blog.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.9rem' }}>
                    Ngày đăng: {new Date(blog.createdDate).toLocaleDateString("vi-VN")}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/blog/${blog.blogID}`);
                    }}
                    sx={{ fontSize: '0.9rem', px: 2, py: 0.5 }}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
};

export default BlogList; 