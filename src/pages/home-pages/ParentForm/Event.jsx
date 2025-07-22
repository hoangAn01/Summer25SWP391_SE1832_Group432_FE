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

// --- Constants for status strings to prevent typos ---
const STATUS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

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
  // eslint-disable-next-line no-unused-vars
  const [studentsOfParent, setStudentsOfParent] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [noteDecline, setNoteDecline] = useState("");
  const [modalStudent, setModalStudent] = useState({
    studentID: null,
    studentName: "",
  });
  const [medicineDetail, setMedicineDetail] = useState(null);
  const [nurseName, setNurseName] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [studentClass, setStudentClass] = useState("");
  // Thêm state để lưu thông tin học sinh cho mỗi thông báo
  // eslint-disable-next-line no-unused-vars
  const [studentInfoMap, setStudentInfoMap] = useState({});
  // Thêm state để lưu thông tin StudentJoinEvent
  // eslint-disable-next-line no-unused-vars
  const [studentJoinEvents, setStudentJoinEvents] = useState({});
  // Thêm state để lưu tất cả các yêu cầu tham gia sự kiện
  const [allJoinRequests, setAllJoinRequests] = useState([]);

  const mapStatusToVietnamese = (status) => {
    if (!status) return "Chờ phản hồi";
    const s = status.toLowerCase();
    if (s === "approved" || s === "đã đồng ý" || s === "accepted") return "Đã đồng ý";
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

  // Hàm để lấy thông tin StudentJoinEvent cho parent - tương tự như ConfirmEvent.jsx
  const fetchStudentJoinEvents = async (parentId) => {
    try {
      const response = await api.get(`StudentJoinEvent/by-parent/${parentId}`);
      const data = response.data.$values || response.data;
      
      // Lưu tất cả các yêu cầu tham gia
      setAllJoinRequests(Array.isArray(data) ? data : []);
      
      // Tạo map để lưu trữ thông tin StudentJoinEvent theo eventID
      const eventMap = {};
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.eventID) {
            // Nếu đã có sự kiện này, thêm vào mảng
            if (eventMap[item.eventID]) {
              eventMap[item.eventID].push(item);
            } else {
              // Nếu chưa có, tạo mảng mới
              eventMap[item.eventID] = [item];
            }
          }
        });
      }
      
      return eventMap;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin StudentJoinEvent:", error);
      return {};
    }
  };

  const fetchDataNotificationOfParent = async (idParent) => {
    try {
      setLoading(true);
      
      // Lấy thông tin StudentJoinEvent trước
      const eventMap = await fetchStudentJoinEvents(parent?.parentID);
      setStudentJoinEvents(eventMap);
      
      const response = await api.get(`Notifications/account/${idParent}`);
      const notificationsData = response.data.$values || response.data;
      
      // Map các thông báo với trạng thái đã chuyển đổi
      const mappedData = notificationsData.map((notification) => ({
        ...notification,
        status: mapStatusToVietnamese(notification.status),
      }));
      
      // Lọc các thông báo tiêm chủng và sự kiện
      const eventNotifications = mappedData.filter(
        item => item.notificationType === "Thông báo tiêm vaccine" || 
               item.notificationType === "ConsentRequest" ||
               (item.title && (
                 item.title.toLowerCase().includes("vaccine") || 
                 item.title.toLowerCase().includes("tiêm") || 
                 item.title.toLowerCase().includes("tham gia sự kiện")
               ))
      );
      
      // Tạo mảng thông báo đã được cập nhật với thông tin học sinh
      const updatedNotifications = [];
      // Tạo Map để theo dõi các cặp (eventID, studentID) đã được xử lý
      const processedEvents = new Map();
      
      // Duyệt qua từng thông báo sự kiện
      for (const notification of eventNotifications) {
        const eventID = notification.relatedEntityID;
        
        // Nếu có thông tin StudentJoinEvent cho sự kiện này
        if (eventID && eventMap[eventID] && eventMap[eventID].length > 0) {
          // Tạo thông báo riêng cho từng học sinh trong sự kiện
          eventMap[eventID].forEach((studentEvent, index) => {
            // Tạo key duy nhất cho cặp (eventID, studentID)
            const eventStudentKey = `${eventID}_${studentEvent.studentID}`;
            
            // Kiểm tra xem cặp này đã được xử lý chưa
            if (!processedEvents.has(eventStudentKey)) {
              // Đánh dấu cặp này đã được xử lý
              processedEvents.set(eventStudentKey, true);
              
              // Tạo bản sao thông báo với thông tin học sinh
              const newNotification = {
                ...notification,
                notificationID: index === 0 ? notification.notificationID : `${notification.notificationID}_${index}`,
                title: `[${studentEvent.studentName || ''}] ${notification.title.replace(/^\[[^\]]*\]\s*/, '')}`,
                _originalNotificationID: notification.notificationID,
                studentInfo: {
                  studentID: studentEvent.studentID,
                  studentName: studentEvent.studentName || "",
                  eventID: eventID,
                  studentJoinEventID: studentEvent.studentJoinEventID,
                  status: mapStatusToVietnamese(studentEvent.status)
                }
              };
              
              // Thêm vào danh sách thông báo đã cập nhật
              updatedNotifications.push(newNotification);
            }
          });
        } else {
          // Nếu không có thông tin StudentJoinEvent, kiểm tra trùng lặp bằng eventID
          const eventKey = `${eventID}_unknown`;
          if (!processedEvents.has(eventKey)) {
            processedEvents.set(eventKey, true);
            updatedNotifications.push(notification);
          }
        }
      }
      
      // Thêm các thông báo không phải sự kiện vào danh sách
      const nonEventNotifications = mappedData.filter(
        item => !(item.notificationType === "Thông báo tiêm vaccine" || 
                item.notificationType === "ConsentRequest" ||
                (item.title && (
                  item.title.toLowerCase().includes("vaccine") || 
                  item.title.toLowerCase().includes("tiêm") || 
                  item.title.toLowerCase().includes("tham gia sự kiện")
                )))
      );
      
      // Cập nhật state
      setData([...updatedNotifications, ...nonEventNotifications]);
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
          // eslint-disable-next-line no-unused-vars
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

  // Hàm để chuyển đến trang ConfirmEvent.jsx với thông tin học sinh
  const navigateToConfirmEvent = (item) => {
    // Lưu thông tin học sinh vào localStorage để truyền sang trang ConfirmEvent
    if (item.studentInfo && item.studentInfo.studentID) {
      localStorage.setItem('selectedEventStudent', JSON.stringify({
        studentID: item.studentInfo.studentID,
        studentName: item.studentInfo.studentName,
        eventID: item.relatedEntityID,
        eventTitle: item.title.replace(/^\[[^\]]*\]\s*/, '')
      }));
    }
    // Chuyển đến trang ConfirmEvent
    window.location.href = "/confirm-event";
  };

  // eslint-disable-next-line no-unused-vars
  const handleAttendance = async (item, isAttend, type) => {
    // Lấy thông tin học sinh từ item nếu có
    if (item.studentInfo && item.studentInfo.studentID) {
      setModalStudent({
        studentID: item.studentInfo.studentID,
        studentName: item.studentInfo.studentName,
        className: item.studentInfo.className || "",
        eventTitle: item.title.replace(/^\[[^\]]*\]\s*/, ''), // Xóa phần [Tên học sinh] khỏi tiêu đề
        eventID: item.relatedEntityID,
        studentJoinEventID: item.studentInfo.studentJoinEventID
      });
      setSelectedStudentId(item.studentInfo.studentID);
    } else {
      // Kiểm tra nếu là notificationID tạo động (có dạng string với _)
      const notificationId = item.notificationID;
      const isCustomNotification = notificationId.toString().includes('_');
      // eslint-disable-next-line no-unused-vars
      // const originalNotificationId = isCustomNotification ? notificationId.split('_')[0] : notificationId;
      
      // Tìm StudentJoinEvent phù hợp
      const eventID = item.relatedEntityID;
      const studentEvents = allJoinRequests.filter(req => req.eventID === eventID);
      
      if (studentEvents.length > 0) {
        // Nếu có nhiều học sinh, hiển thị thông tin học sinh đầu tiên
        const studentEvent = studentEvents[0];
        setModalStudent({
          studentID: studentEvent.studentID,
          studentName: studentEvent.studentName,
          className: "",
          eventTitle: item.title.replace(/^\[[^\]]*\]\s*/, ''), // Xóa phần [Tên học sinh] khỏi tiêu đề
          eventID: eventID,
          studentJoinEventID: studentEvent.studentJoinEventID
        });
        setSelectedStudentId(studentEvent.studentID);
      } else {
        // Nếu không tìm thấy, thử lấy từ API
        try {
          const res = await api.get(
            `Notifications/${isCustomNotification ? item._originalNotificationID : notificationId}/student`
          );
          setModalStudent({
            studentID: res.data.studentID,
            studentName: res.data.studentName,
            className: res.data.className || "",
            eventTitle: item.title,
            eventID: item.relatedEntityID
          });
          setSelectedStudentId(res.data.studentID);
        } catch {
          setModalStudent({ 
            studentID: null, 
            studentName: "",
            className: "",
            eventTitle: item.title
          });
          setSelectedStudentId(null);
          message.error("Không lấy được thông tin học sinh cho xác nhận!");
          return;
        }
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
      // Lấy thông tin thông báo
      const notificationId = attendanceModal.notificationId;
      // Kiểm tra nếu là notificationID tạo động (có dạng string với _)
      const originalNotificationId = notificationId.toString().includes('_') 
        ? notificationId.split('_')[0] 
        : notificationId;
      
      // Tìm thông báo gốc nếu cần
      const originalNotification = data.find(item => 
        item.notificationID === originalNotificationId || 
        item.notificationID === notificationId
      );
      
      // Sử dụng API StudentJoinEvent để gửi phản hồi
      await api.put("StudentJoinEvent/respond-by-student", {
        studentId: selectedStudentId,
        eventId: modalStudent.eventID || originalNotification?.relatedEntityID,
        status: attendanceModal.isAttend ? STATUS.ACCEPTED : STATUS.REJECTED,
        note: noteDecline,
      });
      
      // Cập nhật trạng thái trong state
      setData((prevData) =>
        prevData.map((item) => {
          // Cập nhật cả thông báo gốc và thông báo tạo động có cùng sự kiện
          if (item.notificationID === notificationId || 
              (item._originalNotificationID && item._originalNotificationID === originalNotificationId)) {
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
      setModalStudent({ studentID: null, studentName: "", className: "", eventTitle: "" });
      
      // Tải lại dữ liệu sau khi cập nhật
      if (parent?.accountID) {
        fetchDataNotificationOfParent(parent.accountID);
      }
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
              
              // Xác định nếu là thông báo tiêm chủng hoặc sự kiện
              const isEvent = 
                item.notificationType === "Thông báo tiêm vaccine" ||
                item.notificationType === "ConsentRequest" ||
                (item.title && (
                  item.title.toLowerCase().includes("vaccine") || 
                  item.title.toLowerCase().includes("tiêm") || 
                  item.title.toLowerCase().includes("tham gia sự kiện")
                ));
              
              // Lấy thông tin học sinh từ item.studentInfo nếu có
              const studentInfo = item.studentInfo || {};
              
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
                          {isMedicineApproved && studentInfo.studentName
                            ? `Thông báo học sinh ${studentInfo.studentName} đã được nhân viên y tế cho sử dụng thuốc, vật dụng y tế thành công`
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
                                <span style={{ color: '#1677ff' }}>Sự kiện:</span> {item.title.replace(/^\[[^\]]*\]\s*/, '')}
                              </div>
                              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                                <span style={{ color: '#1677ff' }}>Ngày tổ chức:</span> {item.sentDate ? new Date(item.sentDate).toLocaleDateString('vi-VN') : ''}
                              </div>
                              {/* Hiển thị thông tin học sinh cho sự kiện */}
                              {isEvent && studentInfo.studentName && (
                                <div style={{ fontWeight: 500, marginBottom: 8 }}>
                                  <span style={{ color: '#1677ff' }}>Học sinh:</span> {studentInfo.studentName}
                                  {studentInfo.className && ` - ${studentInfo.className}`}
                                </div>
                              )}
                              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                                <span style={{ color: '#1677ff' }}>Trạng thái:</span> {studentInfo.status || status}
                              </div>
                              {/* Nút xác nhận sự kiện cho các thông báo không phải gửi thuốc đã approved */}
                              {!isMedicineApproved && isEvent && (
                    <Button
                      type="primary"
                      style={{ marginTop: 12 }}
                      onClick={() => navigateToConfirmEvent(item)}
                    >
                      Xem chi tiết
                    </Button>
                              )}
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
          attendanceModal.isAttend 
            ? `Xác nhận tham gia sự kiện${modalStudent.studentName ? ` cho học sinh ${modalStudent.studentName}` : ''}`
            : `Từ chối tham gia sự kiện${modalStudent.studentName ? ` cho học sinh ${modalStudent.studentName}` : ''}`
        }
        onCancel={() => {
          setAttendanceModal({
            open: false,
            notificationId: null,
            isAttend: true,
            type: "ConsentRequest",
          });
          setModalStudent({ studentID: null, studentName: "", className: "", eventTitle: "" });
        }}
        onOk={submitAttendance}
        okText={attendanceModal.isAttend ? "Đồng ý" : "Gửi từ chối"}
        cancelText="Huỷ"
        confirmLoading={submitting}
        okButtonProps={{ disabled: !selectedStudentId }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {modalStudent.studentID && (
            <>
              <div style={{ color: "#1677ff", fontWeight: 600, fontSize: 16 }}>
                Học sinh: {modalStudent.studentName}
                {modalStudent.className && ` - ${modalStudent.className}`}
              </div>
              <div style={{ marginBottom: 10 }}>
                <b>Sự kiện:</b> {modalStudent.eventTitle || ""}
              </div>
            </>
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
