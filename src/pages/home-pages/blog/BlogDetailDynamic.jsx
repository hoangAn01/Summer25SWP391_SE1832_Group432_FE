import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../config/axios";
import { Container, Typography, Box, Paper } from "@mui/material";
import Header from "../../../components/Header/Header";
import { Footer } from "../../../components/Footer/Footer";
import '../../../components/Blog/BlogContent.css';

const BlogDetailDynamic = () => {
  const { blogPostId } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Loại bỏ '/list' khỏi endpoint
        const res = await api.get(`/Blog/${blogPostId}`);
        console.log("Blog Detail Response:", res.data); // Thêm log để kiểm tra
        setBlog(res.data);
      } catch (error) {
        console.error("Lỗi tải chi tiết blog:", error.response ? error.response.data : error);
        setBlog(null);
      }
    };
    fetchBlog();
  }, [blogPostId]);

  if (!blog) return <div>Đang tải...</div>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container maxWidth={false} sx={{ maxWidth: 900, pt: 6, pb: 6 }}>
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
              style={{ display: 'block', margin: '0 auto 24px auto', borderRadius: 8, maxWidth: 400, width: '100%', height: 'auto' }}
            />
          )}
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default BlogDetailDynamic; 