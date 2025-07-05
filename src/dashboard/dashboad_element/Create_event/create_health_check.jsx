import React from "react";
import { Card, Form, Input, Button, DatePicker, Select } from "antd";
import api from "../../../config/axios";
import { toast } from "react-toastify";

function Health_check() {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const body = {
        scheduleName: values.scheduleName,
        scheduleDate: values.scheduleDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        description: values.description || "",
        nurseID: 1, // Cứng nurseID = 1 như yêu cầu
        targetClass: values.targetClass,
      };
      console.log("body", body);
      await api.post("/CheckupSchedules", body);
      toast.success("Tạo lịch khám sức khỏe thành công!");
      form.resetFields();
    } catch (err) {
      toast.error(err.response?.data || "Không thể tạo lịch khám sức khỏe");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
      <Card
        title="Tạo lịch khám sức khỏe mới"
        bordered={false}
        style={{ minWidth: 400, maxWidth: 500 }}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            label="Tên lịch khám sức khỏe"
            name="scheduleName"
            rules={[{ required: true, message: "Vui lòng nhập tên lịch khám" }]}
          >
            <Input placeholder="Nhập tên lịch khám sức khỏe..." />
          </Form.Item>

          <Form.Item
            label="Khối lớp"
            name="targetClass"
            rules={[{ required: true, message: "Vui lòng chọn khối lớp" }]}
          >
            <Select placeholder="Chọn khối lớp">
              <Select.Option value="Khối 1">Khối 1</Select.Option>
              <Select.Option value="Khối 2">Khối 2</Select.Option>
              <Select.Option value="Khối 3">Khối 3</Select.Option>
              <Select.Option value="Khối 4">Khối 4</Select.Option>
              <Select.Option value="Khối 5">Khối 5</Select.Option>
              <Select.Option value="Toàn khối">Toàn khối</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Thời gian tổ chức"
            name="scheduleDate"
            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
          >
            <DatePicker
              placeholder="Chọn thời gian khám"
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                // Không cho chọn ngày trong quá khứ
                return current && current < new Date().setHours(0, 0, 0, 0);
              }}
              disabledTime={(current) => {
                if (!current) return {};
                const now = new Date();

                // Nếu chọn ngày hôm nay
                if (
                  current.year() === now.getFullYear() &&
                  current.month() === now.getMonth() &&
                  current.date() === now.getDate()
                ) {
                  return {
                    // Vô hiệu hóa các giờ đã qua
                    disabledHours: () =>
                      Array.from({ length: 24 }, (_, i) => i).filter(
                        (h) => h <= now.getHours()
                      ),
                    // Vô hiệu hóa các phút đã qua nếu chọn giờ hiện tại
                    disabledMinutes: (selectedHour) => {
                      if (selectedHour === now.getHours()) {
                        return Array.from({ length: 60 }, (_, i) => i).filter(
                          (m) => m <= now.getMinutes()
                        );
                      }
                      return [];
                    },
                  };
                }
                return {};
              }}
            />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo lịch khám sức khỏe
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Health_check;
