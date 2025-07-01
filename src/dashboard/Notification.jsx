import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Popconfirm, message } from 'antd';
import api from '../config/axios';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Notifications');
      let data = res.data.$values || res.data;
      // Lọc bỏ MEDICAL_REQUEST và sắp xếp theo ngày mới nhất
      data = data.filter(n => n.notificationType !== 'MEDICAL_REQUEST');
      data = data.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/Notifications/${id}`);
      message.success('Xóa thông báo thành công!');
      fetchNotifications();
    } catch {
      message.error('Xóa thông báo thất bại!');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'notificationID', key: 'notificationID' },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Nội dung', dataIndex: 'content', key: 'content' },
    { title: 'Ngày gửi', dataIndex: 'sentDate', key: 'sentDate',
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '-' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status) => <Tag color={status === 'created' ? 'orange' : status === 'sent' ? 'green' : 'blue'}>{status}</Tag> },
    { title: 'Loại', dataIndex: 'notificationType', key: 'notificationType' },
    {
      title: 'Xóa thông báo',
      key: 'action',
      render: (_, record) =>
        record.status !== 'sent' ? (
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thông báo này?"
            onConfirm={() => handleDelete(record.notificationID)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách thông báo</h2>
      <Table
        columns={columns}
        dataSource={notifications}
        rowKey="notificationID"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
        scroll={{ x: true }}
      />
    </div>
  );
}

export default Notification;