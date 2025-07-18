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
  Switch,
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
import relativeTime from "dayjs/plugin/relativeTime";
import api from "../config/axios";
import { useSelector } from "react-redux";

dayjs.extend(utc);
dayjs.extend(relativeTime);

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
  const user = useSelector((state) => state.user);
  const [originalEventData, setOriginalEventData] = useState(null);
  const [originalItemsData, setOriginalItemsData] = useState(null);

  const eventTypes = [
    "Chấn thương",
    "Dị ứng",
    "Sốt",
    "Đau bụng",
    "Chảy máu cam",
    "Khác",
  ];

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

  const isEventEditable = (eventDate) => {
    const creationTime = dayjs(eventDate);
    const now = dayjs();
    const hoursDiff = now.diff(creationTime, "hour");
    return hoursDiff < 24;
  };

  const handleShowDrawer = (record = null) => {
    if (record && !isEventEditable(record.eventDate)) {
      toast.warning(
        "Không thể chỉnh sửa sự cố đã tạo quá 24 giờ, vui lòng liên hệ với admin để xử lí"
      );
      return;
    }
    setEditingEvent(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        eventTime: record.eventTime ? dayjs(record.eventTime) : null,
      });
      // Fetch and set items if editing
      if (record.medicalEventID) {
        api
          .get(`MedicalEventInventory/event/${record.medicalEventID}`)
          .then((res) => {
            const items = (res.data.$values || []).map((item) => ({
              ...item,
              isExisting: true,
            }));
            form.setFieldsValue({ items });
            // Lưu lại dữ liệu gốc để so sánh khi submit
            setOriginalEventData({
              medicalEventID: record.medicalEventID,
              description: record.description,
              eventType: record.eventType,
              eventTime: dayjs(record.eventTime).utc().format(),
              studentID: record.studentID,
              outcome: record.outcome || "",
              followUpRequired: record.followUpRequired || false,
              status: record.status,
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
        `MedicalEventInventory/event/${record.medicalEventID}`
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
      const response = await api.get(`v2/search?query=${searchText}`);
      console.log("response  ", response.data.data.students.$values);
      if (response.data.success && response.data.data.students.$values) {
        const suggestions = response.data.data.students.$values
          .filter((student) => student.type === "student")
          .map((student) => ({
            value: student.name,
            label: `${student.name} (${student.className})`,
            key: student.id,
            student: {
              studentID: student.id,
              fullName: student.name,
              className: student.className,
            },
          }));
        setStudentSuggestions(suggestions);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm học sinh:", error);
      toast.error("Lỗi khi tìm kiếm học sinh");
    }
  };

  const onStudentSelect = (value, option) => {
    form.setFieldsValue({
      studentID: option.student.studentID,
      studentFullName: option.student.fullName,
    });
    setStudentSuggestions([]);
  };

  const handleUpdateStatus = async (eventID, newStatus) => {
    try {
      await api.put(`MedicalEvents/${eventID}/status`, newStatus, {
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
      const selectedTime = values.eventTime;
      const eventTime = dayjs()
        .hour(selectedTime.hour())
        .minute(selectedTime.minute())
        .second(0)
        .millisecond(0)
        .utc()
        .format();

      // Lấy nurseID từ userID
      const nurseResponse = await api.get("Nurse");
      const nurseInfo = nurseResponse.data.$values.find(
        (nurse) => nurse.accountID === user.userID
      );
      const nurseID = nurseInfo.nurseID;

      const eventData = {
        studentID: parseInt(values.studentID),
        nurseID: nurseID,
        eventType: values.eventType,
        description: values.description.trim(),
        outcome: values.outcome || "",
        followUpRequired: values.followUpRequired || false,
        eventTime: eventTime,
      };

      const itemsData = (values.items || []).map((i) => ({
        itemID: i.itemID,
        quantityUsed: i.quantityUsed,
      }));

      if (editingEvent) {
        // Kiểm tra thay đổi
        let isEventChanged = false;
        let isItemsChanged = false;

        if (originalEventData) {
          isEventChanged =
            eventData.description !== originalEventData.description ||
            eventData.eventType !== originalEventData.eventType ||
            eventData.eventTime !== originalEventData.eventTime ||
            eventData.studentID !== originalEventData.studentID ||
            eventData.outcome !== originalEventData.outcome ||
            eventData.followUpRequired !== originalEventData.followUpRequired;
        }

        if (originalItemsData) {
          isItemsChanged =
            itemsData.length !== originalItemsData.length ||
            itemsData.some((item, idx) => {
              const ori = originalItemsData[idx];
              return (
                !ori ||
                item.itemID !== ori.itemID ||
                item.quantityUsed !== ori.quantityUsed
              );
            });
        }

        if (!isEventChanged && !isItemsChanged) {
          toast.info("Bạn chưa thay đổi thông tin nào.");
          return;
        }

        // Cập nhật nếu có thay đổi
        if (isEventChanged) {
          await api.put(
            `MedicalEvents/${editingEvent.medicalEventID}`,
            eventData
          );
        }
      } else {
        // Tạo mới sự cố
        const createResponse = await api.post("MedicalEvents", eventData);
        const newEventId = createResponse.data.medicalEventID;
        // Cập nhật medicalEventID để dùng cho việc thêm thuốc
        eventData.medicalEventID = newEventId;
      }

      // Xử lý thuốc (chỉ khi tạo mới)
      if (!editingEvent && itemsData.length > 0) {
        for (const item of itemsData) {
          await api.post("MedicalEventInventory", {
            medicalEventID: eventData.medicalEventID,
            itemID: item.itemID,
            quantityUsed: item.quantityUsed,
          });
        }
      }

      toast.success(
        editingEvent ? "Cập nhật sự cố thành công!" : "Thêm sự cố thành công!"
      );
      handleCloseDrawer();
      fetchMedicalEvents();
    } catch (error) {
      toast.error("Thao tác thất bại: " + error.message);
    }
  };

  const handleSearch = async (values) => {
    const { keyword, status } = values;
    let filteredData = [...originalData];

    // Lọc theo từ khóa (tên học sinh)
    if (keyword) {
      const searchText = keyword.toLowerCase();
      filteredData = filteredData.filter((item) =>
        item.studentFullName.toLowerCase().includes(searchText)
      );
    }

    // Lọc theo trạng thái
    if (status && status !== "All") {
      filteredData = filteredData.filter((item) => item.status === status);
    }

    setTableData(filteredData);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "medicalEventID",
      key: "medicalEventID",
      width: 80,
    },
    {
      title: "Họ và tên học sinh",
      dataIndex: "studentFullName",
      key: "studentFullName",
    },
    { title: "Loại sự cố", dataIndex: "eventType", key: "eventType" },
    {
      title: "Thời gian xảy ra",
      dataIndex: "eventTime",
      key: "eventTime",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(b.eventTime) - new Date(a.eventTime),
      defaultSortOrder: "descend",
    },
    {
      title: "Y tá phụ trách",
      dataIndex: "nurseFullName",
      key: "nurseFullName",
    },
    {
      title: "Kết quả",
      dataIndex: "outcome",
      key: "outcome",
      render: (outcome) => outcome || "Chưa có",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          "Đã xử lý": { color: "green", text: "Đã xử lý" },
          "Đang xử lý": { color: "orange", text: "Đang xử lý" },
          "Đang theo dõi": { color: "blue", text: "Đang theo dõi" },
        };
        const { color, text } = statusMap[status] || {
          color: "orange",
          text: status,
        };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 280,
      render: (_, record) => {
        const canEdit = isEventEditable(record.eventDate);

        return (
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
              disabled={!canEdit}
              title={
                !canEdit
                  ? "Không thể sửa sự cố đã tạo quá 24 giờ, vui lòng liên hệ admin để xử lí"
                  : ""
              }
            >
              Sửa
            </Button>
            {record.status === "Đang xử lý" && (
              <Popconfirm
                title="Chuyển sang trạng thái đang theo dõi?"
                onConfirm={() =>
                  handleUpdateStatus(record.medicalEventID, "Đang theo dõi")
                }
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  style={{ background: "#1890ff", borderColor: "#1890ff" }}
                  icon={<PieChartOutlined />}
                >
                  Theo dõi
                </Button>
              </Popconfirm>
            )}
            {record.status === "Đang theo dõi" && (
              <Popconfirm
                title="Xác nhận đã xử lý xong?"
                onConfirm={() =>
                  handleUpdateStatus(record.medicalEventID, "Đã xử lý")
                }
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
        );
      },
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
            <Select.Option value="Đang theo dõi">Đang theo dõi</Select.Option>
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
        rowKey="medicalEventID"
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
          <Form.Item name="medicalEventID" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="Họ và tên học sinh"
            name="studentFullName"
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
          <Form.Item label="Kết quả xử lý" name="outcome">
            <Input.TextArea rows={3} placeholder="Nhập kết quả xử lý sự cố" />
          </Form.Item>
          <Form.Item
            label="Cần theo dõi"
            name="followUpRequired"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Title level={5}>Thuốc sử dụng</Title>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => {
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
                          disabled={editingEvent}
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
                        name={[field.name, "quantityUsed"]}
                        rules={[{ required: true, message: "Nhập số lượng!" }]}
                        noStyle
                      >
                        <InputNumber
                          min={1}
                          max={5}
                          placeholder="Số lượng"
                          disabled={editingEvent}
                        />
                      </Form.Item>
                      {!editingEvent && (
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </Space>
                  );
                })}
                {!editingEvent && (
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
                )}
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>

      <Modal
        title={`Chi tiết sự cố y tế của ${selectedEvent?.studentFullName}`}
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
