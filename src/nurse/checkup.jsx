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
} from "antd";
import api from "../config/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { Title } = Typography;

const statusColor = {
  Pending: "warning",
  Accepted: "success",
  Rejected: "error",
};

const HEALTH_EVENT_TYPE_ID = 1; // Khám sức khỏe định kỳ

const CheckUp = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = useSelector((state) => state.user); // nurseID

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [viewedCheckup, setViewedCheckup] = useState(null);
  const [viewedStudent, setViewedStudent] = useState(null);

  // Fetch events (chỉ lấy eventTypeID = 1)
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventRes = await api.get("Event");
        const allEvents = eventRes.data.$values;
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

  const fetchStudentsByEvent = async (eventId) => {
    setLoading(true);
    try {
      const res = await api.get(
        `StudentJoinEvent/${eventId}/Accepted-students`
      );
      setStudents(res.data.$values);
    } catch {
      message.error("Không lấy được danh sách học sinh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEvent) fetchStudentsByEvent(selectedEvent);
    else setStudents([]);
  }, [selectedEvent]);

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

  const handleOpenModal = (student) => {
    setModalStudent(student);
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalStudent(null);
    form.resetFields();
  };

  const handleSubmitCheckup = async () => {
    try {
      const nurseResponse = await api.get("Nurse");
      const nurseInfo = nurseResponse.data.$values.find(
        (nurse) => nurse.accountID === user.userID
      );
      console.log(nurseResponse);
      console.log(nurseInfo);
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
      if (err?.errorFields) return; // validation error
      toast.error("Gửi kết quả khám thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

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
          {(record.status === "Pending" || record.status === "Accepted") && (
            <>
              <Button
                danger
                size="small"
                onClick={() =>
                  handleStudentResponse(record.studentID, "Rejected")
                }
                disabled={record.status === "Rejected"}
              >
                Vắng mặt
              </Button>
            </>
          )}
          <Button
            size="small"
            onClick={() => handleOpenModal(record)}
            type="dashed"
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
        Báo cáo khám sức khỏe định kỳ
      </Title>
      {error && (
        <Alert type="error" message={error} style={{ marginBottom: 16 }} />
      )}
      <Space style={{ marginBottom: 8 }}>
        <span>Sự kiện:</span>
        <Select
          style={{ width: 260 }}
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
      {selectedEvent &&
        (() => {
          const event = events.find((e) => e.eventID === selectedEvent);
          return event ? (
            <div style={{ marginBottom: 16 }}>
              <b>Thời gian bắt đầu khám:</b>{" "}
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
      {/* Hiển thị báo cáo gần nhất */}
      {viewedStudent && (
        <div style={{ marginTop: 32 }}>
          <Title level={4}>
            Báo cáo gần nhất của học sinh: {viewedStudent.studentName}
          </Title>
          {viewedCheckup === null && <Spin />}
          {viewedCheckup === undefined && (
            <Alert
              type="info"
              message="Chưa có báo cáo khám sức khỏe cho học sinh này trong sự kiện này."
            />
          )}
          {viewedCheckup && (
            <div
              style={{ background: "#fafafa", padding: 16, borderRadius: 8 }}
            >
              <p>
                <b>Ngày khám:</b> {viewedCheckup.checkupDate}
              </p>
              <p>
                <b>Y tá phụ trách:</b> {viewedCheckup.nurseName}
              </p>
              <p>
                <b>Chiều cao:</b> {viewedCheckup.height} cm
              </p>
              <p>
                <b>Cân nặng:</b> {viewedCheckup.weight} kg
              </p>
              {/* BMI hiển thị */}
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
              <p>
                <b>Huyết áp:</b> {viewedCheckup.bloodPressure}
              </p>
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
              <p>
                <b>Phát hiện khác:</b> {viewedCheckup.otherFindings}
              </p>
              <p>
                <b>Cần tư vấn thêm:</b>{" "}
                {viewedCheckup.consultationRequired ? "Có" : "Không"}
              </p>
            </div>
          )}
        </div>
      )}
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
          {/* BMI tự động tính */}
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
    </div>
  );
};

export default CheckUp;
