import React, { useState, useEffect } from "react";
import { Card, List, Typography, Form, Input, Button, DatePicker, Row, Col, message, Select, Checkbox } from "antd";
import api from "../../../config/axios";
import dayjs from "dayjs";

function Health_check() {
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Lấy danh sách thông báo đã tạo và học sinh
  useEffect(() => {
    fetchEvents();
    fetchStudents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Notifications");
      const notis = res.data.$values || res.data;

      const checkupEvents = (notis || [])
        .filter(
          (n) =>
            n.notificationType &&
            n.notificationType.toString().toLowerCase().includes("checkup")
        )
        .map((n) => ({
          id: n.notificationID,
          content: n.content,
          date: n.scheduleDate || n.sentDate,
          grade: "-",
          type: "Khám sức khỏe",
          healthChecks: [],
        }));

      setEvents(checkupEvents);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/Student");
      setStudents(res.data.$values || res.data);
    } catch (err) {
      console.error("Không thể tải danh sách học sinh", err);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      // Chọn học sinh gửi thông báo theo khối
      let selectedStudentIds = [];
      if (values.grade === "all") {
        selectedStudentIds = students.map((s) => s.studentID);
      } else {
        selectedStudentIds = students
          .filter(
            (s) =>
              s.className &&
              s.className.toString().startsWith(values.grade.toString())
          )
          .map((s) => s.studentID);
      }

      const body = {
        title: `Khám sức khỏe ${values.type} - ${
          values.grade === "all" ? "toàn trường" : `khối ${values.grade}`
        }`,
        content: values.content,
        checkupDate: values.date.format("YYYY-MM-DDTHH:mm:ss"),
        notificationDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        responseDeadline: values.date
          .subtract(3, "day")
          .format("YYYY-MM-DDTHH:mm:ss"),
        studentIDs: selectedStudentIds,
        checkupType: values.type,
        location: "Phòng y tế",
        additionalInstructions: (values.healthChecks || []).join(", "),
      };

      await api.post("/ParentNotifications/periodic-checkup", body);

      message.success("Tạo sự kiện y tế thành công!");
      form.resetFields();
      fetchEvents();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data || "Không thể tạo sự kiện");
    } finally {
      setSubmitting(false);
    }
  };

  const healthCheckOptions = [
    { label: 'Chiều cao', value: 'Chiều cao' },
    { label: 'Cân nặng', value: 'Cân nặng' },
    { label: 'Thị lực', value: 'Thị lực' },
    { label: 'Răng miệng', value: 'Răng miệng' },
    { label: 'Tai', value: 'Tai' },
    { label: 'Tim mạch', value: 'Tim mạch' },
    { label: 'Huyết áp', value: 'Huyết áp' }
  ];

  return (
    <Row gutter={32} style={{ marginTop: 32 }}>
      <Col xs={24} md={8}>
        <Card title="Lịch sử sự kiện y tế" bordered={false}>
          <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={events}
            locale={{ emptyText: "Không có sự kiện nào" }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={<Typography.Text strong>{item.content}</Typography.Text>}
                  description={
                    <>
                      <div>Thời gian: {item.date}</div>
                      <div>Khối: {item.grade === 'all' ? 'Toàn bộ học sinh' : `Khối ${item.grade}`}</div>
                      <div>Loại: {item.type}</div>
                      <div>
                        Kiểm tra: 
                        {item.healthChecks && item.healthChecks.length > 0 
                          ? item.healthChecks.join(', ') 
                          : 'Không có'}
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card title="Tạo sự kiện y tế mới" bordered={false} style={{ minWidth: 400, maxWidth: 700, margin: '0 auto' }}>
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
              label="Loại sự kiện y tế"
              name="type"
              rules={[{ required: true, message: "Vui lòng chọn loại sự kiện" }]}
            >
              <Select placeholder="Chọn loại sự kiện y tế">
                <Select.Option value="Khám sức khỏe">Khám sức khỏe</Select.Option>
                <Select.Option value="Kiểm tra răng miệng">Kiểm tra răng miệng</Select.Option>
                <Select.Option value="Tầm soát bệnh">Tầm soát bệnh</Select.Option>
                <Select.Option value="Khác">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Nội dung sự kiện y tế"
              name="content"
              rules={[{ required: true, message: "Vui lòng nhập nội dung sự kiện" }]}
            >
              <Input.TextArea rows={3} placeholder="Nhập nội dung sự kiện y tế..." />
            </Form.Item>

            <Form.Item
              label="Các mục kiểm tra"
              name="healthChecks"
            >
              <Checkbox.Group 
                options={healthCheckOptions}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '8px' 
                }}
              />
            </Form.Item>

            <Form.Item
              label="Thời gian tổ chức"
              name="date"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                {submitting ? "Đang tạo..." : "Tạo sự kiện y tế"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export default Health_check;
