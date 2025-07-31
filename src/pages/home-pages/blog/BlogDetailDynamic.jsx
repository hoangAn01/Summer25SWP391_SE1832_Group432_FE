import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
  Fade,
  TextField,
  IconButton,
  Alert,
} from "@mui/material";
import {
  CalendarToday,
  Person,
  ArrowBack,
  Home,
  AccessTime,
  NavigateNext,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import Header from "../../../components/Header/Header";
import { Footer } from "../../../components/Footer/Footer";
import "../../../components/Blog/BlogContent.css";

const BlogDetailDynamic = () => {
  const { blogPostId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user);

  // Comment states
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Fetch blog data
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
        console.error(
          "Lỗi tải chi tiết blog:",
          error.response ? error.response.data : error
        );
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogPostId]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!blogPostId) return;

      setCommentsLoading(true);
      try {
        const res = await api.get(`/blog-comments/blog/${blogPostId}`);
        // Lấy comments từ $values và lọc status Active, sắp xếp theo thời gian mới nhất trước
        const activeComments = res.data.$values
          ? res.data.$values
              .filter((comment) => comment.status === "Active")
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        console.log("Active comments:", activeComments); // Để debug
        setComments(activeComments);
        setCommentsError(null);
      } catch (error) {
        console.error(
          "Lỗi tải bình luận:",
          error.response ? error.response.data : error
        );
        setCommentsError("Không thể tải bình luận. Vui lòng thử lại sau.");
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [blogPostId]);

  // Format date with validation - tự động cộng 7 giờ cho múi giờ Việt Nam
  const formatDate = (dateString) => {
    if (!dateString) return "Không có thông tin";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Không có thông tin";
    
    // Cộng thêm 7 giờ cho múi giờ Việt Nam (UTC+7)
    const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    
    return vietnamTime.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format time with validation - tự động cộng 7 giờ cho múi giờ Việt Nam
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    // Cộng thêm 7 giờ cho múi giờ Việt Nam (UTC+7)
    const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    
    return vietnamTime.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Comment handling functions
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    const accountID = currentUser.userID;
    console.log(accountID);
    try {
      await api.post("/blog-comments", {
        blogPostID: parseInt(blogPostId),
        content: newComment.trim(),
        accountID: accountID,
      });
      setNewComment("");
      // Gọi lại API để lấy danh sách comments mới nhất
      await fetchComments();
    } catch (error) {
      console.error("Lỗi đăng bình luận:", error);
      alert("Không thể đăng bình luận. Vui lòng thử lại sau.");
    }
  };

  const handleEditClick = (comment) => {
    setEditingCommentId(comment.commentID);
    setEditCommentText(comment.content);
  };

  const fetchComments = async () => {
    if (!blogPostId) return;

    setCommentsLoading(true);
    try {
      const res = await api.get(`/blog-comments/blog/${blogPostId}`);
      const activeComments = res.data.$values
        ? res.data.$values
            .filter((comment) => comment.status === "Active")
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setComments(activeComments);
      setCommentsError(null);
    } catch (error) {
      console.error(
        "Lỗi tải bình luận:",
        error.response ? error.response.data : error
      );
      setCommentsError("Không thể tải bình luận. Vui lòng thử lại sau.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleEditSubmit = async (commentId) => {
    if (!editCommentText.trim()) return;

    try {
      await api.put(`/blog-comments/${commentId}`, {
        content: editCommentText.trim(),
        status: "Active",
      });
      setEditingCommentId(null);
      setEditCommentText("");
      // Gọi lại API để lấy danh sách comments mới nhất
      await fetchComments();
    } catch (error) {
      console.error("Lỗi cập nhật bình luận:", error);
      alert("Không thể cập nhật bình luận. Vui lòng thử lại sau.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      await api.delete(`/blog-comments/${commentId}`);
      // Gọi lại API để lấy danh sách comments mới nhất
      await fetchComments();
    } catch (error) {
      console.error("Lỗi xóa bình luận:", error);
      alert("Không thể xóa bình luận. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <Container
          maxWidth={false}
          sx={{ maxWidth: 900, pt: 6, pb: 6, mt: { xs: 8, md: 10 } }}
        >
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ mb: 2, borderRadius: 1 }}
          />
          <Skeleton variant="text" height={30} width="60%" sx={{ mb: 2 }} />
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ mb: 4, borderRadius: 2 }}
          />
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
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <Container
          maxWidth={false}
          sx={{ maxWidth: 900, pt: 6, pb: 6, mt: { xs: 8, md: 10 } }}
        >
          <Paper
            elevation={3}
            sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/blog")}
              sx={{ mt: 2, borderRadius: "50px" }}
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f8fafc",
      }}
    >
      <Header />

      {/* Hero section with image */}
      {blog.imageUrl && (
        <Box
          sx={{
            position: "relative",
            height: { xs: "200px", md: "350px" },
            width: "100%",
            mt: { xs: 8, md: 10 },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)",
              zIndex: 1,
            },
          }}
        >
          <Box
            component="img"
            src={blog.imageUrl}
            alt={blog.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />

          <Container
            maxWidth={false}
            sx={{
              maxWidth: 900,
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              pb: 4,
            }}
          >
            <Fade in={true} timeout={1000}>
              <Typography
                variant="h3"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
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
            sx={{ display: "flex", alignItems: "center" }}
            onClick={() => navigate("/home")}
            style={{ cursor: "pointer" }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Trang chủ
          </Link>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate("/blog")}
            style={{ cursor: "pointer" }}
          >
            Blog
          </Link>
          <Typography
            color="text.primary"
            sx={{
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {blog.title}
          </Typography>
        </Breadcrumbs>

        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              bgcolor: "white",
            }}
          >
            {/* Show title only if no hero image */}
            {!blog.imageUrl && (
              <Typography
                variant="h3"
                gutterBottom
                sx={{ fontWeight: 700, mb: 3 }}
              >
                {blog.title}
              </Typography>
            )}

            {/* Author and date info */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 3,
                mb: 4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{ bgcolor: "#1976d2", width: 32, height: 32, mr: 1 }}
                >
                  <Person />
                </Avatar>
                <Typography variant="body2">
                  {blog.accountName || "Y tá trường"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday
                  sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(blog.publishDate)}
                  {formatTime(blog.publishDate) &&
                    ` - ${formatTime(blog.publishDate)}`}
                </Typography>
              </Box>

              <Chip
                label="Y tế học đường"
                size="small"
                color="primary"
                sx={{ fontWeight: 500, borderRadius: "50px" }}
              />
            </Box>

            {/* Main image (if no hero) */}
            {!blog.imageUrl && blog.imageUrl && (
              <Box sx={{ mb: 4, borderRadius: 3, overflow: "hidden" }}>
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  style={{
                    display: "block",
                    width: "100%",
                    maxHeight: "500px",
                    objectFit: "contain",
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
                  fontSize: "1.1rem",
                  lineHeight: 1.7,
                  color: "#333",
                }}
              />
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Comments Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Bình luận ({comments.length})
              </Typography>

              {commentsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {commentsError}
                </Alert>
              )}

              {/* Comment Form */}
              {currentUser ? (
                <Box
                  component="form"
                  onSubmit={handleCommentSubmit}
                  sx={{ mb: 4, display: "flex", gap: 1 }}
                >
                  <TextField
                    fullWidth
                    placeholder="Viết bình luận của bạn..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "50px" },
                    }}
                  />
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!newComment.trim()}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      "&.Mui-disabled": {
                        bgcolor: "action.disabledBackground",
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 4 }}>
                  Vui lòng đăng nhập để bình luận.
                </Alert>
              )}

              {/* Comments List */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {commentsLoading ? (
                  <CircularProgress sx={{ alignSelf: "center" }} />
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <Paper
                      key={comment.commentID}
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "#f8f9fa",
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "primary.main",
                            }}
                          >
                            {comment.accountName?.[0]?.toUpperCase() || "U"}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {comment.accountName || "Người dùng"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(comment.createdAt)}{" "}
                              {formatTime(comment.createdAt)}
                            </Typography>
                          </Box>
                        </Box>

                        {currentUser &&
                          currentUser.userID === comment.accountID && (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(comment)}
                                sx={{ color: "primary.main" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDeleteComment(comment.commentID)
                                }
                                sx={{ color: "error.main" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                      </Box>

                      {editingCommentId === comment.commentID ? (
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          <TextField
                            fullWidth
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            size="small"
                            autoFocus
                          />
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleEditSubmit(comment.commentID)}
                            disabled={!editCommentText.trim()}
                          >
                            Lưu
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditCommentText("");
                            }}
                          >
                            Hủy
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2">
                          {comment.content}
                        </Typography>
                      )}
                    </Paper>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center" }}
                  >
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Navigation */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/blog")}
                sx={{
                  borderRadius: "50px",
                  px: 3,
                  "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
                }}
              >
                Quay lại danh sách
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/home")}
                sx={{
                  borderRadius: "50px",
                  px: 3,
                  boxShadow: "0 4px 8px rgba(25,118,210,0.25)",
                  "&:hover": { boxShadow: "0 6px 12px rgba(25,118,210,0.35)" },
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
