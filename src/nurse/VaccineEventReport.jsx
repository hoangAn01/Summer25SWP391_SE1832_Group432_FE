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
} from "antd";
import api from "../config/axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { Title } = Typography;

const statusColor = {
  Pending: "warning",
  Accepted: "success",
  Rejected: "error",
};

const VACCINE_EVENT_TYPE_ID = 2; // Tiêm vaccine

const VaccineEventReport = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [viewedVaccine, setViewedVaccine] = useState(null);
  const [viewedStudent, setViewedStudent] = useState(null);
  const [viewedLoading, setViewedLoading] = useState(false);

  // Fetch events (chỉ lấy eventTypeID = 2)
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventRes = await api.get("Event");
        const allEvents = eventRes.data.$values || eventRes.data;
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

  // Fetch students when event is selected
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
        setStudents(res.data.$values);
      } catch {
        setError("Không lấy được danh sách học sinh.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedEvent]);

  // Đánh dấu vắng mặt cho học sinh đã tham gia nhưng không tiêm
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
      // Reload lại danh sách học sinh đã tham gia
      const res = await api.get(
        `StudentJoinEvent/${selectedEvent}/Accepted-students`
      );
      setStudents(res.data.$values);
    } catch {
      message.error("Cập nhật phản hồi thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student) => {
    setModalStudent(student);
    setIsModalOpen(true);
    form.resetFields();

    // Set vaccine name from event name
    const selectedEventData = events.find((e) => e.eventID === selectedEvent);
    if (selectedEventData) {
      form.setFieldsValue({
        vaccineName: selectedEventData.eventName,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalStudent(null);
    form.resetFields();
  };

  const handleSubmitVaccine = async () => {
    try {
      const nurseResponse = await api.get("Nurse");
      // Giả sử userID lưu ở localStorage hoặc redux, bạn thay thế cho đúng
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
    } catch (err) {
      if (err?.errorFields) return; // validation error
      toast.error("Gửi báo cáo tiêm thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

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
      setViewedVaccine(undefined);
    } finally {
      setViewedLoading(false);
    }
  };

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
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => handleOpenModal(record)}
          >
            Báo cáo tiêm vaccine
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleStudentResponse(record.studentID, "Rejected")}
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
      ),
      width: 300,
    },
  ];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 24,
        background: "#fff",
        borderRadius: 8,
        marginTop: 32,
      }}
    >
      <Title level={3} style={{ textAlign: "center" }}>
        Báo cáo tiêm vaccine
      </Title>
      {error && (
        <Alert type="error" message={error} style={{ marginBottom: 16 }} />
      )}
      <Space style={{ marginBottom: 8 }}>
        <span>Sự kiện:</span>
        <Select
          style={{ width: 260 }}
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
      {selectedEvent &&
        (() => {
          const event = events.find((e) => e.eventID === selectedEvent);
          return event ? (
            <div style={{ marginBottom: 16 }}>
              <b>Thời gian bắt đầu tiêm:</b>{" "}
              {event.eventDate
                ? dayjs(event.eventDate).format("DD/MM/YYYY HH:mm")
                : "Chưa có thời gian"}
            </div>
          ) : null;
        })()}
      <Spin spinning={loading}>
        {selectedEvent && (
          <Table
            columns={columns}
            dataSource={students}
            rowKey="studentID"
            pagination={false}
            bordered
            style={{ marginTop: 16 }}
            locale={{ emptyText: "Không có học sinh nào" }}
          />
        )}
      </Spin>
      {/* Modal nhập báo cáo tiêm vaccine */}
      <Modal
        open={isModalOpen}
        title={
          modalStudent
            ? `Báo cáo tiêm vaccine: ${modalStudent.studentName}`
            : "Báo cáo tiêm vaccine"
        }
        onCancel={handleCloseModal}
        onOk={handleSubmitVaccine}
        okText="Gửi báo cáo"
        cancelText="Huỷ"
        confirmLoading={submitting}
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
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal xem lại báo cáo tiêm vaccine */}
      <Modal
        open={!!viewedStudent}
        title={
          viewedStudent
            ? `Báo cáo tiêm vaccine của: ${viewedStudent.studentName}`
            : "Báo cáo tiêm vaccine"
        }
        onCancel={() => {
          setViewedStudent(null);
          setViewedVaccine(null);
        }}
        footer={null}
      >
        {viewedLoading ? (
          <Spin />
        ) : viewedVaccine === undefined ? (
          <Alert
            type="info"
            message="Chưa có báo cáo tiêm vaccine cho học sinh này trong sự kiện này."
          />
        ) : viewedVaccine ? (
          <div style={{ background: "#fafafa", padding: 16, borderRadius: 8 }}>
            <p>
              <b>Tên vaccine:</b> {viewedVaccine.vaccineName}
            </p>
            <p>
              <b>Ngày tiêm:</b>{" "}
              {viewedVaccine.dateAdministered
                ? dayjs(viewedVaccine.dateAdministered).format("DD/MM/YYYY")
                : ""}
            </p>
            <p>
              <b>Người tiêm:</b> {viewedVaccine.nurseName}
            </p>
            <p>
              <b>Ghi chú:</b> {viewedVaccine.notes}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default VaccineEventReport;
