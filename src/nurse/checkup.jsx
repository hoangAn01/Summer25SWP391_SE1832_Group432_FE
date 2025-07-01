import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Modal,
  Button,
  Typography,
  Spin,
  Descriptions,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Space, // Import Space
  Empty, // Import Empty
} from "antd";
import api from "../config/axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const { Title } = Typography;

const CheckupPage = () => {
  // =================================================================
  // State
  // =================================================================
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [studentReports, setStudentReports] = useState([]);
  const [classMap, setClassMap] = useState({});

  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [form] = Form.useForm();
  const user = useSelector((state) => state.user);

  // =================================================================
  // Effects
  // =================================================================
  useEffect(() => {
    fetchSchedules();
    fetchClasses();
  }, []);

  // =================================================================
  // Data Fetching
  // =================================================================
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get("CheckupSchedules");
      setSchedules(res.data.$values || []);
    } catch {
      toast.error("Không thể tải danh sách buổi khám");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get("Class");
      const map = (res.data.$values || res.data).reduce((acc, cls) => {
        acc[cls.classID] = cls.className;
        return acc;
      }, {});
      setClassMap(map);
    } catch {
      toast.error("Không thể tải danh sách lớp");
    }
  };

  // =================================================================
  // Handlers
  // =================================================================
  const openStudentModal = async (schedule) => {
    setSelectedSchedule(schedule);
    setStudentModalOpen(true);
    setStudentLoading(true);
    try {
      // Lấy toàn bộ học sinh của lớp
      const res = await api.get("Student");
      const allStudents = (res.data.$values || []).filter(
        (s) => s.classID === schedule.classID
      );
      // Lấy danh sách consent đã đồng ý cho buổi khám này
      const consentRes = await api.get("ParentalConsents");
      const consents = (consentRes.data.$values || []).filter(
        (c) =>
          c.schoolCheckupID === schedule.scheduleID &&
          c.consentStatus === "Đã đồng ý"
      );
      const approvedStudentIDs = consents.map((c) => c.studentID);
      // Lọc học sinh chỉ giữ lại các bạn đã được phụ huynh đồng ý
      const filtered = allStudents.filter((s) =>
        approvedStudentIDs.includes(s.studentID)
      );
      setStudents(filtered);
    } catch {
      toast.error("Không thể tải danh sách học sinh hoặc xác nhận phụ huynh");
    } finally {
      setStudentLoading(false);
    }
  };

  const openReportModal = async (student, schedule) => {
    setSelectedStudent(student);
    setSelectedSchedule(schedule); // Cần schedule để so sánh ngày
    setReportModalOpen(true);
    setReportLoading(true);
    try {
      const res = await api.get(`Checkup/student/${student.studentID}`);
      setStudentReports(res.data.$values || []);
    } catch {
      toast.error("Không thể tải báo cáo sức khỏe");
      setStudentReports([]);
    } finally {
      setReportLoading(false);
    }
  };

  const openCreateModal = (student, schedule) => {
    setSelectedStudent(student);
    setSelectedSchedule(schedule);
    // Set ngày khám mặc định là ngày trong lịch khám
    form.setFieldsValue({
      date: schedule?.date ? dayjs(schedule.date) : null,
    });
    setCreateModalOpen(true);
  };

  const handleCreateReport = async (values) => {
    setCreateLoading(true);
    try {
      if (!user || !user.userID) {
        toast.error("Không xác định được y tá. Vui lòng đăng nhập lại.");
        return;
      }
      if (!selectedStudent) {
        toast.error("Không xác định được học sinh.");
        return;
      }

      const nurseRes = await api.get(`Nurse?userId=${user.userID}`);
      const nurseID = nurseRes.data.nurseID;

      if (!nurseID) {
        toast.error("Không tìm thấy thông tin y tá tương ứng.");
        return;
      }

      const reportPayload = {
        date: values.date.toISOString(),
        description: values.description,
        studentID: selectedStudent.studentID,
        nurseID,
      };

      const reportRes = await api.post("Checkup/reports", reportPayload);
      const reportID = reportRes.data.reportID;

      const detailPayload = {
        reportID,
        weight: values.weight,
        height: values.height,
        bloodPressure: values.bloodPressure,
        visionLeft: values.visionLeft,
        visionRight: values.visionRight,
      };

      await api.post("Checkup", detailPayload);

      toast.success("Nhập kết quả khám thành công!");
      closeCreateModal();

      // Tự động làm mới modal báo cáo nếu nó đang mở cho cùng học sinh
      if (
        reportModalOpen &&
        selectedStudent?.studentID === selectedStudent.studentID
      ) {
        openReportModal(selectedStudent, selectedSchedule);
      }
    } catch (error) {
      toast.error("Lỗi khi nhập kết quả khám. Vui lòng thử lại.");
      console.error("Create report error:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const closeStudentModal = () => {
    setStudentModalOpen(false);
    setSelectedSchedule(null);
    setStudents([]);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setSelectedStudent(null);
    setStudentReports([]);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setSelectedStudent(null);
    form.resetFields();
  };

  // =================================================================
  // Render Helpers & Columns
  // =================================================================

  const getReportForSchedule = () => {
    if (!selectedSchedule || !studentReports.length) return null;
    const scheduleDate = dayjs(selectedSchedule.date);
    return (
      studentReports.find((r) => dayjs(r.date).isSame(scheduleDate, "day")) ||
      null
    );
  };

  const renderReport = () => {
    const report = getReportForSchedule();
    if (!report) {
      return <Empty description="Chưa có báo cáo cho buổi khám này." />;
    }
    return (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Ngày khám">
          {dayjs(report.date).format("DD/MM/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Cân nặng">
          {report.weight} kg
        </Descriptions.Item>
        <Descriptions.Item label="Chiều cao">
          {report.height} cm
        </Descriptions.Item>
        <Descriptions.Item label="Huyết áp">
          {report.bloodPressure}
        </Descriptions.Item>
        <Descriptions.Item label="Thị lực (trái)">
          {report.visionLeft}
        </Descriptions.Item>
        <Descriptions.Item label="Thị lực (phải)">
          {report.visionRight}
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">
          {report.description}
        </Descriptions.Item>
        <Descriptions.Item label="Y tá nhập">
          {report.nurseName}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const scheduleColumns = [
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Lớp",
      dataIndex: "classID",
      key: "classID",
      render: (classID) => classMap[classID] || "Không xác định",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => openStudentModal(record)}>
          Xem danh sách học sinh
        </Button>
      ),
    },
  ];

  const studentColumns = [
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => (gender?.toUpperCase() === "M" ? "Nam" : "Nữ"),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (dob) => (dob ? dayjs(dob).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => openReportModal(record, selectedSchedule)}
          >
            Xem báo cáo
          </Button>
          <Button
            type="primary"
            ghost
            onClick={() => openCreateModal(record, selectedSchedule)}
          >
            Nhập kết quả
          </Button>
        </Space>
      ),
    },
  ];

  // =================================================================
  // Main Render
  // =================================================================
  return (
    <Card>
      <Title level={3}>Danh sách buổi khám sức khỏe định kỳ</Title>
      <Table
        columns={scheduleColumns}
        dataSource={schedules}
        rowKey="scheduleID"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      {/* Modal: Danh sách học sinh */}
      <Modal
        open={studentModalOpen}
        title={`Danh sách học sinh lớp ${
          classMap[selectedSchedule?.classID] || ""
        }`}
        onCancel={closeStudentModal}
        footer={null}
        width={800}
      >
        <Spin spinning={studentLoading}>
          <Table
            columns={studentColumns}
            dataSource={students}
            rowKey="studentID"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Modal>

      {/* Modal: Báo cáo sức khỏe học sinh */}
      <Modal
        open={reportModalOpen}
        title={`Báo cáo sức khỏe: ${selectedStudent?.fullName || ""}`}
        onCancel={closeReportModal}
        footer={[
          <Button key="close" onClick={closeReportModal}>
            Đóng
          </Button>,
        ]}
      >
        <Spin spinning={reportLoading}>{renderReport()}</Spin>
      </Modal>

      {/* Modal: Nhập kết quả khám */}
      <Modal
        open={createModalOpen}
        title={`Nhập kết quả khám: ${selectedStudent?.fullName || ""}`}
        onCancel={closeCreateModal}
        footer={null}
        destroyOnClose // Reset form fields when modal is closed
      >
        <Form form={form} layout="vertical" onFinish={handleCreateReport}>
          <Form.Item
            name="date"
            label="Ngày khám"
            rules={[
              { required: true, message: "Vui lòng chọn ngày giờ khám" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const now = dayjs();
                  const min = now.subtract(24, "hour");
                  const max = now.add(24, "hour");
                  if (value.isBefore(min) || value.isAfter(max)) {
                    return Promise.reject(
                      "Chỉ được chọn trong khoảng 24 giờ trước và 24 giờ sau thời điểm hiện tại!"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              format="DD/MM/YYYY HH:mm"
              showTime={{ format: "HH:mm" }}
              style={{ width: "100%" }}
              placeholder="Chọn ngày giờ khám"
              disabledDate={(current) => {
                const now = dayjs();
                const min = now.subtract(24, "hour").startOf("day");
                const max = now.add(24, "hour").endOf("day");
                return current && (current < min || current > max);
              }}
            />
          </Form.Item>
          <Form.Item name="weight" label="Cân nặng">
            <InputNumber min={0} style={{ width: "100%" }} addonAfter="kg" />
          </Form.Item>
          <Form.Item name="height" label="Chiều cao">
            <InputNumber min={0} style={{ width: "100%" }} addonAfter="cm" />
          </Form.Item>
          <Form.Item name="bloodPressure" label="Huyết áp">
            <Input placeholder="Ví dụ: 120/80" />
          </Form.Item>
          <Form.Item name="visionLeft" label="Thị lực (mắt trái)">
            <Input placeholder="Ví dụ: 10/10 hoặc 8/10" />
          </Form.Item>
          <Form.Item name="visionRight" label="Thị lực (mắt phải)">
            <Input placeholder="Ví dụ: 10/10 hoặc 9/10" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Ghi chú chung và kết luận"
            rules={[{ required: true, message: "Vui lòng nhập ghi chú" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Tình trạng sức khỏe chung, các vấn đề cần lưu ý..."
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createLoading}
              block
            >
              Lưu kết quả
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CheckupPage;
