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
  DatePicker,
  Card,
  Row,
  Col,
} from "antd";
import api from "../config/axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { Title } = Typography;

// Màu sắc cho các trạng thái
const statusColor = {
  Pending: "warning",
  Accepted: "success",
  Rejected: "error",
};

// Mã loại sự kiện tiêm vaccine
const VACCINE_EVENT_TYPE_ID = 2;
const EVENT_DURATION_HOURS = 24; // Thời gian cho phép báo cáo (24 giờ)

const VaccineEventReport = () => {
  // Khai báo các state
  const [events, setEvents] = useState([]); // Danh sách sự kiện
  const [selectedEvent, setSelectedEvent] = useState(""); // Sự kiện được chọn
  const [students, setStudents] = useState([]); // Danh sách học sinh
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [error, setError] = useState(""); // Thông báo lỗi
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái hiển thị modal
  const [modalStudent, setModalStudent] = useState(null); // Học sinh được chọn để báo cáo
  const [form] = Form.useForm(); // Form báo cáo
  const [submitting, setSubmitting] = useState(false); // Trạng thái đang gửi báo cáo
  const [viewedVaccine, setViewedVaccine] = useState(null); // Báo cáo đang xem
  const [viewedStudent, setViewedStudent] = useState(null); // Học sinh đang xem báo cáo
  const [viewedLoading, setViewedLoading] = useState(false); // Trạng thái loading khi xem báo cáo
  const [hasReport, setHasReport] = useState({}); // Danh sách học sinh đã có báo cáo

  // Kiểm tra thời gian bắt đầu sự kiện
  const isEventStarted = (eventDate) => {
    if (!eventDate) return false;
    const now = dayjs();
    const startTime = dayjs(eventDate);
    const endTime = startTime.add(EVENT_DURATION_HOURS, "hour");
    return now.isAfter(startTime) && now.isBefore(endTime);
  };

  // Kiểm tra sự kiện đã kết thúc
  const isEventEnded = (eventDate) => {
    if (!eventDate) return false;
    const endTime = dayjs(eventDate).add(EVENT_DURATION_HOURS, "hour");
    return dayjs().isAfter(endTime);
  };

  // Lấy danh sách sự kiện tiêm vaccine
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventRes = await api.get("Event");
        const allEvents = eventRes.data.$values || eventRes.data;
        // Lọc chỉ lấy sự kiện tiêm vaccine
        setEvents(
          allEvents.filter((e) => e.eventTypeID === VACCINE_EVENT_TYPE_ID)
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
          `VaccineRecord/by-student-event?studentId=${student.studentID}&eventId=${eventId}`
        );
        reports[student.studentID] = !!res.data;
      } catch {
        reports[student.studentID] = false;
      }
    }
    setHasReport(reports);
  };

  // Lấy danh sách học sinh khi chọn sự kiện
  useEffect(() => {
    if (!selectedEvent) {
      setStudents([]);
      return;
    }
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `StudentJoinEvent/${selectedEvent}/Accepted-students`
        );
        const fetchedStudents = res.data.$values;
        setStudents(fetchedStudents);
        await checkStudentReports(selectedEvent, fetchedStudents);
      } catch {
        setError("Không lấy được danh sách học sinh.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
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
      // Cập nhật lại danh sách học sinh
      const res = await api.get(
        `StudentJoinEvent/${selectedEvent}/Accepted-students`
      );
      setStudents(res.data.$values);
      await checkStudentReports(selectedEvent, res.data.$values);
    } catch {
      message.error("Cập nhật phản hồi thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý mở modal báo cáo
  const handleOpenModal = (student) => {
    setModalStudent(student);
    setIsModalOpen(true);
    form.resetFields();

    // Tự động điền tên vaccine và ngày tiêm từ thông tin sự kiện
    const selectedEventData = events.find((e) => e.eventID === selectedEvent);
    if (selectedEventData) {
      form.setFieldsValue({
        vaccineName: selectedEventData.eventName,
        dateAdministered: selectedEventData.eventDate
          ? dayjs(selectedEventData.eventDate)
          : null,
      });
    }
  };

  // Xử lý đóng modal báo cáo
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalStudent(null);
    form.resetFields();
  };

  // Xử lý gửi báo cáo tiêm
  const handleSubmitVaccine = async () => {
    try {
      const nurseResponse = await api.get("Nurse");
      // Lấy ID y tá từ localStorage hoặc redux
      const userID = JSON.parse(localStorage.getItem("persist:root"))?.user
        ? JSON.parse(JSON.parse(localStorage.getItem("persist:root")).user)
            .userID
        : null;
      const nurseInfo = nurseResponse.data.$values.find(
        (nurse) => nurse.accountID === userID
      );
      const values = await form.validateFields();
      setSubmitting(true);
      await api.post("VaccineRecord", {
        studentID: modalStudent.studentID,
        eventID: selectedEvent,
        vaccineName: values.vaccineName,
        dateAdministered: values.dateAdministered.format(),
        administeredByNurseID: nurseInfo.nurseID,
        notes: values.notes || "",
      });
      toast.success("Gửi báo cáo tiêm thành công!");
      handleCloseModal();
      await checkStudentReports(selectedEvent, students);
    } catch (err) {
      if (err?.errorFields) return; // Lỗi validate form
      toast.error("Gửi báo cáo tiêm thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xem báo cáo tiêm
  const handleViewVaccine = async (student) => {
    setViewedVaccine(null);
    setViewedStudent(student);
    setViewedLoading(true);
    try {
      const res = await api.get(
        `VaccineRecord/by-student-event?studentId=${student.studentID}&eventId=${selectedEvent}`
      );
      setViewedVaccine(res.data);
    } catch {
      setViewedVaccine(undefined); // Không có báo cáo
    } finally {
      setViewedLoading(false);
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
        const hasEnded = isEventEnded(event?.eventDate);
        const hasStudentReport = hasReport[record.studentID];

        return (
          <Space>
            <Button
              size="small"
              type="primary"
              onClick={() => handleOpenModal(record)}
              disabled={!isStarted || hasEnded || hasStudentReport}
            >
              Báo cáo tiêm vaccine
            </Button>
            <Button
              danger
              size="small"
              onClick={() =>
                handleStudentResponse(record.studentID, "Rejected")
              }
              disabled={!isStarted || hasEnded || hasStudentReport}
            >
              Vắng mặt
            </Button>
            <Button
              size="small"
              onClick={() => handleViewVaccine(record)}
              type="default"
            >
              Xem lại báo cáo tiêm
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
        Báo cáo tiêm vaccine
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
                placeholder="Chọn sự kiện tiêm vaccine"
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
                const hasEnded = isEventEnded(event?.eventDate);
                return event ? (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <b>Thời gian bắt đầu tiêm:</b>{" "}
                      {event.eventDate
                        ? dayjs(event.eventDate).format("DD/MM/YYYY HH:mm")
                        : "Chưa có thời gian"}
                    </div>
                    <div>
                      <b>Thời gian kết thúc:</b>{" "}
                      {event.eventDate
                        ? dayjs(event.eventDate)
                            .add(EVENT_DURATION_HOURS, "hour")
                            .format("DD/MM/YYYY HH:mm")
                        : "Chưa có thời gian"}
                    </div>
                    {!isStarted && !hasEnded && (
                      <Alert
                        type="warning"
                        message="Chưa đến thời gian bắt đầu tiêm. Vui lòng chờ đến thời gian bắt đầu để thực hiện báo cáo."
                        style={{ marginTop: 8 }}
                      />
                    )}
                    {hasEnded && (
                      <Alert
                        type="error"
                        message="Đã quá thời gian báo cáo (24 giờ sau khi bắt đầu). Không thể thực hiện báo cáo."
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
      </Row>

      {/* Modal nhập báo cáo tiêm vaccine */}
      <Modal
        open={isModalOpen}
        title={
          <Title level={4} style={{ margin: 0 }}>
            Báo cáo tiêm vaccine: {modalStudent?.studentName}
          </Title>
        }
        onCancel={handleCloseModal}
        onOk={handleSubmitVaccine}
        okText="Gửi báo cáo"
        cancelText="Huỷ"
        confirmLoading={submitting}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên vaccine"
            name="vaccineName"
            rules={[
              {
                required: true,
                message: "Tên vaccine được lấy từ tên sự kiện",
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Ngày tiêm"
            name="dateAdministered"
            rules={[{ required: true, message: "Chọn ngày tiêm" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày tiêm"
            />
          </Form.Item>
          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú về việc tiêm (nếu có)"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem lại báo cáo tiêm vaccine */}
      <Modal
        open={!!viewedStudent}
        title={
          <Title level={4} style={{ margin: 0 }}>
            Báo cáo tiêm vaccine của: {viewedStudent?.studentName}
          </Title>
        }
        onCancel={() => {
          setViewedStudent(null);
          setViewedVaccine(null);
        }}
        footer={null}
        width={800}
      >
        {viewedLoading ? (
          <Spin />
        ) : viewedVaccine === undefined ? (
          <Alert
            type="info"
            message="Chưa có báo cáo tiêm vaccine cho học sinh này trong sự kiện này."
          />
        ) : viewedVaccine ? (
          <Row gutter={[16, 16]}>
            {/* Thông tin cơ bản */}
            <Col span={12}>
              <Card size="small" title="Thông tin cơ bản">
                <p>
                  <b>Tên vaccine:</b> {viewedVaccine.vaccineName}
                </p>
                <p>
                  <b>Ngày tiêm:</b>{" "}
                  {viewedVaccine.dateAdministered
                    ? dayjs(viewedVaccine.dateAdministered).format("DD/MM/YYYY")
                    : ""}
                </p>
              </Card>
            </Col>
            {/* Thông tin y tá */}
            <Col span={12}>
              <Card size="small" title="Thông tin y tá">
                <p>
                  <b>Người tiêm:</b> {viewedVaccine.nurseName}
                </p>
                <p>
                  <b>Ghi chú:</b> {viewedVaccine.notes || "Không có"}
                </p>
              </Card>
            </Col>
          </Row>
        ) : null}
      </Modal>
    </Card>
  );
};

export default VaccineEventReport;
