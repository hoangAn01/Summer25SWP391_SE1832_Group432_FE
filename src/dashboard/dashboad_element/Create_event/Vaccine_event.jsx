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

function Vaccine_event() {
  const [events, setEvents] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

      // Chuẩn bị dữ liệu để gửi lên API
      const newEvent = {
        title: `Sự kiện tiêm chủng ${
          values.grade === "all" ? "toàn trường" : `khối ${values.grade}`
        }`,
        content: values.content,
        sentDate: values.date.format("YYYY-MM-DDTHH:mm:ss"),
        status: "Published",
      };

      console.log("Creating vaccine event:", newEvent);

      // Gửi sự kiện lên API
      await api.post("/Notifications", newEvent);

      // Cập nhật danh sách sự kiện
      message.success("Tạo sự kiện tiêm chủng thành công!");

      // Làm mới danh sách sự kiện
      fetchEvents();

      // Đặt lại form
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
                      <span>Thời gian: {item.date}</span>
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
              label="Chọn khối lớp"
              name="grade"
              rules={[{ required: true, message: "Vui lòng chọn khối lớp" }]}
            >
              <Select placeholder="Chọn khối lớp">
                <Select.Option value="all">Toàn bộ học sinh</Select.Option>
                <Select.Option value="1">Khối 1</Select.Option>
                <Select.Option value="2">Khối 2</Select.Option>
                <Select.Option value="3">Khối 3</Select.Option>
                <Select.Option value="4">Khối 4</Select.Option>
                <Select.Option value="5">Khối 5</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Nội dung sự kiện tiêm"
              name="content"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung sự kiện" },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Nhập nội dung sự kiện tiêm chủng..."
              />
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
