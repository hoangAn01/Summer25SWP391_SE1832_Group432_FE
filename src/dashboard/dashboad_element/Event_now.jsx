import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { Table, Tag, Typography, message, Select } from "antd";

const { Paragraph } = Typography;

const EventNow = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách sự kiện khi mở trang
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get("/Event");
        setEvents(res.data.$values || []);
      } catch {
        message.error("Không lấy được danh sách sự kiện");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch danh sách học sinh đồng thuận khi chọn event
  useEffect(() => {
    if (!selectedEvent) {
      setData([]);
      return;
    }
    const fetchAcceptedStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/StudentJoinEvent/${selectedEvent}/Accepted-students`
        );
        setData(res.data.$values || res.data || []);
      } catch {
        message.error("Không lấy được danh sách học sinh đồng thuận");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAcceptedStudents();
  }, [selectedEvent]);

  const columns = [
    { title: "Học sinh", dataIndex: "studentName", key: "studentName" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Ngày phản hồi",
      dataIndex: "responseDate",
      key: "responseDate",
      render: (date) =>
        date ? new Date(date).toLocaleString("vi-VN") : <i>Chưa phản hồi</i>,
    },
    { title: "Ghi chú", dataIndex: "note", key: "note" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Danh sách đồng thuận tiêm chủng</h2>
      <Select
        style={{ width: 300, marginBottom: 24 }}
        placeholder="Chọn sự kiện tiêm chủng"
        value={selectedEvent}
        onChange={setSelectedEvent}
        allowClear
      >
        {events
          .filter((e) => e.eventTypeID === 2) // chỉ lấy sự kiện tiêm chủng
          .map((event) => (
            <Select.Option key={event.eventID} value={event.eventID}>
              {event.eventName}
            </Select.Option>
          ))}
      </Select>
      <Table
        dataSource={data.map((item) => ({
          ...item,
          key: item.studentJoinEventID,
        }))}
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
