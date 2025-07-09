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
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import api from "../../../config/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  const handleOpen = (item) => {
    setOpenedId(item.notificationID);
    if (!readIds.includes(item.notificationID)) {
      const newReadIds = [...readIds, item.notificationID];
      setReadIds(newReadIds);
      localStorage.setItem("readNotificationIds", JSON.stringify(newReadIds));
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
        padding: 24,
        background: "#f0f2f5",
        minHeight: "calc(100vh - 64px)",
        marginTop: "64px",
      }}
    >
      <Title level={2} style={{ marginBottom: 24, textAlign: "center" }}>
        Thông Báo Sự Kiện
      </Title>

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
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {filteredData.map((item) => {
            const status = item.status || "Chờ phản hồi";
            return (
              <Card
                key={item.notificationID}
                style={{
                  marginBottom: 16,
                  background: readIds.includes(item.notificationID)
                    ? "#f8faff"
                    : "#e6f7ff",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                onClick={() => handleOpen(item)}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 16 }}>{item.title}</b>
                    <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
                      {item.sentDate
                        ? `Gửi lúc: ${new Date(item.sentDate).toLocaleString(
                            "vi-VN"
                          )}`
                        : ""}
                    </div>
                  </div>
                  <Tag
                    color={
                      status === "Đã đồng ý"
                        ? "success"
                        : status === "Đã từ chối"
                        ? "error"
                        : "default"
                    }
                    style={{ fontWeight: 600, fontSize: 14 }}
                  >
                    {status}
                  </Tag>
                </div>
                {openedId === item.notificationID && (
                  <div style={{ marginTop: 12 }}>
                    <Divider style={{ margin: "8px 0" }} />
                    <Paragraph style={{ margin: "8px 0" }}>
                      {item.content}
                    </Paragraph>
                    <div style={{ margin: "8px 0", color: "#555" }}>
                      <b>Sự kiện:</b> {item.title}
                      <br />
                      <b>Ngày tổ chức:</b>{" "}
                      {item.sentDate
                        ? new Date(item.sentDate).toLocaleDateString("vi-VN")
                        : ""}
                      <br />
                      <b>Trạng thái:</b> {status}
                    </div>
                    <Button
                      type="primary"
                      style={{ marginTop: 12 }}
                      onClick={() => navigate("/confirm-event")}
                    >
                      Xác nhận sự kiện
                    </Button>
                    <Divider style={{ margin: "16px 0" }} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : !loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">
            {typeFilter === "ALL"
              ? "Không có thông báo nào."
              : `Không có thông báo loại "${typeFilter}" nào.`}
          </Text>
        </div>
      ) : null}

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
