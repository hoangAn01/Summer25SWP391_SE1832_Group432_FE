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
} from "antd";
import api from "../../../config/axios";

import '../../../components/Blog/BlogContent.css';


const ManagerBlog = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending"); // "pending" hoặc "published"
  const [detailModal, setDetailModal] = useState({ open: false, record: null });

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
      // Lọc theo status
      const filtered = blogs.filter((blog) => {
        if (filter === "pending") return blog.status === "Pending";
        if (filter === "published") return blog.status === "Đã xuất bản" || blog.status === "Published";
        return true;
      });
      setData(filtered);
    } catch {
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

  const handleReject = async (blogID) => {
    try {
      await api.delete(`/Blog/${blogID}`);
      message.success("Từ chối (xóa) blog thành công!");
      fetchData();
    } catch {
      message.error("Từ chối (xóa) blog thất bại!");
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

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url) => (
        <Image
          src={url}
          alt="blog"
          width={80}
          height={50}
          style={{ objectFit: "cover", borderRadius: 6 }}
        />
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "accountName",
      key: "accountName",
      render: (name) => name || "Không xác định",
    },
    {
      title: "Ngày tạo",
      dataIndex: "publishDate",
      key: "publishDate",
      render: (date) => date ? new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) : "Không có",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "Đã xuất bản" || status === "Published" ? (
          <Tag color="green">Đã duyệt</Tag>
        ) : (
          <Tag color="orange">Chờ duyệt</Tag>
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
                title="Bạn chắc chắn muốn duyệt blog này?"
                onConfirm={() => handleApprove(record)}
                okText="Duyệt"
                cancelText="Hủy"
              >
                <Button type="primary" size="small">
                  Duyệt
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Bạn chắc chắn muốn từ chối blog này?"
                onConfirm={() => handleReject(record.blogPostID || record.blogID)}
                okText="Từ chối"
                cancelText="Hủy"
              >
                <Button danger size="small">
                  Từ chối
                </Button>
              </Popconfirm>
            </>
          )}
          {filter === "published" && (
            <Popconfirm
              title="Bạn chắc chắn muốn xóa blog này?"
              onConfirm={() => handleReject(record.blogPostID || record.blogID)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger size="small">
                Xóa
              </Button>
            </Popconfirm>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => setDetailModal({ open: true, record })}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý Blog chờ duyệt</h2>
      <div style={{ marginBottom: 16 }}>
        <Button
          type={filter === "pending" ? "primary" : "default"}
          onClick={() => setFilter("pending")}
          style={{ marginRight: 8 }}
        >
          Chưa duyệt
        </Button>
        <Button
          type={filter === "published" ? "primary" : "default"}
          onClick={() => setFilter("published")}
        >
          Đã duyệt
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="blogID"
        loading={loading}
        pagination={{ pageSize: 8 }}
        bordered
      />
      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={null}
        width={900}
        bodyStyle={{ padding: 32, borderRadius: 16 }}
      >
        {detailModal.record && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 16 }}>{detailModal.record.title}</h2>
            {detailModal.record.imageUrl && (
              <img
                src={detailModal.record.imageUrl}
                alt="Ảnh minh họa"
                style={{ display: 'block', margin: '0 auto 24px auto', borderRadius: 8, maxWidth: 400, width: '100%', height: 'auto' }}
              />
            )}
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: renderBlogContent(detailModal.record.content) }} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerBlog;
