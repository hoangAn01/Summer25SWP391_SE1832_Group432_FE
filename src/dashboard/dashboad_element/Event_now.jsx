import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { Table, Tag, Typography, message } from "antd";

const { Paragraph } = Typography;

const EventNow = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDataParenConsent = async () => {
    try {
      setLoading(true);
      const response = await api.get("/ParentalConsents");

      // Xử lý response với cấu trúc mới có $values
      const consentData = response.data.$values || [];
      console.log("Parental consents data:", consentData);
      setData(consentData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đồng thuận:", error);
      message.error("Không thể tải danh sách đồng thuận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataParenConsent();
  }, []);

  const columns = [
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Phụ huynh",
      dataIndex: "parentName",
      key: "parentName",
    },
    {
      title: "Trạng thái",
      dataIndex: "consentStatus",
      key: "consentStatus",
      render: (status) => {
        let color = "default";
        if (status === "Đã đồng ý") color = "green";
        else if (status === "Từ chối") color = "red";
        else if (status === "Chờ phản hồi") color = "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ngày phản hồi",
      dataIndex: "consentDate",
      key: "consentDate",
      render: (date) =>
        date ? new Date(date).toLocaleString("vi-VN") : <i>Chưa phản hồi</i>,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => (
        <Paragraph ellipsis={{ rows: 2 }}>{note || <i>Không</i>}</Paragraph>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Danh sách đồng thuận tiêm chủng</h2>
      <Table
        dataSource={data.map((item) => ({ ...item, key: item.consentID }))}
        columns={columns}
        bordered
        loading={loading}
        pagination={false}
        locale={{
          emptyText: "Không có dữ liệu đồng thuận",
        }}
      />
    </div>
  );
};

export default EventNow;
