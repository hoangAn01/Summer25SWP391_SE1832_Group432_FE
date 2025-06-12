import React, { useState } from "react";
import { Card, List, Typography, Form, Input, Button, DatePicker, Row, Col, message } from "antd";

const mockEvents = [
  {
    id: 1,
    content: "Tiêm chủng vaccine sởi cho học sinh lớp 1",
    date: "2024-06-20 08:00",
  },
  {
    id: 2,
    content: "Tiêm chủng vaccine cúm mùa cho toàn trường",
    date: "2024-05-15 09:00",
  },
];

function Vaccine_event() {
  const [events, setEvents] = useState(mockEvents);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const newEvent = {
      id: events.length + 1,
      content: values.content,
      date: values.date.format("YYYY-MM-DD HH:mm"),
    };
    setEvents([newEvent, ...events]);
    form.resetFields();
    message.success("Tạo sự kiện thành công!");
  };

  return (
    <Row gutter={32} style={{ marginTop: 32 }}>
      <Col xs={24} md={8}>
        <Card title="Lịch sử sự kiện tiêm chủng" bordered={false}>
          <List
            itemLayout="horizontal"
            dataSource={events}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={<Typography.Text strong>{item.content}</Typography.Text>}
                  description={<span>Thời gian: {item.date}</span>}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card title="Tạo sự kiện tiêm chủng mới" bordered={false} style={{ minWidth: 400, maxWidth: 700, margin: '0 auto' }}>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Nội dung sự kiện tiêm"
              name="content"
              rules={[{ required: true, message: "Vui lòng nhập nội dung sự kiện" }]}
            >
              <Input.TextArea rows={3} placeholder="Nhập nội dung sự kiện tiêm chủng..." />
            </Form.Item>
            <Form.Item
              label="Thời gian tổ chức"
              name="date"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Tạo sự kiện
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export default Vaccine_event;
