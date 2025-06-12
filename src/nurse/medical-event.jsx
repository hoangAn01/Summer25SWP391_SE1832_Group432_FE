import React, { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { toast } from "react-toastify";
import axios from "axios";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const columns = [
  {
    title: "ID học sinh",
    dataIndex: "studentId",
    key: "studentId",
  },
  {
    title: "Họ và tên học sinh",
    dataIndex: "studentName",
    key: "studentName",
  },
  {
    title: "Loại sự kiện",
    dataIndex: "eventType",
    key: "eventType",
  },
  {
    title: "Thời gian xảy ra",
    dataIndex: "eventDateTime",
    key: "eventDateTime",
  },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Thao tác",
    key: "action",
    render: () => (
      <Space size="middle">
        <a>Chi tiết</a>
        <a>Xóa</a>
      </Space>
    ),
  },
];

const initialData = [
  {
    key: "1",
    studentId: "HS001",
    studentName: "Nguyễn Văn A",
    eventType: "Tai nạn",
    eventDateTime: "01/01/2024 08:00",
    description: "Ngã cầu thang",
  },
  {
    key: "2",
    studentId: "HS002",
    studentName: "Trần Thị B",
    eventType: "Bệnh",
    eventDateTime: "02/01/2024 09:30",
    description: "Sốt cao",
  },
];

const MedicalEvent = () => {
  const [form] = Form.useForm();
  const [showForm, setShowForm] = useState(false);
  const [searchForm] = Form.useForm();
  const [searchType, setSearchType] = useState("studentId");
  const [tableData, setTableData] = useState(initialData);

  const handleFinish = async (values) => {
    console.log("Form submitted:", values);
    try {
      await axios.post("/api/chua-co-back-end", values);
      toast.success("Sự kiện y tế đã được ghi nhận!");
      setShowForm(false);
      // Thêm dữ liệu mới vào bảng
      const newData = {
        key: String(tableData.length + 1),
        ...values,
        eventDateTime: values.eventDateTime.format("DD/MM/YYYY HH:mm"),
      };
      setTableData([...tableData, newData]);
    } catch (error) {
      toast.success(error.data);
    }
    form.resetFields();
  };

  const handleBack = () => {
    setShowForm(false);
  };

  const handleSearch = (values) => {
    const { searchType, searchValue } = values;
    if (!searchValue) {
      setTableData(initialData);
      return;
    }

    const filteredData = initialData.filter((item) => {
      const searchField = item[searchType];
      return searchField.toLowerCase().includes(searchValue.toLowerCase());
    });

    setTableData(filteredData);
  };

  if (!showForm) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Form
            form={searchForm}
            onFinish={handleSearch}
            style={{
              display: "flex",
              gap: "10px",
              flex: 1,
              marginRight: "20px",
            }}
          >
            <Form.Item name="searchType" style={{ margin: 0, width: "150px" }}>
              <Select
                defaultValue="studentId"
                onChange={setSearchType}
                options={[
                  { value: "studentId", label: "ID học sinh" },
                  { value: "studentName", label: "Họ và tên học sinh" },
                  { value: "eventType", label: "Loại sự kiện" },
                ]}
              />
            </Form.Item>
            <Form.Item name="searchValue" style={{ margin: 0, flex: 1 }}>
              <Input
                placeholder={`Nhập ${
                  searchType === "studentId"
                    ? "ID học sinh"
                    : searchType === "studentName"
                    ? "họ và tên học sinh"
                    : "loại sự kiện"
                }`}
              />
            </Form.Item>
            <Form.Item style={{ margin: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                Tìm kiếm
              </Button>
            </Form.Item>
          </Form>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowForm(true)}
          >
            Thêm sự kiện
          </Button>
        </div>
        <Table columns={columns} dataSource={tableData} />
      </div>
    );
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: "20px" }}
      >
        Quay lại
      </Button>
      <Form
        {...formItemLayout}
        form={form}
        style={{
          maxWidth: 600,
          margin: "40px auto",
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 4px 24px #0001",
        }}
        onFinish={handleFinish}
        layout="horizontal"
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            color: "#1677ff",
            marginBottom: 32,
          }}
        >
          Ghi nhận sự kiện y tế
        </h2>
        <Form.Item
          label="ID học sinh"
          name="studentId"
          rules={[{ required: true, message: "Vui lòng nhập ID học sinh!" }]}
        >
          <Input placeholder="Nhập ID học sinh" />
        </Form.Item>
        <Form.Item
          label="Họ và tên học sinh"
          name="studentName"
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên học sinh!" },
          ]}
        >
          <Input placeholder="Nhập họ và tên học sinh" />
        </Form.Item>
        <Form.Item
          label="Loại sự kiện"
          name="eventType"
          rules={[{ required: true, message: "Vui lòng nhập loại sự kiện!" }]}
        >
          <Input placeholder="Nhập loại sự kiện" />
        </Form.Item>
        <Form.Item
          label="Thời gian xảy ra"
          name="eventDateTime"
          rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            style={{ width: "100%" }}
            placeholder="Chọn thời gian"
          />
        </Form.Item>
        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <Input.TextArea
            placeholder="Nhập mô tả chi tiết về sự kiện"
            rows={4}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: "100%", fontWeight: 600, fontSize: 16 }}
          >
            Gửi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MedicalEvent;
