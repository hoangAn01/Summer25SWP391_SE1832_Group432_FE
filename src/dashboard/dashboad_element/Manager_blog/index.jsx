import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Image, message, Space, Popconfirm, Modal } from "antd";
import api from "../../../config/axios";

const ManagerBlog = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending"); // "pending" hoặc "published"
  const [detailModal, setDetailModal] = useState({ open: false, record: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (filter === "pending") {
        res = await api.get("/Blog/pending");
      } else {
        res = await api.get("/Blog"); // hoặc /Blog/published nếu backend có
      }
      const blogs = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data.$values)
        ? res.data.$values
        : [];
      setData(blogs);
    } catch {
      message.error("Không thể tải danh sách blog!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleApprove = async (blogID) => {
    try {
      await api.patch(`/Blog/publish/${blogID}`, true, {
        headers: { 'Content-Type': 'application/json' }
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
      render: (url) => <Image src={url} alt="blog" width={80} height={50} style={{ objectFit: 'cover', borderRadius: 6 }} />,
    },
    {
      title: "Tác giả",
      dataIndex: "authorFullName",
      key: "authorFullName",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedDate",
      key: "updatedDate",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (published) => published ? <Tag color="green">Đã duyệt</Tag> : <Tag color="orange">Chờ duyệt</Tag>,
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
                onConfirm={() => handleApprove(record.blogID)}
                okText="Duyệt"
                cancelText="Hủy"
              >
                <Button type="primary" size="small">Duyệt</Button>
              </Popconfirm>
              <Popconfirm
                title="Bạn chắc chắn muốn từ chối blog này?"
                onConfirm={() => handleReject(record.blogID)}
                okText="Từ chối"
                cancelText="Hủy"
              >
                <Button danger size="small">Từ chối</Button>
              </Popconfirm>
            </>
          )}
          {filter === "published" && (
            <Popconfirm
              title="Bạn chắc chắn muốn xóa blog này?"
              onConfirm={() => handleReject(record.blogID)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger size="small">Xóa</Button>
            </Popconfirm>
          )}
          <Button type="link" size="small" onClick={() => setDetailModal({ open: true, record })}>
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
        title={detailModal.record?.title}
        footer={null}
        onCancel={() => setDetailModal({ open: false, record: null })}
        width={600}
      >
        {detailModal.record && (
          <div>
            <img
              src={detailModal.record.imageUrl}
              alt="Ảnh blog"
              style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
            />
            <div style={{ whiteSpace: "pre-line", marginBottom: 16 }}>
              {detailModal.record.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerBlog;