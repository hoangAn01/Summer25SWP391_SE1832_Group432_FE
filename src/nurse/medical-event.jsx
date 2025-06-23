import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Table,
  AutoComplete,
  Tag,
  Popconfirm,
  Modal,
  Space,
  InputNumber,
} from "antd";
import { toast } from "react-toastify";

import {
  ArrowLeftOutlined,
  MinusCircleOutlined,
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
  const [statusFilter, setStatusFilter] = useState("All");
  const [tableData, setTableData] = useState();
  const [originalData, setOriginalData] = useState();
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eventDetails, setEventDetails] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [medicalInventory, setMedicalInventory] = useState([]);
  // bảng sự kiện y tế
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = status;

        if (status === "Đã xử lý" || status === "Processed") {
          color = "green";
          text = "Đã xử lý";
        } else if (
          status === "Đang xử lý" ||
          status === "Processing" ||
          status === "chưa xử lý"
        ) {
          color = "orange";
          text = "Đang xử lý";
        } else {
          color = "red";
          text = "Chưa xử lý";
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        const isProcessed =
          record.status === "Đã xử lý" || record.status === "Processed";

        return (
          <>
            <Button type="link" onClick={() => handleViewDetails(record)}>
              Xem chi tiết
            </Button>
            <Button
              type="primary"
              style={{
                backgroundColor: "#1677ff",
                borderColor: "#1677ff",
                marginRight: "8px",
              }}
              onClick={async () => {
                try {
                  const response = await api.get(
                    `MedicalEventInventory/event/${record.eventID}`
                  );
                  const existingItems = (response.data.$values || []).map(
                    (item) => ({ ...item, isExisting: true })
                  );

                  form.setFieldsValue({
                    ...record,
                    eventTime: dayjs(record.eventTime),
                    items: existingItems,
                  });
                  setShowForm(true);
                } catch (error) {
                  toast.error("Lỗi khi tải chi tiết sự kiện: " + error.message);
                }
              }}
            >
              Chỉnh sửa
            </Button>
            {!isProcessed && (
              <Popconfirm
                title="Xác nhận xử lý"
                description="Bạn có chắc chắn muốn đánh dấu sự kiện này là đã xử lý?"
                onConfirm={() => handleUpdateStatus(record.eventID)}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{
                  style: {
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  },
                }}
              >
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  Đã xử lý
                </Button>
              </Popconfirm>
            )}
          </>
        );
      },
    },
  ];
  // bảng chi tiết sự kiện y tế
  const detailColumns = [
    {
      title: "Tên thuốc",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Số lượng",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
    },
    {
      title: "Ngày sử dụng",
      dataIndex: "usedTime",
      key: "usedTime",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
  ];

  const fetchProducts = async () => {
    try {
      const response = await api.get("MedicalEvents");
      console.log(response.data);
      // Xử lý cấu trúc dữ liệu mới từ backend
      const data = response.data.$values;
      // Sắp xếp theo thời gian mới nhất lên đầu
      const sortedData = data.sort((a, b) => {
        return new Date(b.eventTime) - new Date(a.eventTime);
      });
      setTableData(sortedData);
      setOriginalData(sortedData);
      setStatusFilter("All");
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu: " + error.message);
    }
  };

  const fetchMedicalInventory = async () => {
    try {
      const response = await api.get("MedicalInventory");
      setMedicalInventory(response.data.$values);
      console.log("medicalInventory: ", response.data.$values);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu: " + error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMedicalInventory();
  }, []);
  const handleViewDetails = async (record) => {
    try {
      const response = await api.get(
        `MedicalEventInventory/event/${record.eventID}`
      );
      setEventDetails(response.data.$values || []);
      setSelectedEvent(record);
      setIsModalVisible(true);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu: " + error.message);
    }
  };

  const handleStudentSearch = async (searchText) => {
    if (!searchText) {
      setStudentSuggestions([]);
      return;
    }
    try {
      const response = await api.get(`/Student/search/${searchText}`);
      // Xử lý cấu trúc dữ liệu mới từ backend
      const data = response.data.$values;
      const suggestions = data.map((student) => ({
        value: student.fullName,
        label: `${student.fullName} (Lớp ${student.className})`,
        key: student.studentID,
        student,
      }));
      setStudentSuggestions(suggestions);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm học sinh:", error);
      setStudentSuggestions([]);
    }
  };
  const onStudentSelect = (value, option) => {
    const { student } = option;
    form.setFieldsValue({
      studentID: student.studentID,
      studentName: student.fullName,
    });
    setStudentSuggestions([]);
  };

  const handleUpdateStatus = async (eventID) => {
    try {
      await api.put(`MedicalEvents/${eventID}/status`, "Đã xử lý", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Cập nhật trạng thái thành công!");
      fetchProducts();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái: " + error.message);
    }
  };

  const handleFinish = async (values) => {
    try {
      console.log("Raw date value:", values.eventTime);
      const response = await api.get("Nurse");
      const formattedValues = {
        ...values,
        eventTime: dayjs(values.eventTime).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        studentID: parseInt(values.studentID),
        nurseID: response.data.nurseID,
      };
      console.log("Formatted values:", formattedValues);

      if (form.getFieldValue("eventID")) {
        // If eventID exists, it's an edit operation
        console.log("Update data:", formattedValues);
        await api.put(
          `MedicalEvents/${form.getFieldValue("eventID")}`,
          formattedValues
        );
        if (formattedValues.items && formattedValues.items.length > 0) {
          const itemsPayload = formattedValues.items.map((item) => ({
            itemId: item.itemID,
            quantity: item.quantityUsed,
          }));
          await api.post(
            `MedicalEvents/${form.getFieldValue("eventID")}/use-items`,
            { items: itemsPayload }
          );
        }
        toast.success("Cập nhật sự kiện thành công!");
      } else {
        // If no eventID, it's a new record
        const createResponse = await api.post("MedicalEvents", formattedValues);
        const newEventId = createResponse.data.eventID;

        if (
          newEventId &&
          formattedValues.items &&
          formattedValues.items.length > 0
        ) {
          const itemsPayload = formattedValues.items.map((item) => ({
            itemId: item.itemID,
            quantity: item.quantityUsed,
          }));
          await api.post(`MedicalEvents/${newEventId}/use-items`, {
            items: itemsPayload,
          });
        }
        console.log("Formatted values:", formattedValues);
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

  const handleBack = () => {
    form.resetFields();
    setShowForm(false);
  };

  const handleSearch = async (values) => {
    try {
      const keyword = values.searchValue;
      if (!keyword) {
        fetchProducts();
        return;
      }

      const response = await api.get(
        `MedicalEvents/search?keyword=${encodeURIComponent(keyword)}`
      );
      console.log("Search results:", response.data);
      // Xử lý cấu trúc dữ liệu mới từ backend
      const data = response.data.$values;
      // Sắp xếp kết quả tìm kiếm theo thời gian mới nhất lên đầu
      const sortedData = data.sort((a, b) => {
        return new Date(b.eventTime) - new Date(a.eventTime);
      });
      setTableData(sortedData);
      setOriginalData(sortedData);
      setStatusFilter("All");
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm: " + error.message);
    }
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    if (value === "All") {
      setTableData(originalData);
    } else {
      // Filter data based on status
      const filteredData = originalData?.filter((item) => {
        if (value === "Đang xử lý") {
          return (
            item.status === "Đang xử lý" ||
            item.status === "Processing" ||
            item.status === "chưa xử lý"
          );
        } else if (value === "Đã xử lý") {
          return item.status === "Đã xử lý" || item.status === "Processed";
        }
        return true;
      });
      setTableData(filteredData);
    }
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
            <Form.Item name="searchValue" style={{ margin: 0, flex: 1 }}>
              <Input placeholder="Nhập tên học sinh để tìm kiếm" />
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
            <Form.Item style={{ margin: 0, marginLeft: "10px" }}>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                style={{ width: "150px" }}
                options={[
                  { value: "All", label: "All" },
                  { value: "Đang xử lý", label: "Đang xử lý" },
                  { value: "Đã xử lý", label: "Đã xử lý" },
                ]}
              />
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
        <Modal
          title={`Chi tiết sự kiện y tế của học sinh ${selectedEvent?.studentName}`}
          open={isModalVisible}
          onOk={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
          width={800}
          footer={[
            <Button key="back" onClick={() => setIsModalVisible(false)}>
              Đóng
            </Button>,
          ]}
        >
          <Table
            columns={detailColumns}
            dataSource={eventDetails}
            rowKey="eventInventoryID"
            pagination={false}
          />
        </Modal>
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
            ? "Chỉnh sửa sự cố y tế"
            : "Thêm sự cố y tế"}
        </h2>
        <Form.Item name="eventID" hidden>
          <Input />
        </Form.Item>
        <Form.Item
          label="Họ và tên học sinh"
          name="studentName"
          rules={[
            { required: true, message: "Vui lòng nhập và chọn học sinh!" },
          ]}
        >
          <AutoComplete
            options={studentSuggestions}
            onSearch={handleStudentSearch}
            onSelect={onStudentSelect}
            placeholder="Nhập tên học sinh để tìm kiếm"
            disabled={!!form.getFieldValue("eventID")}
          />
        </Form.Item>
        <Form.Item
          label="ID học sinh"
          name="studentID"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn học sinh từ danh sách!",
            },
          ]}
        >
          <Input
            placeholder="ID sẽ tự động điền sau khi chọn học sinh"
            disabled
          />
        </Form.Item>
        <Form.Item
          label="Loại sự kiện"
          name="eventType"
          rules={[{ required: true, message: "Vui lòng nhập loại sự cố!" }]}
        >
          <Input placeholder="Nhập loại sự cố" />
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
          <Input.TextArea placeholder="Nhập mô tả chi tiết về sự cố" rows={4} />
        </Form.Item>

        {/* bảng vật tư sử dụng */}
        <Form.List name="items">
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => {
                const item = form.getFieldValue("items")[field.name];
                const isExisting = item?.isExisting;

                return (
                  <Form.Item
                    {...(index === 0
                      ? formItemLayout
                      : {
                          wrapperCol: {
                            ...formItemLayout.wrapperCol,
                            offset: formItemLayout.labelCol.sm.span,
                          },
                        })}
                    label={index === 0 ? "Vật tư sử dụng" : ""}
                    key={field.key}
                  >
                    <Space>
                      <Form.Item
                        {...field}
                        name={[field.name, "itemName"]}
                        rules={[
                          { required: true, message: "Vui lòng chọn vật tư!" },
                        ]}
                        noStyle
                      >
                        <Select
                          placeholder="Vật tư"
                          style={{ width: 200 }}
                          disabled={isExisting}
                          options={medicalInventory.map((item) => ({
                            label: item.itemName,
                            value: item.itemName,
                          }))}
                          onChange={(itemName) => {
                            const selectedItem = medicalInventory.find(
                              (item) => item.itemName === itemName
                            );
                            if (selectedItem) {
                              const items = form.getFieldValue("items");
                              items[field.name].itemID = selectedItem.itemID;
                              form.setFieldsValue({ items });
                            }
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, "itemID"]}
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, "isExisting"]}
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, "quantityUsed"]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số lượng!",
                          },
                        ]}
                        noStyle
                      >
                        <InputNumber min={1} placeholder="Số lượng" />
                      </Form.Item>
                      {!isExisting && (
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </Space>
                  </Form.Item>
                );
              })}
              <Form.Item
                wrapperCol={{
                  ...formItemLayout.wrapperCol,
                  offset: formItemLayout.labelCol.sm.span,
                }}
              >
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm vật tư
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item name="status" hidden>
          <Input />
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
