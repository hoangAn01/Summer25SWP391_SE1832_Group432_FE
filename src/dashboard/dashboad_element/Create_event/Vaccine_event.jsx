import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Typography,
  Form,
  Input,
  Button,
  DatePicker,
  Row,
  Col,
  message,
  Select,
} from "antd";
import api from "../../../config/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function Vaccine_event() {
  const [events, setEvents] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = useSelector((state) => state.user);

  // Lấy danh sách sự kiện từ API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/Notifications");

      // Xử lý response với cấu trúc mới có $values
      const notificationsData = response.data.$values || [];

      // Lọc ra các sự kiện tiêm chủng
      const vaccineEvents = notificationsData
        .filter(
          (event) =>
            event.title.toLowerCase().includes("tiêm") ||
            event.title.toLowerCase().includes("vaccine")
        )
        .map((event) => ({
          id: event.notificationID,
          content: event.content,
          date: event.sentDate,
          title: event.title,
          status: event.status,
        }));

      setEvents(vaccineEvents);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự kiện:", error);
      message.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      // Lấy managerID từ user đăng nhập (hoặc localStorage)
      const managerID = user?.userID || localStorage.getItem("userID");
      const newEvent = {
        eventName: values.eventName,
        date: values.date.toISOString(),
        location: values.location,
        classID: values.classID,
        managerID: managerID ? Number(managerID) : 0,
      };
      console.log("Creating vaccination event:", newEvent);
      await api.post("/VaccinationEvent", newEvent);
      toast.success("Tạo sự kiện tiêm chủng thành công!");
      fetchEvents();
      form.resetFields();
    } catch (error) {
      console.error("Lỗi khi tạo sự kiện:", error);
      message.error(
        error.response?.data?.message ||
          "Không thể tạo sự kiện. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row gutter={32} style={{ marginTop: 32 }}>
      <Col xs={24} md={8}>
        <Card title="Lịch sử sự kiện tiêm chủng" bordered={false}>
          <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={events}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={<Typography.Text strong>{item.title}</Typography.Text>}
                  description={
                    <>
                      <span>Nội dung: {item.content}</span>
                      <br />
                      <span>Thời gian: {new Date(item.date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </>
                  }
                />
              </List.Item>
            )}
            locale={{
              emptyText: "Không có sự kiện tiêm chủng nào",
            }}
          />
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card
          title="Tạo sự kiện tiêm chủng mới"
          bordered={false}
          style={{ minWidth: 400, maxWidth: 700, margin: "0 auto" }}
        >
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Tên sự kiện tiêm chủng"
              name="eventName"
              rules={[{ required: true, message: "Vui lòng nhập tên sự kiện" }]}
            >
              <Input placeholder="Nhập tên sự kiện tiêm chủng" />
            </Form.Item>
            <Form.Item
              label="Địa điểm tổ chức"
              name="location"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input placeholder="Nhập địa điểm tổ chức" />
            </Form.Item>
            <Form.Item
              label="Chọn khối lớp"
              name="classID"
              rules={[{ required: true, message: "Vui lòng chọn khối lớp" }]}
            >
              <Select placeholder="Chọn khối lớp">
                <Select.Option value={1}>Khối 1</Select.Option>
                <Select.Option value={2}>Khối 2</Select.Option>
                <Select.Option value={3}>Khối 3</Select.Option>
                <Select.Option value={4}>Khối 4</Select.Option>
                <Select.Option value={5}>Khối 5</Select.Option>
                <Select.Option value={0}>Toàn bộ học sinh</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Thời gian tổ chức"
              name="date"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
              >
                {submitting ? "Đang tạo..." : "Tạo sự kiện"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export default Vaccine_event;
