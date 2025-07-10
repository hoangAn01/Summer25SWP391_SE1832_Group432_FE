import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Tag,
  Alert,
  Space,
  Divider,
  Select,
  message,
  Modal,
  Input,
  Table,
  Descriptions,
  Spin,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import api from "../../../config/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const { Title, Text, Paragraph } = Typography;

function Event() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const parent = useSelector((state) => state.parent.parent);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [openedId, setOpenedId] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem("readNotificationIds");
    return saved ? JSON.parse(saved) : [];
  });
  const [attendanceModal, setAttendanceModal] = useState({
    open: false,
    notificationId: null,
    isAttend: true,
    type: "VACCINATION",
  });
  const [studentsOfParent, setStudentsOfParent] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [noteDecline, setNoteDecline] = useState("");
  const [modalStudent, setModalStudent] = useState({
    studentID: null,
    studentName: "",
  });
  const [medicineDetail, setMedicineDetail] = useState(null);
  const [nurseName, setNurseName] = useState("");
  const [studentClass, setStudentClass] = useState("");

  const mapStatusToVietnamese = (status) => {
    if (!status) return "Chờ phản hồi";
    const s = status.toLowerCase();
    if (s === "approved" || s === "đã đồng ý") return "Đã đồng ý";
    if (s === "rejected" || s === "đã từ chối") return "Đã từ chối";
    if (
      s === "unread" ||
      s === "đã gửi" ||
      s === "pending" ||
      s === "sent" ||
      s === "chờ phản hồi" ||
      s === "chờ phụ huynh xác nhận"
    )
      return "Chờ phản hồi";
    return status;
  };

  const fetchDataNotificationOfParent = async (idParent) => {
    try {
      setLoading(true);
      const response = await api.get(`Notifications/account/${idParent}`);
      const notificationsData = response.data.$values || response.data;
      setData(
        notificationsData.map((notification) => ({
          ...notification,
          status: mapStatusToVietnamese(notification.status),
        }))
      );
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
      message.error("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parent?.accountID) {
      console.log("User ID:", parent.accountID);
      fetchDataNotificationOfParent(parent.accountID);
      (async () => {
        try {
          const parentResponse = await api.get(
            `Parent/ByAccount/${parent.accountID}`
          );
          const res = await api.get(`Student/by-parent/${parent.accountID}`);
          const list = res.data.$values || res.data;
          setStudentsOfParent(list);
          if (list.length > 0) setSelectedStudentId(list[0].studentID);
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, []);

  const filteredData = useMemo(() => {
    return (
      typeFilter === "ALL"
        ? data
        : typeFilter === "OTHER"
        ? data.filter(
            (item) =>
              !item.notificationType || item.notificationType === "General"
          )
        : typeFilter === "MEDICAL_REQUEST"
        ? data.filter(
            (item) =>
              item.notificationType === "Duyệt thuốc" ||
              item.notificationType === "MedicineRequest" ||
              (item.title && item.title.toLowerCase().includes("thuốc"))
          )
        : typeFilter === "VACCINATION"
        ? data.filter(
            (item) =>
              item.notificationType === "Thông báo tiêm vaccine" ||
              (item.title && item.title.toLowerCase().includes("vaccine"))
          )
        : typeFilter === "CHECKUP"
        ? data.filter(
            (item) =>
              item.notificationType === "Thông báo khám sức khỏe" ||
              item.notificationType === "Kết quả khám" ||
              item.notificationType === "CheckupSchedule" ||
              (item.title && item.title.toLowerCase().includes("khám"))
          )
        : data.filter((item) => item.notificationType === typeFilter)
    ).sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
  }, [data, typeFilter]);

  const handleOpen = async (item) => {
    setOpenedId(item.notificationID);
    if (!readIds.includes(item.notificationID)) {
      const newReadIds = [...readIds, item.notificationID];
      setReadIds(newReadIds);
      localStorage.setItem("readNotificationIds", JSON.stringify(newReadIds));
    }
    // Nếu là duyệt thuốc đã approved thì fetch chi tiết đơn thuốc
    const status = item.status || "Chờ phản hồi";
    const isMedicineApproved =
      (item.notificationType === "Duyệt thuốc" ||
        (item.title && item.title.toLowerCase().includes("yêu cầu thuốc"))) &&
      (status === "Đã đồng ý" || status === "Approved" || (item.title && item.title.toLowerCase().includes("approved")));
    if (isMedicineApproved && item.relatedEntityID) {
      try {
        const res = await api.get(`/MedicineRequest/${item.relatedEntityID}`);
        setMedicineDetail(res.data);
        // Lấy tên y tá nếu có approvedBy
        if (res.data.approvedBy) {
          try {
            const nurseRes = await api.get(`/Nurse/${res.data.approvedBy}`);
            setNurseName(nurseRes.data.fullName || "");
          } catch {
            setNurseName("");
          }
        } else {
          setNurseName("");
        }
        
        if (res.data.studentID) {
          try {
            const studentRes = await api.get(`/Student/${res.data.studentID}`);
            setStudentClass(studentRes.data.className || studentRes.data.class || "");
          } catch {
            setStudentClass("");
          }
        } else {
          setStudentClass("");
        }
      } catch {
        setMedicineDetail(null);
        setNurseName("");
        setStudentClass("");
      }
    } else {
      setMedicineDetail(null);
      setNurseName("");
      setStudentClass("");
    }
  };

  const handleAttendance = async (item, isAttend, type) => {
    if (item.notificationType === "ConsentRequest") {
      try {
        const res = await api.get(
          `Notifications/${item.notificationID}/student`
        );
        setModalStudent({
          studentID: res.data.studentID,
          studentName: res.data.studentName,
        });
        setSelectedStudentId(res.data.studentID);
      } catch (err) {
        setModalStudent({ studentID: null, studentName: "" });
        setSelectedStudentId(null);
        message.error("Không lấy được thông tin học sinh cho xác nhận!");
        return;
      }
    }
    setAttendanceModal({
      open: true,
      notificationId: item.notificationID,
      isAttend,
      type,
    });
  };

  const submitAttendance = async () => {
    if (!attendanceModal.notificationId) return;
    if (!selectedStudentId) {
      message.error("Vui lòng chọn học sinh");
      return;
    }
    setSubmitting(true);
    try {
      await api.put("StudentJoinEvent/respond-by-student", {
        studentId: selectedStudentId,
        eventId: data.find(
          (item) => item.notificationID === attendanceModal.notificationId
        )?.relatedEntityID,
        status: attendanceModal.isAttend ? "Accepted" : "Rejected",
        note: noteDecline,
      });
      setData((prevData) =>
        prevData.map((item) => {
          if (item.notificationID === attendanceModal.notificationId) {
            return {
              ...item,
              status: attendanceModal.isAttend ? "Đã đồng ý" : "Đã từ chối",
              note: noteDecline || null,
            };
          }
          return item;
        })
      );
      toast.success("Đã gửi phản hồi thành công");
      setAttendanceModal({
        open: false,
        notificationId: null,
        isAttend: true,
        type: "ConsentRequest",
      });
      setNoteDecline("");
      setModalStudent({ studentID: null, studentName: "" });
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.message ||
          "Gửi phản hồi thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: 32,
        background: '#f4f8fb',
        minHeight: 'calc(100vh - 64px)',
        marginTop: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{
        maxWidth: 900,
        width: '100%',
        margin: '0 auto',
        marginBottom: 32,
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 4px 24px #dbeafe44',
        padding: 32,
        border: '1px solid #e6f4ff',
      }}>
        <Title level={2} style={{ marginBottom: 12, textAlign: 'left', color: '#1677ff', fontWeight: 700, letterSpacing: 1 }}>
          Thông Báo Sự Kiện
        </Title>
        <Divider style={{ margin: '12px 0 24px 0' }} />
        {/* Bộ lọc loại thông báo */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 500, marginBottom: 4 }}>
              Loại thông báo
            </span>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 220 }}
              placeholder="Chọn loại thông báo"
              options={[
                { value: "ALL", label: "Tất cả" },
                { value: "VACCINATION", label: "Tiêm chủng" },
                { value: "CHECKUP", label: "Khám sức khỏe" },
                { value: "MEDICAL_REQUEST", label: "Gửi thuốc" },
                { value: "OTHER", label: "Khác" },
              ]}
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Text type="secondary">Đang tải thông báo...</Text>
          </div>
        )}

        {/* Danh sách thông báo đã lọc */}
        {!loading && filteredData.length > 0 ? (
          <div>
            {filteredData.map((item) => {
              const status = item.status || "Chờ phản hồi";
              // Xác định nếu là thông báo duyệt thuốc đã approved
              const isMedicineApproved =
                (item.notificationType === "Duyệt thuốc" ||
                  (item.title && item.title.toLowerCase().includes("yêu cầu thuốc"))) &&
                (status === "Đã đồng ý" || status === "Approved" || (item.title && item.title.toLowerCase().includes("approved")));
              // Lấy tên học sinh từ title
              let studentName = "";
              if (isMedicineApproved) {
                const match = item.title.match(/con bạn ([^\d]+) đã được/i);
                if (match && match[1]) {
                  studentName = match[1].trim();
                }
              }
              return (
                <Card
                  key={item.notificationID}
                  style={{
                    marginBottom: 24,
                    background: readIds.includes(item.notificationID)
                      ? '#f6faff'
                      : '#e6f7ff',
                    borderRadius: 14,
                    boxShadow: '0 2px 12px #e0e7ef33',
                    border: '1px solid #bae7ff',
                    padding: 0,
                  }}
                  bodyStyle={{ padding: 0 }}
                  onClick={() => handleOpen(item)}
                >
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: 18, color: '#222' }}>
                          {isMedicineApproved && studentName
                            ? `Thông báo học sinh ${studentName} đã được nhân viên y tế cho sử dụng thuốc, vật dụng y tế thành công`
                            : item.title}
                        </span>
                        <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
                          {item.sentDate
                            ? `Đã nhận: ${new Date(item.sentDate).toLocaleString('vi-VN')}`
                            : ''}
                        </div>
                      </div>
                      {/* Ẩn tag trạng thái nếu là duyệt thuốc đã approved */}
                      {!isMedicineApproved && (
                        <Tag
                          color={
                            status === 'Đã đồng ý'
                              ? 'success'
                              : status === 'Đã từ chối'
                              ? 'error'
                              : 'default'
                          }
                          style={{ fontWeight: 600, fontSize: 15 }}
                        >
                          {status}
                        </Tag>
                      )}
                    </div>
                    {openedId === item.notificationID && (
                      <div style={{ marginTop: 18 }}>
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>
                          {isMedicineApproved && medicineDetail ? (
                            <>
                              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                                <span style={{ color: '#1677ff' }}>Ngày phụ huynh gửi đơn:</span> {medicineDetail.date ? new Date(medicineDetail.date).toLocaleString('vi-VN') : ''}
                              </div>
                              <div style={{
                                background: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                borderRadius: 10,
                                padding: 20,
                                marginBottom: 8,
                                boxShadow: '0 2px 8px #f0f1f2',
                                maxWidth: 600,
                              }}>
                                <div style={{ marginBottom: 10, fontSize: 17 }}>
                                  <b>Học sinh:</b> {medicineDetail.studentName}
                                </div>
                                <div style={{ marginBottom: 10, fontSize: 17 }}>
                                  {studentClass || 'Không rõ'}
                                </div>
                                {/* Thông tin đơn thuốc/vật dụng */}
                                {Array.isArray(medicineDetail.medicineDetails) && medicineDetail.medicineDetails.length > 0 && (
                                  <div style={{
                                    background: '#fffbe6',
                                    border: '1px solid #ffe58f',
                                    borderRadius: 8,
                                    padding: 12,
                                    marginBottom: 10,
                                  }}>
                                    <b>Đơn thuốc/vật dụng:</b>
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                      {medicineDetail.medicineDetails.map((med) => (
                                        <li key={med.requestDetailID} style={{ marginBottom: 6 }}>
                                          <span><b>Tên:</b> {med.requestItemName}; </span>
                                          <span><b>Số lượng:</b> {med.quantity}; </span>
                                          <span><b>Liều dùng/Cách sử dụng:</b> {med.dosageInstructions}; </span>
                                          <span><b>Thời điểm:</b> {med.time}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                <div style={{ marginBottom: 10, fontSize: 17 }}>
                                  <b>Nhân viên y tế:</b> {nurseName || medicineDetail.approvedBy || 'Không rõ'}
                                </div>
                                <div style={{ fontSize: 17 }}>
                                  <b>Ghi chú của nhân viên y tế:</b> {medicineDetail.nurseNote || 'Không có'}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                                <span style={{ color: '#1677ff' }}>Sự kiện:</span> {item.title}
                              </div>
                              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                                <span style={{ color: '#1677ff' }}>Ngày tổ chức:</span> {item.sentDate ? new Date(item.sentDate).toLocaleDateString('vi-VN') : ''}
                              </div>
                              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                                <span style={{ color: '#1677ff' }}>Trạng thái:</span> {status}
                              </div>
                            </>
                          )}
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : !loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Text type="secondary">
              {typeFilter === 'ALL'
                ? 'Không có thông báo nào.'
                : `Không có thông báo loại "${typeFilter}" nào.`}
            </Text>
          </div>
        ) : null}
      </div>

      {/* Modal attendance */}
      <Modal
        open={attendanceModal.open}
        title={
          attendanceModal.isAttend ? "Xác nhận tham gia" : "Từ chối tham gia"
        }
        onCancel={() => {
          setAttendanceModal({
            open: false,
            notificationId: null,
            isAttend: true,
            type: "ConsentRequest",
          });
          setModalStudent({ studentID: null, studentName: "" });
        }}
        onOk={submitAttendance}
        okText={attendanceModal.isAttend ? "Đồng ý" : "Gửi từ chối"}
        cancelText="Huỷ"
        confirmLoading={submitting}
        okButtonProps={{ disabled: !selectedStudentId }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {modalStudent.studentID && (
            <div style={{ color: "#52c41a", fontWeight: 500 }}>
              Học sinh: {modalStudent.studentName}
            </div>
          )}
          <Input.TextArea
            rows={3}
            placeholder={
              attendanceModal.isAttend
                ? "Ghi chú (tuỳ chọn)"
                : "Lý do từ chối (tuỳ chọn)"
            }
            value={noteDecline}
            onChange={(e) => setNoteDecline(e.target.value)}
          />
        </Space>
      </Modal>
    </div>
  );
}

export default Event;
