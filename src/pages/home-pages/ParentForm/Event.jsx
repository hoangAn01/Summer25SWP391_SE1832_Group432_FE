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
  // Removed unused state
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
          // Fetch students and set selected student ID
          const res = await api.get(`Student/by-parent/${parent.accountID}`);
          const list = res.data.$values || res.data;
          if (list.length > 0) setSelectedStudentId(list[0].studentID);
        } catch (error) {
          console.error("Lỗi khi tải danh sách học sinh:", error);
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
        : typeFilter === "MEDICAL_EVENT"
        ? data.filter(
            (item) =>
              item.notificationType === "Sự cố y tế" ||
              item.notificationType === "MedicalEvent" ||
              (item.title && (
                item.title.toLowerCase().includes("sự cố") ||
                item.title.toLowerCase().includes("tai nạn") ||
                item.title.toLowerCase().includes("chấn thương")
              ))
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

  // Function commented out as it's currently unused but may be needed in the future
  /*
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
      } catch (error) {
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
  */

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
        padding: "32px 16px",
        background: 'linear-gradient(180deg, #f0f7ff 0%, #f5f8fe 100%)',
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
        boxShadow: '0 8px 32px rgba(0, 82, 204, 0.08)',
        padding: "32px 24px",
        border: '1px solid #e6f4ff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <CalendarOutlined style={{ fontSize: 28, color: '#1677ff', marginRight: 16 }} />
          <Title level={2} style={{ margin: 0, color: '#1677ff', fontWeight: 700, letterSpacing: 0.5 }}>
            Thông Báo Sự Kiện
          </Title>
        </div>
        <Paragraph style={{ color: '#666', marginBottom: 20 }}>
          Xem và quản lý các thông báo về sự kiện, tiêm chủng, khám sức khỏe và các yêu cầu thuốc.
        </Paragraph>
        <Divider style={{ margin: '4px 0 24px 0' }} />
        
        {/* Bộ lọc loại thông báo */}
        <Card 
          style={{ 
            marginBottom: 24, 
            borderRadius: 12, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            background: '#fafcff'
          }}
          bodyStyle={{ padding: '16px 20px' }}
        >
          <Row align="middle" gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Text strong style={{ marginBottom: 8, fontSize: 15 }}>
                  Loại thông báo
                </Text>
                <Select
                  value={typeFilter}
                  onChange={setTypeFilter}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="Chọn loại thông báo"
                  options={[
                    { value: "ALL", label: "Tất cả thông báo" },
                    { value: "VACCINATION", label: "Tiêm chủng" },
                    { value: "CHECKUP", label: "Khám sức khỏe" },
                    { value: "MEDICAL_REQUEST", label: "Gửi thuốc" },
                    { value: "MEDICAL_EVENT", label: "Sự cố y tế" },
                    { value: "OTHER", label: "Thông báo khác" },
                  ]}
                />
              </div>
            </Col>
            <Col xs={24} md={16}>
              <Alert
                message="Hướng dẫn"
                description="Nhấp vào thông báo để xem chi tiết. Bạn có thể xác nhận hoặc từ chối tham gia các sự kiện."
                type="info"
                showIcon
                style={{ borderRadius: 8 }}
              />
            </Col>
          </Row>
        </Card>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang tải thông báo...</Text>
          </div>
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
              
              // Xác định icon và màu sắc dựa trên loại thông báo
              let notificationIcon;
              let iconColor;
              let cardBorderColor;
              let cardBackground;
              
              if (item.notificationType === "Duyệt thuốc" || 
                  (item.title && item.title.toLowerCase().includes("thuốc"))) {
                notificationIcon = <i className="fas fa-pills" style={{ fontSize: 22 }} />;
                iconColor = "#722ed1";
                cardBorderColor = "#d3adf7";
                cardBackground = readIds.includes(item.notificationID) ? "#f9f0ff" : "#f4edfd";
              } else if (item.notificationType === "Thông báo tiêm vaccine" || 
                       (item.title && item.title.toLowerCase().includes("vaccine"))) {
                notificationIcon = <i className="fas fa-syringe" style={{ fontSize: 22 }} />;
                iconColor = "#13c2c2";
                cardBorderColor = "#87e8de";
                cardBackground = readIds.includes(item.notificationID) ? "#e6fffb" : "#def7f7";
              } else if (item.notificationType === "Thông báo khám sức khỏe" || 
                       item.notificationType === "Kết quả khám" ||
                       item.notificationType === "CheckupSchedule" ||
                       (item.title && item.title.toLowerCase().includes("khám"))) {
                notificationIcon = <i className="fas fa-stethoscope" style={{ fontSize: 22 }} />;
                iconColor = "#1677ff";
                cardBorderColor = "#bae7ff";
                cardBackground = readIds.includes(item.notificationID) ? "#f0f7ff" : "#e6f4ff";
              } else if (item.notificationType === "Sự cố y tế" || 
                       item.notificationType === "MedicalEvent" ||
                       (item.title && (
                         item.title.toLowerCase().includes("sự cố") ||
                         item.title.toLowerCase().includes("tai nạn") ||
                         item.title.toLowerCase().includes("chấn thương")
                       ))) {
                notificationIcon = <i className="fas fa-first-aid" style={{ fontSize: 22 }} />;
                iconColor = "#f5222d";
                cardBorderColor = "#ffccc7";
                cardBackground = readIds.includes(item.notificationID) ? "#fff1f0" : "#ffebe9";
              } else {
                notificationIcon = <i className="fas fa-bell" style={{ fontSize: 22 }} />;
                iconColor = "#fa8c16";
                cardBorderColor = "#ffe7ba";
                cardBackground = readIds.includes(item.notificationID) ? "#fff7e6" : "#fff2e8";
              }
              
            return (
              <Card
                key={item.notificationID}
                style={{
                  marginBottom: 24,
                  background: cardBackground,
                  borderRadius: 14,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  border: `1px solid ${cardBorderColor}`,
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  transform: openedId === item.notificationID ? 'translateY(-2px)' : 'none',
                }}
                bodyStyle={{ padding: 0 }}
                onClick={() => handleOpen(item)}
                hoverable
              >
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ 
                      padding: '10px',
                      borderRadius: '50%',
                      background: `${iconColor}15`,
                      marginRight: 16,
                      color: iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 42,
                      height: 42
                    }}>
                      {notificationIcon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 17, color: '#222', lineHeight: 1.4 }}>
                        {isMedicineApproved && studentName
                          ? `Thông báo học sinh ${studentName} đã được nhân viên y tế cho sử dụng thuốc, vật dụng y tế thành công`
                          : item.title}
                      </div>
                      <div style={{ color: '#666', fontSize: 14, marginTop: 6, display: 'flex', alignItems: 'center' }}>
                        <CalendarOutlined style={{ marginRight: 6 }} />
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
                        style={{ 
                          fontWeight: 600, 
                          fontSize: 15,
                          padding: '4px 12px',
                          borderRadius: 6,
                          marginLeft: 8
                        }}
                        icon={status === 'Đã đồng ý' ? <CheckCircleOutlined /> : 
                              status === 'Đã từ chối' ? <CloseCircleOutlined /> : null}
                      >
                        {status}
                      </Tag>
                    )}
                  </div>
                    {openedId === item.notificationID && (
                      <div style={{ marginTop: 18 }}>
                        <Divider style={{ margin: '12px 0' }} />
                        <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>
                          {isMedicineApproved && medicineDetail ? (
                            <>
                              <div style={{ 
                                padding: '16px 20px', 
                                background: 'rgba(24, 144, 255, 0.05)', 
                                borderRadius: 8,
                                marginBottom: 16
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                  <i className="fas fa-calendar-alt" style={{ color: '#1677ff', marginRight: 8 }}></i>
                                  <Text strong style={{ color: '#1677ff' }}>Ngày phụ huynh gửi đơn:</Text>
                                  <Text style={{ marginLeft: 8 }}>
                                    {medicineDetail.date ? new Date(medicineDetail.date).toLocaleString('vi-VN') : ''}
                                  </Text>
                                </div>
                              </div>
                              
                              <Card
                                style={{
                                  background: '#f9f9f9',
                                  borderRadius: 12,
                                  marginBottom: 16,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                }}
                              >
                                <Descriptions
                                  title={<Text strong style={{ fontSize: 17 }}>Thông tin chi tiết</Text>}
                                  bordered
                                  column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                                  style={{ marginBottom: 16 }}
                                >
                                  <Descriptions.Item label="Học sinh" labelStyle={{ fontWeight: 600 }}>
                                    {medicineDetail.studentName}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Lớp" labelStyle={{ fontWeight: 600 }}>
                                    {studentClass || 'Không rõ'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Nhân viên y tế" labelStyle={{ fontWeight: 600 }}>
                                    {nurseName || medicineDetail.approvedBy || 'Không rõ'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Ghi chú" labelStyle={{ fontWeight: 600 }}>
                                    {medicineDetail.nurseNote || 'Không có'}
                                  </Descriptions.Item>
                                </Descriptions>
                                
                                {/* Thông tin đơn thuốc/vật dụng */}
                                {Array.isArray(medicineDetail.medicineDetails) && medicineDetail.medicineDetails.length > 0 && (
                                  <div>
                                    <Title level={5} style={{ marginBottom: 16 }}>Đơn thuốc/vật dụng</Title>
                                    <Table
                                      dataSource={medicineDetail.medicineDetails}
                                      rowKey="requestDetailID"
                                      pagination={false}
                                      bordered
                                      size="middle"
                                      style={{ borderRadius: 8, overflow: 'hidden' }}
                                      columns={[
                                        {
                                          title: 'Tên',
                                          dataIndex: 'requestItemName',
                                          key: 'requestItemName',
                                        },
                                        {
                                          title: 'Số lượng',
                                          dataIndex: 'quantity',
                                          key: 'quantity',
                                          width: 100,
                                        },
                                        {
                                          title: 'Liều dùng/Cách sử dụng',
                                          dataIndex: 'dosageInstructions',
                                          key: 'dosageInstructions',
                                        },
                                        {
                                          title: 'Thời điểm',
                                          dataIndex: 'time',
                                          key: 'time',
                                          width: 150,
                                        },
                                      ]}
                                    />
                                  </div>
                                )}
                              </Card>
                            </>
                          ) : (
                            <Card
                              style={{
                                borderRadius: 12,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                              }}
                            >
                              <Descriptions
                                title={
                                  <Text strong style={{ fontSize: 17 }}>
                                    {item.notificationType === "Sự cố y tế" || 
                                      item.notificationType === "MedicalEvent" ||
                                      (item.title && (
                                        item.title.toLowerCase().includes("sự cố") ||
                                        item.title.toLowerCase().includes("tai nạn") ||
                                        item.title.toLowerCase().includes("chấn thương")
                                      )) ? "Thông tin sự cố y tế" : "Thông tin sự kiện"}
                                  </Text>
                                }
                                bordered
                                column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                              >
                                <Descriptions.Item label="Tên" labelStyle={{ fontWeight: 600 }}>
                                  {item.title}
                                </Descriptions.Item>
                                
                                <Descriptions.Item 
                                  label={
                                    item.notificationType === "Sự cố y tế" || 
                                    item.notificationType === "MedicalEvent" ||
                                    (item.title && (
                                      item.title.toLowerCase().includes("sự cố") ||
                                      item.title.toLowerCase().includes("tai nạn") ||
                                      item.title.toLowerCase().includes("chấn thương")
                                    )) ? "Ngày xảy ra" : "Ngày tổ chức"
                                  } 
                                  labelStyle={{ fontWeight: 600 }}
                                >
                                  {item.sentDate ? new Date(item.sentDate).toLocaleDateString('vi-VN') : ''}
                                </Descriptions.Item>
                                
                                {/* Chỉ hiển thị trạng thái nếu không phải là thông báo sự cố y tế */}
                                {!(item.notificationType === "Sự cố y tế" || 
                                   item.notificationType === "MedicalEvent" ||
                                   (item.title && (
                                     item.title.toLowerCase().includes("sự cố") ||
                                     item.title.toLowerCase().includes("tai nạn") ||
                                     item.title.toLowerCase().includes("chấn thương")
                                   ))) && (
                                  <Descriptions.Item label="Trạng thái" labelStyle={{ fontWeight: 600 }}>
                                    <Tag
                                      color={
                                        status === 'Đã đồng ý'
                                          ? 'success'
                                          : status === 'Đã từ chối'
                                          ? 'error'
                                          : 'default'
                                      }
                                    >
                                      {status}
                                    </Tag>
                                  </Descriptions.Item>
                                )}
                                
                                {item.content && (
                                  <Descriptions.Item label="Nội dung" labelStyle={{ fontWeight: 600 }}>
                                    {item.content}
                                  </Descriptions.Item>
                                )}
                              </Descriptions>
                              
                              {/* Nút xác nhận sự kiện cho các thông báo không phải gửi thuốc đã approved và không phải sự cố y tế */}
                              {!isMedicineApproved && 
                               !(item.notificationType === "Sự cố y tế" || 
                                 item.notificationType === "MedicalEvent" ||
                                 (item.title && (
                                   item.title.toLowerCase().includes("sự cố") ||
                                   item.title.toLowerCase().includes("tai nạn") ||
                                   item.title.toLowerCase().includes("chấn thương")
                                 ))) && (
                                <Button
                                  type="primary"
                                  style={{ marginTop: 16 }}
                                  icon={<CheckCircleOutlined />}
                                  size="large"
                                  onClick={() => window.location.href = "/confirm-event"}
                                >
                                  Xác nhận sự kiện
                                </Button>
                              )}
                            </Card>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
              </Card>
            );
          })}
        </div>
      ) : !loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <i className="fas fa-inbox" style={{ fontSize: 48, color: '#bfbfbf', marginBottom: 16 }}></i>
          <div style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, color: '#8c8c8c' }}>
              {typeFilter === 'ALL'
                ? 'Không có thông báo nào.'
                : `Không có thông báo loại "${typeFilter}" nào.`}
            </Text>
          </div>
          <Button 
            type="default"
            onClick={() => setTypeFilter('ALL')}
            disabled={typeFilter === 'ALL'}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      ) : null}
      </div>

      {/* Modal attendance */}
      <Modal
        open={attendanceModal.open}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {attendanceModal.isAttend ? 
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> : 
              <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
            }
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              {attendanceModal.isAttend ? "Xác nhận tham gia sự kiện" : "Từ chối tham gia sự kiện"}
            </span>
          </div>
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
        okText={attendanceModal.isAttend ? "Xác nhận đồng ý" : "Gửi từ chối"}
        cancelText="Huỷ"
        confirmLoading={submitting}
        okButtonProps={{ 
          disabled: !selectedStudentId,
          style: { 
            background: attendanceModal.isAttend ? '#52c41a' : '#ff4d4f', 
            borderColor: attendanceModal.isAttend ? '#52c41a' : '#ff4d4f' 
          } 
        }}
        width={500}
        centered
        bodyStyle={{ padding: '24px 24px 12px' }}
      >
        <Card
          style={{ 
            marginBottom: 20,
            borderRadius: 8,
            background: attendanceModal.isAttend ? '#f6ffed' : '#fff2f0',
            borderColor: attendanceModal.isAttend ? '#b7eb8f' : '#ffccc7'
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {modalStudent.studentID && (
              <div style={{ 
                fontSize: 16,
                fontWeight: 500,
                marginBottom: 8,
                color: attendanceModal.isAttend ? '#389e0d' : '#cf1322'
              }}>
                <i className="fas fa-user-graduate" style={{ marginRight: 8 }}></i>
                Học sinh: {modalStudent.studentName}
              </div>
            )}
            
            <div style={{ marginBottom: 8 }}>
              <Text strong>
                {attendanceModal.isAttend ? 
                  "Bạn đang xác nhận cho phép học sinh tham gia sự kiện này." : 
                  "Vui lòng cho biết lý do từ chối tham gia sự kiện này."
                }
              </Text>
            </div>
            
            <Input.TextArea
              rows={4}
              placeholder={
                attendanceModal.isAttend
                  ? "Ghi chú bổ sung (tuỳ chọn)"
                  : "Lý do từ chối (tuỳ chọn)"
              }
              value={noteDecline}
              onChange={(e) => setNoteDecline(e.target.value)}
              style={{ 
                borderColor: attendanceModal.isAttend ? '#b7eb8f' : '#ffccc7',
                borderRadius: 6
              }}
            />
          </Space>
        </Card>
      </Modal>
      
      {/* CSS cho các icon */}
      <style jsx global>{`
        .fas {
          font-family: 'Font Awesome 5 Free';
          font-weight: 900;
        }
        .fas.fa-pills:before { content: '\\f484'; }
        .fas.fa-syringe:before { content: '\\f48e'; }
        .fas.fa-stethoscope:before { content: '\\f0f1'; }
        .fas.fa-bell:before { content: '\\f0f3'; }
        .fas.fa-inbox:before { content: '\\f01c'; }
        .fas.fa-calendar-alt:before { content: '\\f073'; }
        .fas.fa-user-graduate:before { content: '\\f501'; }
        .fas.fa-first-aid:before { content: '\\f479'; }
      `}</style>
    </div>
  );
}

export default Event;
