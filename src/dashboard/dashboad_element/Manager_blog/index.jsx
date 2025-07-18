import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Image,
  message,
  Space,
  Popconfirm,
  Modal,
  Card,
  Typography,
  Divider,
  Spin,
  Row,
  Col,
  Tabs,
  Badge,
  Empty,
  Avatar,
  Tooltip
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import api from "../../../config/axios";

import '../../../components/Blog/BlogContent.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ManagerBlog = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending"); // "pending" hoặc "published"
  const [detailModal, setDetailModal] = useState({ open: false, record: null });
  const [stats, setStats] = useState({
    pending: 0,
    published: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/Blog");
      const blogs = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data.$values)
        ? res.data.$values
        : [];
      
      // Tính toán số lượng blog theo trạng thái
      const pendingCount = blogs.filter(blog => blog.status === "Pending").length;
      const publishedCount = blogs.filter(blog => blog.status === "Đã xuất bản" || blog.status === "Published").length;
      
      setStats({
        pending: pendingCount,
        published: publishedCount
      });
      
      // Lọc theo status
      const filtered = blogs.filter((blog) => {
        if (filter === "pending") return blog.status === "Pending";
        if (filter === "published") return blog.status === "Đã xuất bản" || blog.status === "Published";
        return true;
      });

      // Sắp xếp blog theo thời gian mới nhất (publishDate)
      const sortedBlogs = [...filtered].sort((a, b) => {
        const dateA = a.publishDate ? new Date(a.publishDate) : new Date(0);
        const dateB = b.publishDate ? new Date(b.publishDate) : new Date(0);
        return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
      });
      
      setData(sortedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      message.error("Không thể tải danh sách blog!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  // Sửa duyệt: PUT đổi status
  const handleApprove = async (blog) => {
    try {
      const updatedBlog = {
        ...blog,
        blogPostId: blog.blogPostId, // Đảm bảo đúng id
        status: "Đã xuất bản",
      };
      await api.put(`/Blog/${blog.blogPostId}`, updatedBlog, {
        headers: { "Content-Type": "application/json" },
      });
      message.success("Duyệt blog thành công!");
      fetchData();
    } catch {
      message.error("Duyệt blog thất bại!");
    }
  };

  const handleReject = async (record) => {
    try {
      // Kiểm tra và lấy ID đúng từ record
      const blogID = record.blogPostId || record.blogPostID || record.blogID || record.id;
      
      if (!blogID) {
        console.error("Không tìm thấy ID blog:", record);
        message.error("Không thể xóa blog: Không tìm thấy ID");
        return;
      }
      
      console.log("Đang xóa blog với ID:", blogID);
      await api.delete(`/Blog/${blogID}`);
      message.success("Từ chối (xóa) blog thành công!");
      fetchData();
    } catch (error) {
      console.error("Lỗi khi xóa blog:", error);
      message.error(`Từ chối (xóa) blog thất bại: ${error.message || "Lỗi không xác định"}`);
    }
  };

  const renderBlogContent = (content) => {
    // Tạo một div để parse HTML an toàn
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Kiểm tra và xử lý các thẻ img
    const images = tempDiv.getElementsByTagName('img');
    for (let img of images) {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '8px';
      img.style.marginBottom = '16px';
    }

    return tempDiv.innerHTML;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <Text strong ellipsis={{ tooltip: text }} style={{ maxWidth: 250 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url) => (
        <Image
          src={url || "https://placehold.co/80x50/e0e0e0/7d7d7d?text=No+Image"}
          alt="blog"
          width={80}
          height={50}
          style={{ objectFit: "cover", borderRadius: 8 }}
          fallback="https://placehold.co/80x50/e0e0e0/7d7d7d?text=Error"
        />
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "accountName",
      key: "accountName",
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            icon={<UserOutlined />} 
            size="small" 
            style={{ marginRight: 8, backgroundColor: '#1890ff' }} 
          />
          <Text>{name || "Không xác định"}</Text>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "publishDate",
      key: "publishDate",
      sorter: (a, b) => {
        const dateA = a.publishDate ? new Date(a.publishDate) : new Date(0);
        const dateB = b.publishDate ? new Date(b.publishDate) : new Date(0);
        return dateA - dateB;
      },
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'descend',
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <Text>{formatDate(date)}</Text>
        </div>
      ),
    },
    
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          {filter === "pending" && (
            <>
              <Popconfirm
                title="Duyệt bài viết"
                description="Bạn chắc chắn muốn duyệt blog này?"
                onConfirm={() => handleApprove(record)}
                okText="Duyệt"
                cancelText="Hủy"
                icon={<CheckCircleOutlined style={{ color: 'green' }} />}
              >
                <Button 
                  type="primary" 
                  size="middle" 
                  icon={<CheckCircleOutlined />}
                  style={{ borderRadius: '6px' }}
                >
                  Duyệt
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Từ chối bài viết"
                description="Bạn chắc chắn muốn từ chối blog này?"
                onConfirm={() => handleReject(record)}
                okText="Từ chối"
                cancelText="Hủy"
                icon={<CloseCircleOutlined style={{ color: 'red' }} />}
              >
                <Button 
                  danger 
                  size="middle" 
                  icon={<CloseCircleOutlined />}
                  style={{ borderRadius: '6px' }}
                >
                  Từ chối
                </Button>
              </Popconfirm>
            </>
          )}
          {filter === "published" && (
            <Popconfirm
              title="Xóa bài viết"
              description="Bạn chắc chắn muốn xóa blog này?"
              onConfirm={() => handleReject(record)}
              okText="Xóa"
              cancelText="Hủy"
              icon={<DeleteOutlined style={{ color: 'red' }} />}
            >
              <Button 
                danger 
                size="middle" 
                icon={<DeleteOutlined />}
                style={{ borderRadius: '6px' }}
              >
                Xóa
              </Button>
            </Popconfirm>
          )}
          <Button
            type="default"
            size="middle"
            icon={<EyeOutlined />}
            onClick={() => setDetailModal({ open: true, record })}
            style={{ borderRadius: '6px' }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handleTabChange = (key) => {
    setFilter(key);
  };

  return (
    <div className="blog-manager-container" style={{ padding: "20px" }}>
      <Card 
        className="blog-manager-card"
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        

        <Tabs 
          activeKey={filter}
          onChange={handleTabChange}
          type="card"
          size="large"
          className="blog-manager-tabs"
          items={[
            {
              key: 'pending',
              label: (
                <span>
                  <ClockCircleOutlined style={{ marginRight: '8px' }} />
                  Blog chờ duyệt
                  {stats.pending > 0 && <Badge count={stats.pending} style={{ marginLeft: '8px' }} />}
                </span>
              ),
              children: (
                <div className="blog-table-container">
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                    </div>
                  ) : data.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={data}
                      rowKey={record => record.blogPostID || record.blogID}
                      loading={loading}
                      pagination={{ 
                        pageSize: 6,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng cộng ${total} bài viết` 
                      }}
                      style={{ 
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}
                      onChange={(pagination, filters, sorter) => {
                        console.log('Table change:', sorter);
                      }}
                    />
                  ) : (
                    <Empty 
                      description="Không có bài viết nào đang chờ duyệt" 
                      style={{ padding: '40px 0' }}
                    />
                  )}
                </div>
              )
            },
            {
              key: 'published',
              label: (
                <span>
                  <CheckCircleOutlined style={{ marginRight: '8px' }} />
                  Blog đã xuất bản
                  {stats.published > 0 && <Badge count={stats.published} style={{ marginLeft: '8px' }} />}
                </span>
              ),
              children: (
                <div className="blog-table-container">
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                    </div>
                  ) : data.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={data}
                      rowKey={record => record.blogPostID || record.blogID}
                      loading={loading}
                      pagination={{ 
                        pageSize: 6,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng cộng ${total} bài viết` 
                      }}
                      style={{ 
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}
                      onChange={(pagination, filters, sorter) => {
                        console.log('Table change:', sorter);
                      }}
                    />
                  ) : (
                    <Empty 
                      description="Không có bài viết nào đã xuất bản" 
                      style={{ padding: '40px 0' }}
                    />
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={[
          <Button 
            key="close" 
            onClick={() => setDetailModal({ open: false, record: null })}
            size="large"
            style={{ borderRadius: '6px' }}
          >
            Đóng
          </Button>
        ]}
        width={900}
        style={{ top: 20 }}
        bodyStyle={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}
        className="blog-detail-modal"
      >
        {detailModal.record && (
          <div>
            <div className="blog-header" style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '24px 32px',
              borderBottom: '1px solid #e8e8e8'
            }}>
              <Title level={2} style={{ margin: 0, color: '#262626' }}>
                {detailModal.record.title}
              </Title>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginTop: '16px',
                color: '#8c8c8c'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '24px' }}>
                  <UserOutlined style={{ marginRight: '8px' }} />
                  <Text type="secondary">{detailModal.record.accountName || "Không xác định"}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarOutlined style={{ marginRight: '8px' }} />
                  <Text type="secondary">{formatDate(detailModal.record.publishDate)}</Text>
                </div>
              </div>
            </div>
            
            <div className="blog-body" style={{ padding: '32px' }}>
              {detailModal.record.imageUrl && (
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <Image
                    src={detailModal.record.imageUrl}
                    alt="Ảnh minh họa"
                    style={{ 
                      borderRadius: 12, 
                      maxWidth: '100%', 
                      maxHeight: '400px',
                      objectFit: 'contain'
                    }}
                    fallback="https://placehold.co/600x400/e0e0e0/7d7d7d?text=Image+Not+Available"
                  />
                </div>
              )}
              
              <div 
                className="blog-content" 
                dangerouslySetInnerHTML={{ __html: renderBlogContent(detailModal.record.content) }}
                style={{ 
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#262626'
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerBlog;
