import React, { useEffect, useState } from "react";
import {
  Select,
  Table,
  Button,
  Tag,
  Spin,
  Alert,
  Typography,
  Space,
  message,
  Modal,
  Form,
  Input,
  Checkbox,
  InputNumber,
  Card,
  Row,
  Col,
} from "antd";
import api from "../config/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { Title } = Typography;

// Màu sắc cho các trạng thái
const statusColor = {
  Pending: "warning",
  Accepted: "success",
  Rejected: "error",
};

// Mã loại sự kiện khám sức khỏe định kỳ
const HEALTH_EVENT_TYPE_ID = 1;

const CheckUp = () => {
  // Khai báo các state
  const [events, setEvents] = useState([]); // Danh sách sự kiện
  const [selectedEvent, setSelectedEvent] = useState(""); // Sự kiện được chọn
  const [students, setStudents] = useState([]); // Danh sách học sinh
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [error, setError] = useState(""); // Thông báo lỗi
  const user = useSelector((state) => state.user); // ID của y tá

  // State cho modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái hiển thị modal
  const [modalStudent, setModalStudent] = useState(null); // Học sinh được chọn để báo cáo
  const [form] = Form.useForm(); // Form báo cáo
  const [submitting, setSubmitting] = useState(false); // Trạng thái đang gửi báo cáo

  // State cho xem báo cáo
  const [viewedCheckup, setViewedCheckup] = useState(null); // Báo cáo đang xem
  const [viewedStudent, setViewedStudent] = useState(null); // Học sinh đang xem báo cáo
  const [hasReport, setHasReport] = useState({}); // Danh sách học sinh đã có báo cáo

  // Kiểm tra thời gian bắt đầu sự kiện
  const isEventStarted = (eventDate) => {
    if (!eventDate) return false;
    return dayjs(eventDate).isBefore(dayjs());
  };

  // Lấy danh sách sự kiện khám sức khỏe
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventRes = await api.get("Event");
        const allEvents = eventRes.data.$values;
        // Lọc chỉ lấy sự kiện khám sức khỏe
        setEvents(
          allEvents.filter((e) => e.eventTypeID === HEALTH_EVENT_TYPE_ID)
        );
      } catch {
        setError("Không lấy được danh sách sự kiện.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Kiểm tra báo cáo của học sinh
  const checkStudentReports = async (eventId, students) => {
    const reports = {};
    for (const student of students) {
      try {
        const res = await api.get(
          `CheckupRecord/by-student-event?studentId=${student.studentID}&eventId=${eventId}`
        );
        reports[student.studentID] = !!res.data;
      } catch {
        reports[student.studentID] = false;
      }
    }
    setHasReport(reports);
  };

  // Lấy danh sách học sinh tham gia sự kiện
  const fetchStudentsByEvent = async (eventId) => {
    setLoading(true);
    try {
      const res = await api.get(
        `StudentJoinEvent/${eventId}/Accepted-students`
      );
      const fetchedStudents = res.data.$values;
      setStudents(fetchedStudents);
      await checkStudentReports(eventId, fetchedStudents);
    } catch {
      message.error("Không lấy được danh sách học sinh.");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật danh sách học sinh khi chọn sự kiện
  useEffect(() => {
    if (selectedEvent) fetchStudentsByEvent(selectedEvent);
    else setStudents([]);
  }, [selectedEvent]);

  // Xử lý đánh dấu học sinh vắng mặt
  const handleStudentResponse = async (studentId, status) => {
    setLoading(true);
    try {
      await api.put("StudentJoinEvent/respond-by-student", {
        studentId,
        eventId: selectedEvent,
        status,
        note: "",
      });
      message.success("Cập nhật thành công!");
      fetchStudentsByEvent(selectedEvent);
    } catch {
      message.error("Cập nhật phản hồi thất bại");
      setLoading(false);
    }
  };

  // Xử lý mở modal báo cáo
  const handleOpenModal = (student) => {
    setModalStudent(student);
    setIsModalOpen(true);
    form.resetFields();
  };

  // Xử lý đóng modal báo cáo
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalStudent(null);
    form.resetFields();
  };

  // Xử lý gửi báo cáo khám
  const handleSubmitCheckup = async () => {
    try {
      const nurseResponse = await api.get("Nurse");
      const nurseInfo = nurseResponse.data.$values.find(
        (nurse) => nurse.accountID === user.userID
      );
      const values = await form.validateFields();
      setSubmitting(true);
      await api.post("CheckupRecord", {
        ...values,
        studentID: modalStudent.studentID,
        nurseID: nurseInfo.nurseID,
        eventID: selectedEvent,
      });
      toast.success("Gửi kết quả khám thành công!");
      handleCloseModal();
      fetchStudentsByEvent(selectedEvent);
    } catch (err) {
      if (err?.errorFields) return; // Lỗi validate form
      toast.error("Gửi kết quả khám thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xem báo cáo khám
  const handleViewCheckup = async (student) => {
    setViewedCheckup(null);
    setViewedStudent(student);
    try {
      setLoading(true);
      const res = await api.get(
        `CheckupRecord/by-student-event?studentId=${student.studentID}&eventId=${selectedEvent}`
      );
      setViewedCheckup(res.data);
    } catch {
      setViewedCheckup(undefined); // Không có báo cáo
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình các cột trong bảng
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      render: (_, __, idx) => idx + 1,
      width: 60,
    },
    {
      title: "Mã học sinh",
      dataIndex: "studentID",
      width: 100,
    },
    {
      title: "Tên học sinh",
      dataIndex: "studentName",
      width: 180,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={statusColor[status] || "default"}>
          {status === "Pending"
            ? "Chờ phản hồi"
            : status === "Accepted"
            ? "Tham gia"
            : status === "Rejected"
            ? "Vắng mặt"
            : status}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      render: (_, record) => {
        const event = events.find((e) => e.eventID === selectedEvent);
        const isStarted = isEventStarted(event?.eventDate);
        const hasStudentReport = hasReport[record.studentID];

        return (
          <Space>
            {(record.status === "Pending" || record.status === "Accepted") && (
              <Button
                danger
                size="small"
                onClick={() =>
                  handleStudentResponse(record.studentID, "Rejected")
                }
                disabled={!isStarted || hasStudentReport}
              >
                Vắng mặt
              </Button>
            )}
            <Button
              size="small"
              onClick={() => handleOpenModal(record)}
              type="primary"
              disabled={!isStarted || hasStudentReport}
            >
              Báo cáo kết quả khám
            </Button>
            <Button
              size="small"
              onClick={() => handleViewCheckup(record)}
              type="default"
            >
              Xem lại báo cáo
            </Button>
          </Space>
        );
      },
      width: 300,
    },
  ];

  // Giao diện component
  return (
    <Card
      style={{
        maxWidth: 1200,
        margin: "32px auto",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Title
        level={2}
        style={{ textAlign: "center", marginBottom: 32, color: "#1890ff" }}
      >
        Báo cáo khám sức khỏe định kỳ
      </Title>

      {error && (
        <Alert type="error" message={error} style={{ marginBottom: 24 }} />
      )}

      <Row gutter={[16, 24]}>
        {/* Phần chọn sự kiện */}
        <Col span={24}>
          <Card size="small">
            <Space style={{ width: "100%", justifyContent: "flex-start" }}>
              <span style={{ fontWeight: "bold" }}>Sự kiện:</span>
              <Select
                style={{ width: 400 }}
                placeholder="Chọn sự kiện khám sức khỏe"
                value={selectedEvent}
                onChange={setSelectedEvent}
                allowClear
              >
                {events.map((event) => (
                  <Select.Option key={event.eventID} value={event.eventID}>
                    {event.eventName}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Card>
        </Col>

        {/* Hiển thị thông tin sự kiện */}
        {selectedEvent && (
          <Col span={24}>
            <Card size="small">
              {(() => {
                const event = events.find((e) => e.eventID === selectedEvent);
                const isStarted = isEventStarted(event?.eventDate);
                return event ? (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <b>Thời gian bắt đầu khám:</b>{" "}
                      {event.eventDate
                        ? dayjs(event.eventDate).format("DD/MM/YYYY HH:mm")
                        : "Chưa có thời gian"}
                    </div>
                    {!isStarted && (
                      <Alert
                        type="warning"
                        message="Chưa đến thời gian bắt đầu khám. Vui lòng chờ đến thời gian bắt đầu để thực hiện báo cáo."
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </Space>
                ) : null;
              })()}
            </Card>
          </Col>
        )}

        {/* Bảng danh sách học sinh */}
        <Col span={24}>
          <Spin spinning={loading}>
            {selectedEvent && (
              <Table
                columns={columns}
                dataSource={students}
                rowKey="studentID"
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `Tổng số ${total} học sinh`,
                }}
                bordered
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
                locale={{ emptyText: "Không có học sinh nào" }}
              />
            )}
          </Spin>
        </Col>

        {/* Phần xem báo cáo */}
        {viewedStudent && (
          <Col span={24}>
            <Card
              title={
                <Title level={4} style={{ margin: 0 }}>
                  Báo cáo của học sinh: {viewedStudent.studentName}
                </Title>
              }
            >
              {viewedCheckup === null && <Spin />}
              {viewedCheckup === undefined && (
                <Alert
                  type="info"
                  message="Chưa có báo cáo khám sức khỏe cho học sinh này trong sự kiện này."
                />
              )}
              {viewedCheckup && (
                <Row gutter={[16, 16]}>
                  {/* Thông tin cơ bản */}
                  <Col span={12}>
                    <Card size="small" title="Thông tin cơ bản">
                      <p>
                        <b>Ngày khám:</b>{" "}
                        {dayjs(viewedCheckup.checkupDate).format("DD/MM/YYYY")}
                      </p>
                      <p>
                        <b>Y tá phụ trách:</b> {viewedCheckup.nurseName}
                      </p>
                    </Card>
                  </Col>
                  {/* Chỉ số sức khỏe */}
                  <Col span={12}>
                    <Card size="small" title="Chỉ số sức khỏe">
                      <p>
                        <b>Chiều cao:</b> {viewedCheckup.height} cm
                      </p>
                      <p>
                        <b>Cân nặng:</b> {viewedCheckup.weight} kg
                      </p>
                      <p>
                        <b>BMI:</b>{" "}
                        {(() => {
                          if (viewedCheckup.height && viewedCheckup.weight) {
                            const h = Number(viewedCheckup.height) / 100;
                            if (h > 0) {
                              const bmi = (
                                Number(viewedCheckup.weight) /
                                (h * h)
                              ).toFixed(2);
                              const bmiVal = Number(bmi);
                              let bmiType = "";
                              if (bmiVal < 18.5) bmiType = "Gầy";
                              else if (bmiVal < 23) bmiType = "Bình thường";
                              else if (bmiVal < 25) bmiType = "Thừa cân";
                              else bmiType = "Béo phì";
                              return `${bmi} (${bmiType}) kg/m²`;
                            }
                          }
                          return "";
                        })()}
                      </p>
                    </Card>
                  </Col>
                  {/* Thị lực và thính lực */}
                  <Col span={12}>
                    <Card size="small" title="Thị lực & Thính lực">
                      <p>
                        <b>Thị lực trái:</b> {viewedCheckup.visionLeft}
                      </p>
                      <p>
                        <b>Thị lực phải:</b> {viewedCheckup.visionRight}
                      </p>
                      <p>
                        <b>Thính lực trái:</b> {viewedCheckup.hearingLeft}
                      </p>
                      <p>
                        <b>Thính lực phải:</b> {viewedCheckup.hearingRight}
                      </p>
                    </Card>
                  </Col>
                  {/* Thông tin khác */}
                  <Col span={12}>
                    <Card size="small" title="Thông tin khác">
                      <p>
                        <b>Huyết áp:</b> {viewedCheckup.bloodPressure}
                      </p>
                      <p>
                        <b>Phát hiện khác:</b>{" "}
                        {viewedCheckup.otherFindings || "Không có"}
                      </p>
                      <p>
                        <b>Cần tư vấn thêm:</b>{" "}
                        {viewedCheckup.consultationRequired ? "Có" : "Không"}
                      </p>
                    </Card>
                  </Col>
                </Row>
              )}
            </Card>
          </Col>
        )}
      </Row>

      {/* Modal nhập kết quả khám */}
      <Modal
        open={isModalOpen}
        title={
          modalStudent
            ? `Báo cáo kết quả khám: ${modalStudent.studentName}`
            : "Báo cáo kết quả khám"
        }
        onCancel={handleCloseModal}
        onOk={handleSubmitCheckup}
        okText="Gửi báo cáo"
        cancelText="Huỷ"
        confirmLoading={submitting}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ consultationRequired: false }}
        >
          <Form.Item
            label="Chiều cao (cm)"
            name="height"
            rules={[{ required: true, message: "Nhập chiều cao" }]}
          >
            <InputNumber
              min={100}
              max={150}
              step={0.1}
              placeholder="100 - 150 (cm)"
              style={{ width: "100%" }}
              formatter={(value) =>
                value && Number(value) % 1 === 0
                  ? Number(value).toString()
                  : value
              }
            />
          </Form.Item>
          <Form.Item
            label="Cân nặng (kg)"
            name="weight"
            rules={[{ required: true, message: "Nhập cân nặng" }]}
          >
            <InputNumber
              min={20}
              max={50}
              step={0.1}
              placeholder="20-50 (kg)"
              style={{ width: "100%" }}
              formatter={(value) =>
                value && Number(value) % 1 === 0
                  ? Number(value).toString()
                  : value
              }
            />
          </Form.Item>
          {/* Tự động tính BMI */}
          <Form.Item label="BMI (kg/m²)" shouldUpdate>
            {() => {
              const height = form.getFieldValue("height");
              const weight = form.getFieldValue("weight");
              let bmi = "";
              let bmiType = "";
              if (height && weight) {
                const h = Number(height) / 100;
                if (h > 0) {
                  bmi = (Number(weight) / (h * h)).toFixed(2);
                  const bmiVal = Number(bmi);
                  if (bmiVal < 18.5) bmiType = "Gầy";
                  else if (bmiVal < 23) bmiType = "Bình thường";
                  else if (bmiVal < 25) bmiType = "Thừa cân";
                  else bmiType = "Béo phì";
                }
              }
              return (
                <Input
                  value={bmi ? `${bmi} (${bmiType})` : ""}
                  readOnly
                  placeholder="BMI sẽ tự động tính"
                />
              );
            }}
          </Form.Item>
          <Form.Item
            label="Huyết áp"
            name="bloodPressure"
            rules={[{ required: true, message: "Nhập huyết áp" }]}
          >
            <Input placeholder="Ví dụ: 110/70 mmHg" />
          </Form.Item>
          <Form.Item
            label="Thị lực trái"
            name="visionLeft"
            rules={[{ required: true, message: "Nhập thị lực trái" }]}
          >
            <Input placeholder="Ví dụ: 10/10" />
          </Form.Item>
          <Form.Item
            label="Thị lực phải"
            name="visionRight"
            rules={[{ required: true, message: "Nhập thị lực phải" }]}
          >
            <Input placeholder="Ví dụ: 10/10" />
          </Form.Item>
          <Form.Item
            label="Thính lực trái"
            name="hearingLeft"
            rules={[{ required: true, message: "Nhập thính lực trái" }]}
          >
            <Input placeholder="Ví dụ: 10/10" />
          </Form.Item>
          <Form.Item
            label="Thính lực phải"
            name="hearingRight"
            rules={[{ required: true, message: "Nhập thính lực phải" }]}
          >
            <Input placeholder="Ví dụ: 10/10" />
          </Form.Item>
          <Form.Item label="Phát hiện khác" name="otherFindings">
            <Input.TextArea
              rows={2}
              placeholder="Nhập phát hiện khác về học sinh"
            />
          </Form.Item>
          <Form.Item name="consultationRequired" valuePropName="checked">
            <Checkbox>Cần tư vấn thêm</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CheckUp;
