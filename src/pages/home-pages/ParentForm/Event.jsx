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
import { Select as AntSelect } from "antd";
import { toast } from "react-toastify";

const { Title, Text, Paragraph } = Typography;

function Event() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const parent = useSelector((state) => state.parent);
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

  const mapStatusToVietnamese = (status) => {
    if (!status) return "Chờ phản hồi";
    const s = status.toLowerCase();
    if (s === "approved" || s === "đã đồng ý") return "Đã đồng ý";
    if (s === "rejected" || s === "đã từ chối") return "Đã từ chối";
    if (
      s === "unread" ||
      s === "đã gửi" ||
      s === "pending" ||
      s === "chờ phản hồi" ||
      s === "chờ phụ huynh xác nhận"
    )
      return "Chờ phản hồi";
    return status;
  };

  const fetchDataNotificationOfParent = async (idParent) => {
    try {
      setLoading(true);
      const response = await api.get(`/ParentNotifications/parent/${idParent}`);
      // Dữ liệu trả về đã đúng cấu trúc, chỉ cần lấy $values
      const notificationsData = (response.data.$values || []).map(
        (notification) => ({
          ...notification,
          status: mapStatusToVietnamese(notification.status),
        })
      );
      setData(notificationsData);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
      message.error("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parent?.parent?.parentID) {
      console.log("Parent ID:", parent.parent.parentID);
      fetchDataNotificationOfParent(parent.parent.parentID);
      // Fetch students of parent for attendance
      (async () => {
        try {
          const res = await api.get(`/Student/${parent.parent.parentID}`);
          const list = res.data.$values || res.data;
          setStudentsOfParent(list);
          if (list.length > 0) setSelectedStudentId(list[0].studentID);
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [parent?.parent?.parentID]);

  const filteredData = useMemo(() => {
    return (
      typeFilter === "ALL"
        ? data
        : typeFilter === "OTHER"
        ? data.filter((item) => !item.notificationType)
        : typeFilter === "MEDICAL_REQUEST"
        ? data.filter(
            (item) =>
              item.notificationType === "MEDICAL_REQUEST" ||
              (item.title && item.title.toLowerCase().includes("yêu cầu thuốc"))
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

  const handleAttendance = (item, isAttend, type) => {
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
      if (attendanceModal.type === "CHECKUP_CONSENT") {
        await api.put(
          `/ParentalConsents/checkup/${attendanceModal.notificationId}`,
          {
            parentId: parent.parent.parentID,
            studentId: selectedStudentId,
            isApproved: attendanceModal.isAttend,
            note: noteDecline,
          }
        );
      } else if (attendanceModal.type === "VACCINATION") {
        // Nếu sau này có API riêng cho VACCINATION thì xử lý ở đây
      }
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
        type: "VACCINATION",
      });
      setNoteDecline("");
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
        filteredData.map((item) => {
          const status = item.status || "Chờ phản hồi";
          // Chỉ cho phản hồi nếu là CHECKUP_CONSENT và status là Chờ phản hồi
          const canRespond =
            item.notificationType === "CHECKUP_CONSENT" &&
            status === "Chờ phản hồi";
          return (
            <Card
              key={item.notificationID}
              style={{
                marginBottom: 16,
                background: readIds.includes(item.notificationID)
                  ? "#f8faff"
                  : "#e6f7ff",
                borderRadius: 8,
                maxWidth: 900,
                margin: "0 auto 16px auto",
                cursor: "pointer",
              }}
              onClick={() => handleOpen(item)}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <b style={{ flex: 1 }}>
                  {item.notificationType === "VACCINATION"
                    ? item.title || "Thông báo lịch tiêm phòng"
                    : item.notificationType === "MEDICAL_EVENT"
                    ? item.title || "Thông báo sự cố y tế"
                    : item.title}
                </b>
                <Tag
                  color={
                    status === "Đã đồng ý"
                      ? "success"
                      : status === "Đã từ chối"
                      ? "error"
                      : canRespond
                      ? "warning"
                      : "default"
                  }
                >
                  {status}
                </Tag>
              </div>
              {/* Hiển thị ngày giờ gửi */}
              <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                {item.sentDate
                  ? `Gửi lúc: ${new Date(item.sentDate).toLocaleString(
                      "vi-VN"
                    )}`
                  : ""}
              </div>
              {openedId === item.notificationID && (
                <div style={{ marginTop: 12 }}>
                  <Button
                    size="small"
                    style={{ float: "right", marginBottom: 8 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenedId(null);
                    }}
                  >
                    Thu gọn
                  </Button>
                  <Paragraph style={{ margin: "8px 0" }}>
                    {item.content}
                  </Paragraph>
                  {/* Nút phản hồi chỉ hiện với CHECKUP_CONSENT và status chờ phản hồi */}
                  {item.notificationType === "CHECKUP_CONSENT" &&
                    canRespond && (
                      <Row gutter={8} style={{ marginTop: 12 }}>
                        <Col>
                          <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAttendance(
                                item,
                                true,
                                item.notificationType
                              );
                            }}
                          >
                            Tham gia
                          </Button>
                        </Col>
                        <Col>
                          <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAttendance(
                                item,
                                false,
                                item.notificationType
                              );
                            }}
                          >
                            Từ chối
                          </Button>
                        </Col>
                      </Row>
                    )}
                  <Divider style={{ margin: "16px 0" }} />
                </div>
              )}
            </Card>
          );
        })
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
        onCancel={() =>
          setAttendanceModal({
            open: false,
            notificationId: null,
            isAttend: true,
            type: "VACCINATION",
          })
        }
        onOk={submitAttendance}
        okText={attendanceModal.isAttend ? "Đồng ý" : "Gửi từ chối"}
        cancelText="Huỷ"
        confirmLoading={submitting}
        okButtonProps={{ disabled: !selectedStudentId }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>
            <span>Chọn học sinh:</span>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={selectedStudentId}
              onChange={(v) => setSelectedStudentId(v)}
              status={!selectedStudentId ? "error" : ""}
              options={studentsOfParent.map((s) => ({
                value: s.studentID,
                label: s.fullName,
              }))}
              placeholder="Chọn học sinh tham gia"
            />
          </div>
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
