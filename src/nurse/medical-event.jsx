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
  Card,
  Drawer,
  Typography,
} from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  SearchOutlined,
  MinusCircleOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import api from "../config/axios";
import { useSelector } from "react-redux";

dayjs.extend(utc);

const { Title } = Typography;

const MedicalEvent = () => {
  const [form] = Form.useForm();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchForm] = Form.useForm();
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [eventDetails, setEventDetails] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [medicalInventory, setMedicalInventory] = useState([]);
  const [originalEventData, setOriginalEventData] = useState(null);
  const [originalItemsData, setOriginalItemsData] = useState(null);
  const user = useSelector((state) => state.user);

  const eventTypes = ["Chấn thương", "Dị ứng", "Sốt", "Khác"];

  const fetchMedicalEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get("MedicalEvents");
      const data = response.data.$values || [];
      const sortedData = data.sort(
        (a, b) => new Date(b.eventTime) - new Date(a.eventTime)
      );
      setTableData(sortedData);
      setOriginalData(sortedData);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu sự cố: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalInventory = async () => {
    try {
      const response = await api.get("MedicalInventory");
      setMedicalInventory(response.data.$values || []);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu thuốc: " + error.message);
    }
  };

  useEffect(() => {
    fetchMedicalEvents();
    fetchMedicalInventory();
  }, []);

  const handleShowDrawer = (record = null) => {
    setEditingEvent(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        eventTime: record.eventTime ? dayjs(record.eventTime) : null,
      });
      // Fetch and set items if editing
      if (record.eventID) {
        api
          .get(`MedicalEventInventory/event/${record.eventID}`)
          .then((res) => {
            const items = (res.data.$values || []).map((item) => ({
              ...item,
              isExisting: true,
            }));
            form.setFieldsValue({ items });
            // Lưu lại dữ liệu gốc để so sánh khi submit
            setOriginalEventData({
              eventID: record.eventID,
              description: record.description,
              eventType: record.eventType,
              eventTime: dayjs(record.eventTime).utc().format(),
              studentID: record.studentID,
            });
            setOriginalItemsData(
              items.map((i) => ({
                itemID: i.itemID,
                quantityUsed: i.quantityUsed,
                isExisting: true,
              }))
            );
          })
          .catch((err) => {
            toast.error("Lỗi khi tải thuốc đã dùng: " + err.message);
          });
      }
    } else {
      form.resetFields();
      setOriginalEventData(null);
      setOriginalItemsData(null);
    }
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
    setEditingEvent(null);
    form.resetFields();
  };

  const handleViewDetails = async (record) => {
    setSelectedEvent(record);
    try {
      const response = await api.get(
        `MedicalEventInventory/event/${record.eventID}`
      );
      setEventDetails(response.data.$values || []);
      setIsDetailModalVisible(true);
    } catch (error) {
      toast.error("Lỗi khi tải chi tiết sự cố: " + error.message);
    }
  };

  const handleStudentSearch = async (searchText) => {
    if (!searchText) {
      setStudentSuggestions([]);
      return;
    }
    try {
      const response = await api.get(`/Student/search/${searchText}`);
      const suggestions = (response.data.$values || []).map((student) => ({
        value: student.fullName,
        label: `${student.fullName} (Lớp ${student.className})`,
        key: student.studentID,
        student,
      }));
      setStudentSuggestions(suggestions);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm học sinh:", error);
    }
  };

  const onStudentSelect = (value, option) => {
    form.setFieldsValue({
      studentID: option.student.studentID,
      studentName: option.student.fullName,
    });
    setStudentSuggestions([]);
  };

  const handleUpdateStatus = async (eventID) => {
    try {
      await api.put(`MedicalEvents/${eventID}/status`, "Đã xử lý", {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Cập nhật trạng thái thành công!");
      fetchMedicalEvents();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái: " + error.message);
    }
  };

  const handleFinish = async (values) => {
    try {
      let nurseID = null;
      // Lấy giờ phút từ values.eventTime
      const selectedTime = values.eventTime;
      const now = dayjs(); // ngày hiện tại
      // Kết hợp ngày hiện tại với giờ phút đã chọn
      const eventTime = now
        .hour(selectedTime.hour())
        .minute(selectedTime.minute())
        .second(0)
        .millisecond(0)
        .utc()
        .format();
      // Tách dữ liệu event và items
      console.log("user  ", user);
      const response = await api.get(`Nurse?userId=${user.userID}`);
      const eventData = {
        eventID: values.eventID,
        description: values.description.trim(),
        eventType: values.eventType,
        eventTime: eventTime, // dùng eventTime đã kết hợp
        studentID: parseInt(values.studentID),
        nurseID: response.data.nurseID,
      };
      const itemsData = (values.items || []).map((i) => ({
        itemID: i.itemID,
        quantityUsed: i.quantityUsed,
        isExisting: i.isExisting,
      }));
      // So sánh riêng biệt
      let isEventChanged = true;
      let isItemsChanged = true;
      if (editingEvent && originalEventData && originalItemsData) {
        isEventChanged = !(
          eventData.eventID === originalEventData.eventID &&
          eventData.description === originalEventData.description &&
          eventData.eventType === originalEventData.eventType &&
          eventData.eventTime === originalEventData.eventTime &&
          eventData.studentID === originalEventData.studentID
        );
        isItemsChanged =
          itemsData.length !== originalItemsData.length ||
          itemsData.some((item, idx) => {
            const ori = originalItemsData[idx];
            return (
              item.itemID !== ori.itemID ||
              item.quantityUsed !== ori.quantityUsed ||
              item.isExisting !== ori.isExisting
            );
          });
        if (!isEventChanged && !isItemsChanged) {
          toast.info("Bạn chưa thay đổi thông tin nào.");
          return;
        } else {
          nurseID = await api.get(`Nurse?userId=${user.userID}`);
        }
      }

      // Gọi API theo phần thay đổi
      if (editingEvent) {
        if (isEventChanged) {
          await api.put(`MedicalEvents/${eventData.eventID}`, {
            ...eventData,
            nurseID: nurseID || undefined,
          });
        }
        if (isItemsChanged) {
          await api.patch(
            `/MedicalEventInventory/event/${eventData.eventID}/items`,
            {
              eventID: eventData.eventID,
              items: itemsData,
            }
          );
        }
        toast.success("Cập nhật sự cố thành công!");
      } else {
        // Tạo mới event trước
        const response = await api.get("Nurse");
        nurseID = response.data.nurseID;
        console.log("eventData  ", eventData);
        const createResponse = await api.post("MedicalEvents", {
          ...eventData,
          nurseID,
        });
        const newEventId = createResponse.data.eventID;
        // Sau đó tạo items nếu có
        if (newEventId && itemsData.length > 0) {
          await api.patch(`/MedicalEventInventory/event/${newEventId}/items`, {
            eventID: newEventId,
            items: itemsData,
          });
        }
        toast.success("Thêm sự cố thành công!");
      }
      handleCloseDrawer();
      fetchMedicalEvents();
    } catch (error) {
      toast.error("Thao tác thất bại: " + error.message);
    }
  };

  const handleSearch = async (values) => {
    const { keyword, status } = values;
    let filteredData = [...originalData];

    if (keyword) {
      const response = await api.get(
        `/MedicalEvents/search?keyword=${keyword}`
      );
      filteredData = response.data.$values;
    }

    if (status && status !== "All") {
      filteredData = filteredData.filter((item) => {
        if (status === "Đang xử lý") {
          return ["Đang xử lý", "Processing", "chưa xử lý"].includes(
            item.status
          );
        }
        if (status === "Đã xử lý") {
          return ["Đã xử lý", "Processed"].includes(item.status);
        }
        return false;
      });
    }

    setTableData(filteredData);
  };

  const columns = [
    { title: "ID", dataIndex: "eventID", key: "eventID", width: 80 },
    {
      title: "Họ và tên học sinh",
      dataIndex: "studentName",
      key: "studentName",
    },
    { title: "Loại sự cố", dataIndex: "eventType", key: "eventType" },
    {
      title: "Thời gian xảy ra",
      dataIndex: "eventTime",
      key: "eventTime",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          "Đã xử lý": { color: "green", text: "Đã xử lý" },
          Processed: { color: "green", text: "Đã xử lý" },
          "Đang xử lý": { color: "orange", text: "Đang xử lý" },
          Processing: { color: "orange", text: "Đang xử lý" },
          "chưa xử lý": { color: "orange", text: "Đang xử lý" },
        };
        const { color, text } = statusMap[status] || {
          color: "red",
          text: "Chưa xử lý",
        };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Xem
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleShowDrawer(record)}
          >
            Sửa
          </Button>
          {record.status !== "Đã xử lý" && record.status !== "Processed" && (
            <Popconfirm
              title="Xác nhận xử lý sự cố?"
              onConfirm={() => handleUpdateStatus(record.eventID)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                icon={<CheckCircleOutlined />}
              >
                Đã xử lý
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const detailColumns = [
    { title: "Tên thuốc", dataIndex: "itemName", key: "itemName" },
    { title: "Số lượng", dataIndex: "quantityUsed", key: "quantityUsed" },
    {
      title: "Ngày sử dụng",
      dataIndex: "usedTime",
      key: "usedTime",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <Card>
      <Title level={3}>Quản lý sự cố y tế</Title>
      <Form
        form={searchForm}
        layout="inline"
        onFinish={handleSearch}
        style={{ marginBottom: 20 }}
      >
        <Form.Item name="keyword">
          <Input
            placeholder="Tìm theo tên học sinh"
            style={{ width: 240 }}
            allowClear
          />
        </Form.Item>
        <Form.Item name="status">
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 180 }}
            allowClear
          >
            <Select.Option value="All">Tất cả trạng thái</Select.Option>
            <Select.Option value="Đang xử lý">Đang xử lý</Select.Option>
            <Select.Option value="Đã xử lý">Đã xử lý</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            Tìm kiếm
          </Button>
        </Form.Item>
        <Form.Item style={{ marginLeft: "auto" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleShowDrawer()}
          >
            Thêm sự cố
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="eventID"
        loading={loading}
      />

      <Drawer
        title={editingEvent ? "Chỉnh sửa sự cố y tế" : "Thêm mới sự cố y tế"}
        width={720}
        onClose={handleCloseDrawer}
        open={isDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <Space
            style={{
              textAlign: "right",
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={handleCloseDrawer}>Hủy</Button>
            <Button onClick={() => form.submit()} type="primary">
              {editingEvent ? "Lưu thay đổi" : "Tạo sự cố"}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
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
              disabled={!!editingEvent}
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
            <Input placeholder="ID sẽ tự động điền" disabled />
          </Form.Item>
          <Form.Item
            label="Loại sự cố"
            name="eventType"
            rules={[{ required: true, message: "Vui lòng nhập loại sự cố!" }]}
          >
            <Select placeholder="Chọn loại sự cố">
              {eventTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Thời gian xảy ra"
            name="eventTime"
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <DatePicker
              picker="time"
              format="HH:mm"
              style={{ width: "100%" }}
              placeholder="Chọn giờ phút xảy ra"
            />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết về sự cố" />
          </Form.Item>

          <Title level={5}>Thuốc sử dụng</Title>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => {
                  const item = form.getFieldValue(["items", field.name]);
                  const isExisting = item?.isExisting;
                  return (
                    <Space
                      key={field.key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, "itemName"]}
                        rules={[{ required: true, message: "Chọn thuốc!" }]}
                        noStyle
                      >
                        <Select
                          placeholder="Thuốc"
                          style={{ width: 200 }}
                          disabled={isExisting}
                          onChange={(itemName) => {
                            const selected = medicalInventory.find(
                              (i) => i.itemName === itemName
                            );
                            if (selected) {
                              const items = form.getFieldValue("items");
                              items[field.name].itemID = selected.itemID;
                              form.setFieldsValue({ items });
                            }
                          }}
                        >
                          {medicalInventory.map((item) => (
                            <Select.Option
                              key={item.itemID}
                              value={item.itemName}
                            >
                              {item.itemName}
                            </Select.Option>
                          ))}
                        </Select>
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
                        rules={[{ required: true, message: "Nhập số lượng!" }]}
                        noStyle
                      >
                        <InputNumber min={1} max={5} placeholder="Số lượng" />
                      </Form.Item>
                      {!isExisting && (
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </Space>
                  );
                })}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm thuốc sử dụng
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>

      <Modal
        title={`Chi tiết sự cố y tế của ${selectedEvent?.studentName}`}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
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
    </Card>
  );
};

export default MedicalEvent;
