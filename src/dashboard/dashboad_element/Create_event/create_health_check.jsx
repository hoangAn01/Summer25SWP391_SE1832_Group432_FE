import React, { useState } from "react";
import { Card, List, Typography, Form, Input, Button, DatePicker, Row, Col, message, Select, Checkbox } from "antd";

const mockEvents = [
  {
    id: 1,
    content: "Khám sức khỏe định kỳ cho học sinh khối 1",
    date: "2024-06-20 08:00",
    grade: "1",
    type: "Khám sức khỏe",
    healthChecks: ["Chiều cao", "Cân nặng", "Thị lực"]
  },
  {
    id: 2,
    content: "Kiểm tra răng miệng toàn trường",
    date: "2024-05-15 09:00",
    grade: "all",
    type: "Khám răng",
    healthChecks: ["Vệ sinh răng miệng"]
  },
];

function Health_check() {
  const [events, setEvents] = useState(mockEvents);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const newEvent = {
      id: events.length + 1,
      content: values.content,
      date: values.date.format("YYYY-MM-DD HH:mm"),
      grade: values.grade,
      type: values.type,
      healthChecks: values.healthChecks || []
    };
    setEvents([newEvent, ...events]);
    form.resetFields();
    message.success("Tạo sự kiện y tế thành công!");
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
            itemLayout="horizontal"
            dataSource={events}
            renderItem={item => (
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
              <Button type="primary" htmlType="submit" block>
                Tạo sự kiện y tế
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export default Health_check;
