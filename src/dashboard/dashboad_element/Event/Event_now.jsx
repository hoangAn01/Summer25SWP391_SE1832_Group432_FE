import React, { useEffect, useState } from "react";
import api from "../../../config/axios";
import { Table, Tag, Typography, message, Select } from "antd";
import dayjs from "dayjs";

const { Paragraph } = Typography;

const EVENT_TYPES = [
  { label: "Tiêm vaccine", value: 2 },
  { label: "Khám sức khỏe", value: 1 },
];

// Mapping status values to Vietnamese
const STATUS_MAPPING = {
  "Pending": "Chờ phản hồi",
  "Accepted": "Đã đồng ý",
  "Rejected": "Từ chối",
  "Completed": "Hoàn thành",
  "Cancelled": "Đã hủy"
};

// Status color mapping
const STATUS_COLORS = {
  "Pending": "orange",
  "Accepted": "green",
  "Rejected": "red",
  "Completed": "blue",
  "Cancelled": "gray"
};

const EventNow = () => {
  const [events, setEvents] = useState([]);
  const [eventType, setEventType] = useState(null); // loại sự kiện
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách sự kiện khi mở trang
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get("/Event");
        const allEvents = res.data.$values || [];
        
        // Lọc các sự kiện đang diễn ra (ngày sự kiện là hôm nay hoặc trong tương lai)
        const now = dayjs();
        const activeEvents = allEvents.filter(event => {
          const eventDate = dayjs(event.eventDate);
          return eventDate.isAfter(now.subtract(1, 'day'));
        });
        
        setEvents(activeEvents);
      } catch {
        message.error("Không lấy được danh sách sự kiện");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Reset selectedEvent khi đổi loại sự kiện
  useEffect(() => {
    setSelectedEvent(null);
    setData([]);
  }, [eventType]);

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
          `/StudentJoinEvent/${selectedEvent}/student-join-events`
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
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      key: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {STATUS_MAPPING[status] || status}
        </Tag>
      )
    },
    {
      title: "Ngày phản hồi",
      dataIndex: "responseDate",
      key: "responseDate",
      render: (date) =>
        date ? new Date(date).toLocaleString("vi-VN") : <i>Chưa phản hồi</i>,
    },
    { title: "Ghi chú", dataIndex: "note", key: "note" },
  ];

  // Lọc sự kiện theo loại đã chọn
  const filteredEvents = eventType
    ? events.filter((e) => e.eventTypeID === eventType)
    : [];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Danh sách sự kiện đang diễn ra</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Chọn loại sự kiện"
          value={eventType}
          onChange={setEventType}
          allowClear
        >
          {EVENT_TYPES.map((type) => (
            <Select.Option key={type.value} value={type.value}>
              {type.label}
            </Select.Option>
          ))}
        </Select>
        <Select
          style={{ width: 300 }}
          placeholder="Chọn sự kiện cụ thể"
          value={selectedEvent}
          onChange={setSelectedEvent}
          allowClear
          disabled={!eventType}
        >
          {filteredEvents.map((event) => (
            <Select.Option key={event.eventID} value={event.eventID}>
              {event.eventName} ({dayjs(event.eventDate).format("DD/MM/YYYY")})
            </Select.Option>
          ))}
        </Select>
      </div>
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
