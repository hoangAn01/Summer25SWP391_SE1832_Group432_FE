import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Typography,
  Form,
  Input,
  Button,
  DatePicker,
  Row,
  Col,
  message,
  Select,
  Modal,
  Divider,
  Tag,
  Empty,
  Spin,
  Badge,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  PlusOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import api from "../../../config/axios";
import { toast } from "react-toastify";

function EventCreate() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState(3); // Default to show only 3 events
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [classData, setClassData] = useState([]); // Thêm state cho dữ liệu lớp
  const [gradeOptions, setGradeOptions] = useState([]); // Thêm state cho options khối

  // Lấy danh sách loại sự kiện
  const fetchEventTypes = async () => {
    try {
      const res = await api.get("EventType");
      setEventTypes(res.data.$values || res.data);
    } catch (error) {
      message.error(
        "Không thể tải loại sự kiện: " + (error.message || "Lỗi không xác định")
      );
    }
  };

  // Lấy danh sách lớp học để tạo options khối
  const fetchClassData = async () => {
    try {
      const res = await api.get("Class");
      const classes = res.data.$values || res.data;
      setClassData(classes);
      
      // Tạo options khối từ dữ liệu lớp học
      const uniqueGrades = [...new Set(classes.map(cls => cls.grade))].sort();
      const options = uniqueGrades.map(grade => ({
        label: grade,
        value: grade
      }));
      setGradeOptions(options);
    } catch (error) {
      message.error(
        "Không thể tải dữ liệu lớp học: " + (error.message || "Lỗi không xác định")
      );
    }
  };

  // Lấy danh sách sự kiện đã tạo (có thể lọc theo loại nếu muốn)
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("Event");
      const eventsData = response.data.$values || response.data;

      // Sort events by date (most recent first)
      const sortedEvents = [...eventsData].sort(
        (a, b) => new Date(b.eventDate) - new Date(a.eventDate)
      );

      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);
      setVisibleEvents(3); // Reset to show only 3 events when fetching new data
    } catch (error) {
      message.error(
        "Không thể tải danh sách sự kiện: " +
          (error.message || "Lỗi không xác định")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
    fetchClassData(); // Thêm fetch dữ liệu lớp học
    fetchEvents();
  }, []);

  // Filter events when selectedEventType changes
  useEffect(() => {
    if (selectedEventType) {
      const filtered = events.filter(
        (event) => event.eventTypeID === selectedEventType
      );
      setFilteredEvents(filtered);
      setVisibleEvents(3); // Reset to show only 3 events when filter changes
    } else {
      setFilteredEvents(events);
      setVisibleEvents(3); // Reset to show only 3 events when filter changes
    }
  }, [selectedEventType, events]);

  const handleFilterChange = (value) => {
    setSelectedEventType(value);
  };

  const handleShowMore = () => {
    setVisibleEvents((prev) => prev + 3); // Show 3 more events when "See More" is clicked
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      
      // Chuyển đổi từ grade sang classID để gửi lên API
      let targetClassIds = [];
      if (Array.isArray(values.targetClass)) {
        // Lấy tất cả classID của các grade được chọn
        values.targetClass.forEach(grade => {
          const classesInGrade = classData.filter(cls => cls.grade === grade);
          const classIds = classesInGrade.map(cls => cls.classID.toString());
          targetClassIds = [...targetClassIds, ...classIds];
        });
      } else if (values.targetClass) {
        // Trường hợp chỉ chọn 1 grade
        const classesInGrade = classData.filter(cls => cls.grade === values.targetClass);
        targetClassIds = classesInGrade.map(cls => cls.classID.toString());
      }

      const newEvent = {
        eventTypeID: values.eventTypeID,
        eventName: values.eventName,
        eventDate: values.eventDate.toISOString(),
        description: values.description,
        targetClass: targetClassIds.join(","),
      };
      
      const eventResponse = await api.post("Event", newEvent);
      const createdEvent = eventResponse.data;
      
      // Tự động tạo thông báo ConsentRequest cho tất cả học sinh trong các lớp được chọn
      if (createdEvent && createdEvent.eventID) {
        try {
          // Lấy danh sách học sinh từ các lớp được chọn
          const allStudents = [];
          for (const classId of targetClassIds) {
            const studentsResponse = await api.get(`Student/by-class/${classId}`);
            const students = studentsResponse.data.$values || studentsResponse.data;
            if (Array.isArray(students)) {
              allStudents.push(...students);
            }
          }
          
          // Tạo thông báo ConsentRequest cho từng học sinh
          for (const student of allStudents) {
            try {
              // Lấy thông tin phụ huynh của học sinh
              const parentResponse = await api.get(`Parent/${student.parentID}`);
              const parent = parentResponse.data;
              
              if (parent && parent.accountID) {
                const notificationData = {
                  notificationType: "ConsentRequest",
                  title: `Thông báo xác nhận học sinh ${student.fullName} tham gia sự kiện: ${values.eventName}`,
                  content: `Phụ huynh vui lòng xác nhận cho học sinh ${student.fullName} tham gia sự kiện "${values.eventName}" vào ngày ${new Date(values.eventDate).toLocaleDateString('vi-VN')}`,
                  sentDate: new Date().toISOString(),
                  status: "Pending",
                  relatedEntityID: createdEvent.eventID,
                  accountID: parent.accountID
                };
                
                await api.post("Notifications", notificationData);
              }
            } catch (parentError) {
              console.error(`Lỗi khi lấy thông tin phụ huynh cho học sinh ${student.fullName}:`, parentError);
            }
          }
          
          console.log(`Đã tạo ${allStudents.length} thông báo xác nhận sự kiện`);
        } catch (notificationError) {
          console.error("Lỗi khi tạo thông báo:", notificationError);
          // Không hiển thị lỗi cho user vì sự kiện đã tạo thành công
        }
      }
      
      toast.success("Tạo sự kiện thành công!");
      fetchEvents();
      form.resetFields();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Không thể tạo sự kiện. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const showEventDetail = (event) => {
    setSelectedEvent(event);
    setDetailModalVisible(true);
  };

  const handleModalClose = () => {
    setDetailModalVisible(false);
  };

  // Hàm hiển thị màu sắc cho các loại sự kiện
  const getEventTypeColor = (eventTypeID) => {
    // Tạo một bảng màu cố định cho các loại sự kiện
    const colorMap = {
      1: "green",
      2: "blue",
      3: "purple",
      4: "orange",
      5: "cyan",
      6: "magenta",
    };

    return colorMap[eventTypeID] || "default";
  };

  // Hàm định dạng hiển thị khối lớp
  const formatTargetClass = (targetClass) => {
    if (!targetClass) return "Tất cả";

    const classIds = targetClass.split(",");
    const grades = [];
    
    classIds.forEach(classId => {
      const classInfo = classData.find(cls => cls.classID.toString() === classId);
      if (classInfo && !grades.includes(classInfo.grade)) {
        grades.push(classInfo.grade);
      }
    });
    
    return grades.map((grade) => (
      <Tag key={grade} color="blue" style={{ marginBottom: "5px" }}>
        {grade}
      </Tag>
    ));
  };

  // Get the visible subset of events
  const currentEvents = filteredEvents.slice(0, visibleEvents);

  // Check if there are more events to show
  const hasMoreEvents = filteredEvents.length > visibleEvents;

  return (
    <div className="event-create-container" style={{ padding: "20px" }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <CalendarOutlined
                  style={{ marginRight: "10px", color: "#1890ff" }}
                />
                <span>Lịch sử sự kiện</span>
                <Badge
                  count={filteredEvents.length}
                  style={{ backgroundColor: "#52c41a", marginLeft: "10px" }}
                  overflowCount={99}
                />
              </div>
            }
            bordered={true}
            className="event-history-card"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              borderRadius: "8px",
              height: "100%",
            }}
            extra={
              <Select
                placeholder="Lọc theo loại"
                style={{ width: 150 }}
                allowClear
                onChange={handleFilterChange}
                suffixIcon={<FilterOutlined />}
              >
                <Select.Option key="all" value={null}>
                  Tất cả
                </Select.Option>
                {eventTypes.map((type) => (
                  <Select.Option
                    key={type.eventTypeID}
                    value={type.eventTypeID}
                  >
                    {type.typeName}
                  </Select.Option>
                ))}
              </Select>
            }
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" />
                <p style={{ marginTop: "10px" }}>Đang tải dữ liệu...</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div>
                <List
                  itemLayout="vertical"
                  dataSource={currentEvents}
                  renderItem={(item) => (
                    <List.Item
                      key={item.eventID}
                      className="event-list-item"
                      style={{
                        padding: "16px",
                        borderRadius: "6px",
                        marginBottom: "10px",
                        border: "1px solid #f0f0f0",
                        transition: "all 0.3s",
                        cursor: "pointer",
                      }}
                      onClick={() => showEventDetail(item)}
                      actions={[
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            showEventDetail(item);
                          }}
                        >
                          Chi tiết
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography.Text
                              strong
                              style={{ fontSize: "16px" }}
                            >
                              {item.eventName}
                            </Typography.Text>
                            <Tag color={getEventTypeColor(item.eventTypeID)}>
                              {item.eventType?.typeName || item.eventTypeID}
                            </Tag>
                          </div>
                        }
                        description={
                          <>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: "8px",
                              }}
                            >
                              <ClockCircleOutlined
                                style={{ marginRight: "8px", color: "#1890ff" }}
                              />
                              <span>
                                {new Date(item.eventDate).toLocaleString(
                                  "vi-VN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                marginTop: "8px",
                              }}
                            >
                              <TeamOutlined
                                style={{
                                  marginRight: "8px",
                                  marginTop: "4px",
                                  color: "#1890ff",
                                }}
                              />
                              <div>{formatTargetClass(item.targetClass)}</div>
                            </div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />

                {hasMoreEvents && (
                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <Button
                      type="dashed"
                      onClick={handleShowMore}
                      icon={<DownOutlined />}
                      style={{ width: "100%" }}
                    >
                      Xem thêm ({filteredEvents.length - visibleEvents} sự kiện)
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có sự kiện nào"
                style={{ margin: "40px 0" }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <PlusOutlined
                  style={{ marginRight: "10px", color: "#1890ff" }}
                />
                <span>Tạo sự kiện mới</span>
              </div>
            }
            bordered={true}
            className="event-create-form-card"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              borderRadius: "8px",
              height: "100%",
            }}
          >
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              requiredMark="optional"
              className="event-form"
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <FileTextOutlined style={{ marginRight: "8px" }} />
                        Loại sự kiện
                      </span>
                    }
                    name="eventTypeID"
                    rules={[
                      { required: true, message: "Vui lòng chọn loại sự kiện" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn loại sự kiện"
                      size="large"
                      style={{ borderRadius: "6px" }}
                    >
                      {eventTypes.map((type) => (
                        <Select.Option
                          key={type.eventTypeID}
                          value={type.eventTypeID}
                        >
                          {type.typeName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <CalendarOutlined style={{ marginRight: "8px" }} />
                    Tên sự kiện
                  </span>
                }
                name="eventName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sự kiện" },
                ]}
              >
                <Input
                  placeholder="Nhập tên sự kiện"
                  size="large"
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <FileTextOutlined style={{ marginRight: "8px" }} />
                    Mô tả
                  </span>
                }
                name="description"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <Input.TextArea
                  placeholder="Nhập mô tả sự kiện"
                  rows={4}
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <TeamOutlined style={{ marginRight: "8px" }} />
                        Khối áp dụng
                      </span>
                    }
                    name="targetClass"
                    rules={[
                      { required: true, message: "Vui lòng chọn khối áp dụng" },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn khối áp dụng"
                      size="large"
                      style={{ width: "100%", borderRadius: "6px" }}
                      options={gradeOptions}
                      loading={gradeOptions.length === 0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <ClockCircleOutlined style={{ marginRight: "8px" }} />
                        Thời gian tổ chức
                      </span>
                    }
                    name="eventDate"
                    rules={[
                      { required: true, message: "Vui lòng chọn thời gian" },
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: "100%", borderRadius: "6px" }}
                      size="large"
                      disabledDate={(current) => {
                        // Lấy thời điểm hiện tại
                        const now = new Date();
                        // Tạo ngày bắt đầu của hôm nay (00:00:00)
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        // Chỉ cho phép chọn từ hôm nay trở đi
                        return current && current < today;
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                <Button
                  type="default"
                  style={{ marginRight: "10px", borderRadius: "6px" }}
                  onClick={() => form.resetFields()}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<CheckCircleOutlined />}
                  loading={submitting}
                  style={{ borderRadius: "6px", minWidth: "120px" }}
                >
                  {submitting ? "Đang tạo..." : "Tạo sự kiện"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined
              style={{ marginRight: "10px", color: "#1890ff" }}
            />
            <span>Chi tiết sự kiện</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button
            key="close"
            onClick={handleModalClose}
            style={{ borderRadius: "6px" }}
          >
            Đóng
          </Button>,
        ]}
        width={600}
        style={{ top: 20 }}
        bodyStyle={{ padding: "20px" }}
      >
        {selectedEvent && (
          <div className="event-detail">
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <Typography.Title
                level={3}
                style={{ margin: 0, color: "#1890ff" }}
              >
                {selectedEvent.eventName}
              </Typography.Title>
              <Tag
                color={getEventTypeColor(selectedEvent.eventTypeID)}
                style={{ marginTop: "8px" }}
              >
                {selectedEvent.eventType?.typeName || selectedEvent.eventTypeID}
              </Tag>
            </div>

            <Row gutter={[16, 24]}>
              <Col span={24}>
                <div className="detail-item">
                  <div
                    className="detail-label"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <FileTextOutlined
                      style={{ marginRight: "8px", color: "#1890ff" }}
                    />
                    <Typography.Text strong>Mô tả:</Typography.Text>
                  </div>
                  <div
                    className="detail-content"
                    style={{
                      backgroundColor: "#fafafa",
                      padding: "12px",
                      borderRadius: "6px",
                      marginTop: "8px",
                    }}
                  >
                    {selectedEvent.description || "Không có mô tả"}
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="detail-item">
                  <div
                    className="detail-label"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <ClockCircleOutlined
                      style={{ marginRight: "8px", color: "#1890ff" }}
                    />
                    <Typography.Text strong>Thời gian:</Typography.Text>
                  </div>
                  <div className="detail-content" style={{ marginTop: "8px" }}>
                    {new Date(selectedEvent.eventDate).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="detail-item">
                  <div
                    className="detail-label"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <TeamOutlined
                      style={{ marginRight: "8px", color: "#1890ff" }}
                    />
                    <Typography.Text strong>Khối áp dụng:</Typography.Text>
                  </div>
                  <div className="detail-content" style={{ marginTop: "8px" }}>
                    {formatTargetClass(selectedEvent.targetClass)}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default EventCreate;
