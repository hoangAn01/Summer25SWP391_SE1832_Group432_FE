import React, { useEffect, useState } from "react";
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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import api from "../config/axios";

dayjs.extend(utc);

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

const MedicalEvent = () => {
  const [form] = Form.useForm();
  const [showForm, setShowForm] = useState(false);
  const [searchForm] = Form.useForm();
  const [searchType, setSearchType] = useState("studentId");
  const [tableData, setTableData] = useState();

  const columns = [
    {
      title: "ID sự kiện",
      dataIndex: "eventID",
      key: "eventID",
    },
    {
      title: "ID học sinh",
      dataIndex: "studentID",
      key: "studentID",
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
      dataIndex: "eventTime",
      key: "eventTime",
      render: (date) => {
        console.log(date);
        return dayjs(date).format("DD/MM/YYYY HH:mm");
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            onClick={() => {
              setShowForm(true);
              form.setFieldsValue({
                ...record,
                eventTime: dayjs(record.eventTime),
              });
            }}
          >
            Chỉnh sửa
          </Button>
          <Button onClick={() => handleDelete(record.eventID)}>Xóa</Button>
        </>
      ),
    },
  ];

  const fetchProducts = async () => {
    try {
      const response = await api.get("MedicalEvents");
      console.log(response.data);
      setTableData(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu: " + error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFinish = async (values) => {
    try {
      console.log("Raw date value:", values.eventTime);
      const formattedValues = {
        ...values,
        eventTime: dayjs(values.eventTime).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        studentID: parseInt(values.studentID),
        nurseID: 1,
      };
      console.log("Formatted values:", formattedValues);

      if (form.getFieldValue("eventID")) {
        // If eventID exists, it's an edit operation
        const { studentName, ...updateData } = formattedValues;
        await api.put(
          `MedicalEvents/${form.getFieldValue("eventID")}`,
          updateData
        );
        toast.success("Cập nhật sự kiện thành công!");
      } else {
        // If no eventID, it's a new record
        await api.post("MedicalEvents", formattedValues);
        toast.success("Thêm sự kiện thành công!");
      }
      form.resetFields();
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.log(error);
      toast.error("Lỗi: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`MedicalEvents/${id}`);
      toast.success("Xóa sự kiện thành công!");
      fetchProducts();
    } catch (error) {
      toast.error("Lỗi khi xóa: " + error.message);
    }
  };

  const handleBack = () => {
    form.resetFields();
    setShowForm(false);
  };

  const handleSearch = (values) => {};

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
        initialValues={{
          date: dayjs(),
        }}
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
          {form.getFieldValue("eventID")
            ? "Chỉnh sửa sự kiện y tế"
            : "Thêm sự kiện y tế"}
        </h2>
        <Form.Item name="eventID" hidden>
          <Input />
        </Form.Item>
        <Form.Item
          label="ID học sinh"
          name="studentID"
          rules={[{ required: true, message: "Vui lòng nhập ID học sinh!" }]}
        >
          <Input
            placeholder="Nhập ID học sinh"
            disabled={!!form.getFieldValue("eventID")}
          />
        </Form.Item>
        <Form.Item
          label="Họ và tên học sinh"
          name="studentName"
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên học sinh!" },
          ]}
        >
          <Input
            placeholder="Nhập họ và tên học sinh"
            disabled={!!form.getFieldValue("eventID")}
          />
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
          name="eventTime"
          rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
        >
          <DatePicker
            showTime={{ format: "HH:mm" }}
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
