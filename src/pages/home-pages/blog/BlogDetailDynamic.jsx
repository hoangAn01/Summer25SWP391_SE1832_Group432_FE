import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../config/axios";
import { Container, Typography, Box, Paper } from "@mui/material";
import Header from "../../../components/Header/Header";
import { Footer } from "../../../components/Footer/Footer";

const BlogDetailDynamic = () => {
  const { blogID } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/Blog/${blogID}`);
        setBlog(res.data);
      } catch {
        setBlog(null);
      }
    };
    fetchBlog();
  }, [blogID]);

  if (!blog) return <div>Đang tải...</div>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="md" sx={{ pt: 6, pb: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            {blog.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ngày đăng: {new Date(blog.createdDate).toLocaleDateString("vi-VN")}
          </Typography>
          {blog.imageUrl && (
            <img
              src={blog.imageUrl}
              alt={blog.title}
              style={{ width: "100%", borderRadius: 8, marginBottom: 24 }}
            />
          )}
          <Typography variant="body1" sx={{ fontSize: "1.15rem", lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {blog.content}
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default BlogDetailDynamic; 