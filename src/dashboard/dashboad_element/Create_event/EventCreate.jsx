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

function EventCreate() {
  const [events, setEvents] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);

  // Lấy danh sách loại sự kiện
  const fetchEventTypes = async () => {
    try {
      const res = await api.get("EventType");
      setEventTypes(res.data.$values || res.data);
    } catch (err) {
      message.error("Không thể tải loại sự kiện");
    }
  };

  // Lấy danh sách sự kiện đã tạo (có thể lọc theo loại nếu muốn)
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("Event");
      setEvents(response.data.$values || response.data);
    } catch (error) {
      message.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
    fetchEvents();
  }, []);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const newEvent = {
        eventTypeID: values.eventTypeID,
        eventName: values.eventName,
        eventDate: values.eventDate.toISOString(),
        description: values.description,
        targetClass: Array.isArray(values.targetClass)
          ? values.targetClass.join(",")
          : values.targetClass,
      };
      await api.post("Event", newEvent);
      toast.success("Tạo sự kiện thành công!");
      fetchEvents();
      form.resetFields();
    } catch (error) {
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
        <Card title="Lịch sử sự kiện" bordered={false}>
          <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={events}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Typography.Text strong>{item.eventName}</Typography.Text>
                  }
                  description={
                    <>
                      <span>
                        Loại: {item.eventType?.typeName || item.eventTypeID}
                      </span>
                      <br />
                      <span>Mô tả: {item.description}</span>
                      <br />
                      <span>
                        Thời gian:{" "}
                        {new Date(item.eventDate).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <br />
                      <span>Khối áp dụng: {item.targetClass}</span>
                    </>
                  }
                />
              </List.Item>
            )}
            locale={{
              emptyText: "Không có sự kiện nào",
            }}
          />
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card
          title="Tạo sự kiện mới"
          bordered={false}
          style={{ minWidth: 400, maxWidth: 700, margin: "0 auto" }}
        >
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Loại sự kiện"
              name="eventTypeID"
              rules={[
                { required: true, message: "Vui lòng chọn loại sự kiện" },
              ]}
            >
              <Select placeholder="Chọn loại sự kiện">
                {eventTypes.map((type) => (
                  <Select.Option
                    key={type.eventTypeID}
                    value={type.eventTypeID}
                  >
                    {type.typeName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Tên sự kiện"
              name="eventName"
              rules={[{ required: true, message: "Vui lòng nhập tên sự kiện" }]}
            >
              <Input placeholder="Nhập tên sự kiện" />
            </Form.Item>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Input.TextArea placeholder="Nhập mô tả sự kiện" />
            </Form.Item>
            <Form.Item
              label="Khối áp dụng"
              name="targetClass"
              rules={[
                { required: true, message: "Vui lòng chọn khối áp dụng" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn khối áp dụng"
                options={[
                  { label: "Khối 1", value: "1" },
                  { label: "Khối 2", value: "2" },
                  { label: "Khối 3", value: "3" },
                  { label: "Khối 4", value: "4" },
                  { label: "Khối 5", value: "5" },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="Thời gian tổ chức"
              name="eventDate"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current < new Date().setHours(0, 0, 0, 0)
                }
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

export default EventCreate;
