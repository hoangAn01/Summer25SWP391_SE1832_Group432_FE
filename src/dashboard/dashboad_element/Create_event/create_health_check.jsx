import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, DatePicker, Select, message } from "antd";
import api from "../../../config/axios";
import { toast } from "react-toastify";

function Health_check() {
  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);

  // Lấy danh sách lớp
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/Class");
        setClasses(res.data.$values || res.data);
      } catch {
        message.error("Không thể tải danh sách lớp");
      }
    };
    fetchClasses();
  }, []);

  const onFinish = async (values) => {
    try {
      const body = {
        date: values.date.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        classIDs: values.classIDs,
        managerID: 1,
        note: values.note || "",
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
            label="Chọn lớp"
            name="classIDs"
            rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn một hoặc nhiều lớp"
              optionFilterProp="children"
              showSearch
            >
              {classes.map((cls) => (
                <Select.Option key={cls.classID} value={cls.classID}>
                  {cls.className}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)..." />
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
              disabledDate={(current) =>
                current && current < new Date().setHours(0, 0, 0, 0)
              }
              disabledTime={(current) => {
                if (!current) return {};
                const now = new Date();
                if (
                  current.year() === now.getFullYear() &&
                  current.month() === now.getMonth() &&
                  current.date() === now.getDate()
                ) {
                  return {
                    disabledHours: () =>
                      Array.from({ length: 24 }, (_, i) => i).filter(
                        (h) => h < now.getHours()
                      ),
                    disabledMinutes: (selectedHour) =>
                      selectedHour === now.getHours()
                        ? Array.from({ length: 60 }, (_, i) => i).filter(
                            (m) => m < now.getMinutes()
                          )
                        : [],
                  };
                }
                return {};
              }}
            />
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
