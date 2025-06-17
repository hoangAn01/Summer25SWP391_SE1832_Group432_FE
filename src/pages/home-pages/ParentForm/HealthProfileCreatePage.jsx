import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Typography, Space, DatePicker } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
// import api from "../../config/axios";

const { Title } = Typography;

function HealthProfileCreatePage() {
  const [form] = Form.useForm();
  const [studentInfo, setStudentInfo] = useState({
    fullName: "",
    className: "",
    dob: "",
  });

  useEffect(() => {
    // Gọi API lấy họ tên, lớp, ngày sinh
    // api.get("/api/student/me").then(res => {
    //   setStudentInfo({
    //     fullName: res.data.fullName,
    //     className: res.data.className,
    //     dob: res.data.dob
    //   });
    // });
    // Demo:

    setTimeout(() => {
      setStudentInfo({
        fullName: "",
        className: "",
        dob: "",
      });
    }, 500);
  }, []);

  const onFinish = (values) => {
    // Gửi dữ liệu lên API ở đây
    const data = {
      ...values,
      fullName: studentInfo.fullName,
      className: studentInfo.className,
      dob: studentInfo.dob,
    };
    console.log("Dữ liệu hồ sơ sức khỏe:", data);
    alert("Tạo hồ sơ thành công!");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "40px auto",
          boxShadow: "0 4px 24px 0 rgba(33,150,243,0.10)",
        }}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          Tạo hồ sơ sức khỏe học sinh
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 24 }}
        >
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 320 }}>
              <Form.Item label="Họ và tên">
                <Input
                  value={studentInfo.fullName || ""}
                  disabled
                  placeholder="Chưa có thông tin"
                />
              </Form.Item>
              <Form.Item label="Lớp">
                <Input
                  value={studentInfo.className || ""}
                  disabled
                  placeholder="Chưa có thông tin"
                />
              </Form.Item>
              <Form.Item label="Ngày tháng năm sinh">
                <Input
                  value={studentInfo.dob || ""}
                  disabled
                  placeholder="Chưa có thông tin"
                />
              </Form.Item>
              <Form.Item
                label="Dị ứng"
                name="allergy"
                rules={[
                  { required: true, message: "Vui lòng nhập dị ứng (nếu có)" },
                ]}
              >
                <Input placeholder="Nhập dị ứng (nếu có)" />
              </Form.Item>
              <Form.Item
                label="Bệnh mãn tính"
                name="chronicDisease"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập bệnh mãn tính (nếu có)",
                  },
                ]}
              >
                <Input placeholder="Nhập bệnh mãn tính (nếu có)" />
              </Form.Item>
            </div>
            <div style={{ flex: 1, minWidth: 320 }}>
              <Form.List name="treatmentHistory">
                {(fields, { add, remove }) => (
                  <div>
                    <label>Tiền sử điều trị</label>
                    {fields.map((field, idx) => (
                      <Space
                        key={field.key}
                        align="baseline"
                        style={{ display: "flex", marginBottom: 8 }}
                      >
                        <Form.Item
                          name={[field.name, "date"]}
                          fieldKey={[field.fieldKey, "date"]}
                          rules={[{ required: true, message: "Chọn ngày" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <DatePicker
                            format="DD/MM/YYYY"
                            placeholder="Ngày"
                            style={{ width: 120 }}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, "desc"]}
                          fieldKey={[field.fieldKey, "desc"]}
                          rules={[
                            {
                              required: true,
                              message: "Nhập nội dung điều trị",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            placeholder={`Tiền sử điều trị ${idx + 1}`}
                            style={{ width: 220 }}
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                          />
                        )}
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      style={{ width: "100%" }}
                    >
                      Thêm tiền sử điều trị
                    </Button>
                  </div>
                )}
              </Form.List>
              <Form.Item
                label="Thị lực"
                name="vision"
                rules={[{ required: true, message: "Vui lòng nhập thị lực" }]}
              >
                <Input placeholder="Nhập thị lực" />
              </Form.Item>

              <Form.Item
                label="Tiêm chủng"
                name="vaccination"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thông tin tiêm chủng",
                  },
                ]}
              >
                <Input placeholder="Nhập thông tin tiêm chủng" />
              </Form.Item>
              <Form.Item
                label="Chiều cao "
                name="height"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thông tin chiều cao",
                  },
                ]}
              >
                <Input placeholder="Nhập thông tin chiều cao" />
              </Form.Item>
              <Form.Item
                label="Cân nặng "
                name="weight"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thông tin Cân nặng ",
                  },
                ]}
              >
                <Input placeholder="Nhập thông tin cân nặng " />
              </Form.Item>
            </div>
          </div>
          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{ minWidth: 180, fontWeight: 600, fontSize: 16 }}
            >
              Tạo hồ sơ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default HealthProfileCreatePage;
