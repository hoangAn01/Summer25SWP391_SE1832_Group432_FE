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
  BellOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  ExclamationCircleTwoTone,
  UserOutlined,
} from "@ant-design/icons";
import api from "../../../../config/axios";
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
  const [statusFilter, setStatusFilter] = useState("ALL"); // Thêm bộ lọc trạng thái
  const [studentFilter, setStudentFilter] = useState("ALL"); // Thêm bộ lọc học sinh
  const [searchQuery, setSearchQuery] = useState(""); // Thêm state cho thanh tìm kiếm
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
  // Thêm state để lưu thông tin học sinh cho mỗi thông báo
  // eslint-disable-next-line no-unused-vars
  const [studentInfoMap, setStudentInfoMap] = useState({});
  // Thêm state để lưu thông tin StudentJoinEvent
  // eslint-disable-next-line no-unused-vars
  const [studentJoinEvents, setStudentJoinEvents] = useState({});
  // Thêm state để lưu tất cả các yêu cầu tham gia sự kiện
  const [allJoinRequests, setAllJoinRequests] = useState([]);
  const [medicineDetail, setMedicineDetail] = useState(null);
  const [nurseName, setNurseName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentName, setStudentName] = useState("");
  const [nurseNote, setNurseNote] = useState("");
  const [checkupDetail, setCheckupDetail] = useState(null);
  const [checkupStudentName, setCheckupStudentName] = useState("");
  const [checkupNurseName, setCheckupNurseName] = useState("");

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
                title: `Thông báo xác nhận học sinh ${studentEvent.studentName || ''}  ${notification.title.replace(/^\[[^\]]*\]\s*/, '')} `,
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
      const finalData = [...updatedNotifications, ...nonEventNotifications];
      console.log("Final notification data:", finalData.map(item => ({
        notificationType: item.notificationType,
        title: item.title,
        relatedEntityID: item.relatedEntityID
      })));
      setData(finalData);
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
      
      // Lấy thông tin phụ huynh trước
      (async () => {
        try {
          const parentResponse = await api.get(
            `Parent/ByAccount/${parent.accountID}`
          );
          if (parentResponse.data && parentResponse.data.parentID) {
            // Lấy danh sách học sinh theo parentID
            try {
              const res = await api.get(`Student/by-parent/${parentResponse.data.parentID}`);
              const list = res.data.$values || res.data;
              console.log("Danh sách học sinh:", list);
              setStudentsOfParent(Array.isArray(list) ? list : []);
              if (list && list.length > 0) setSelectedStudentId(list[0].studentID);
            } catch (err) {
              console.error("Lỗi khi lấy danh sách học sinh:", err);
              setStudentsOfParent([]);
            }
            
            // Lấy thông báo
            fetchDataNotificationOfParent(parent.accountID);
          }
        } catch (err) {
          console.error("Lỗi khi lấy thông tin phụ huynh:", err);
        }
      })();
    }
  }, []);

  const filteredData = useMemo(() => {
    console.log("Filtering data:", {
      totalData: data.length,
      typeFilter,
      statusFilter,
      studentFilter,
      searchQuery
    });
    
    // Bước 1: Lọc theo loại thông báo
    let filtered = data;
    if (typeFilter !== "ALL") {
      if (typeFilter === "OTHER") {
        filtered = data.filter(item => 
          item.notificationType !== "ConsentRequest" && 
          item.notificationType !== "MedicineRequest" &&
          item.notificationType !== "CheckupRecord"
        );
      } else {
        filtered = data.filter(item => {
          console.log("Checking notification type:", {
            itemType: item.notificationType,
            filterType: typeFilter,
            title: item.title
          });
          return item.notificationType === typeFilter;
        });
      }
    }
    
    console.log("After type filter:", filtered.length);

    // Bước 2: Lọc theo trạng thái
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(item => {
        // Nếu có studentInfo với trạng thái cụ thể
        if (item.studentInfo && item.studentInfo.status) {
          const status = item.studentInfo.status.toLowerCase();
          if (statusFilter === "Accepted" && (status === "đã đồng ý" || status.includes("accept"))) {
            return true;
          } else if (statusFilter === "Rejected" && (status === "đã từ chối" || status.includes("reject"))) {
            return true;
          } else if (statusFilter === "Pending" && (status === "chờ phản hồi" || status.includes("pend"))) {
            return true;
          }
          return false;
        } 
        // Sử dụng trạng thái tổng quát của thông báo nếu không có studentInfo
        else if (item.status) {
          const status = item.status.toLowerCase();
          if (statusFilter === "Accepted" && (status === "đã đồng ý" || status.includes("accept"))) {
            return true;
          } else if (statusFilter === "Rejected" && (status === "đã từ chối" || status.includes("reject"))) {
            return true;
          } else if (statusFilter === "Pending" && (status === "chờ phản hồi" || status.includes("pend"))) {
            return true;
          }
          return false;
        }
        return false;
      });
    }

    // Bước 3: Lọc theo học sinh
    if (studentFilter !== "ALL") {
      filtered = filtered.filter(item => {
        // Kiểm tra studentInfo trước (cho sự kiện)
        if (item.studentInfo && item.studentInfo.studentID) {
          return item.studentInfo.studentID.toString() === studentFilter.toString();
        }
        
        // Nếu không có studentInfo, kiểm tra xem có phải thông báo thuốc hoặc khám sức khỏe không
        // và lấy thông tin học sinh từ relatedEntityID
        if ((item.notificationType === "MedicineRequest" || item.notificationType === "CheckupRecord") && item.relatedEntityID) {
          // Tạm thời bỏ qua lọc theo học sinh cho thông báo thuốc và khám sức khỏe
          // vì cần fetch thêm dữ liệu từ API
          return true;
        }
        
        return false;
      });
    }
    
    // Bước 4: Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const title = (item.title || "").toLowerCase();
        const content = (item.content || item.description || "").toLowerCase();
        const type = (item.notificationType || "").toLowerCase();
        const studentName = (item.studentInfo?.studentName || "").toLowerCase();
        
        return title.includes(query) || 
               content.includes(query) || 
               type.includes(query) ||
               studentName.includes(query);
      });
    }

    // Bước 5: Sắp xếp theo thời gian gần nhất (mới nhất lên đầu)
    filtered = filtered.sort((a, b) => {
      const dateA = a.sentDate ? new Date(a.sentDate) : new Date(0);
      const dateB = b.sentDate ? new Date(b.sentDate) : new Date(0);
      return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
    });

    return filtered;
  }, [data, typeFilter, statusFilter, studentFilter, searchQuery]);

  const handleOpen = async (item) => {
    setOpenedId(item.notificationID);
    if (!readIds.includes(item.notificationID)) {
      const newReadIds = [...readIds, item.notificationID];
      setReadIds(newReadIds);
      localStorage.setItem("readNotificationIds", JSON.stringify(newReadIds));
    }
    
    // Nếu là thông báo thuốc thì fetch chi tiết đơn thuốc
    const isMedicineNotification =
      item.notificationType === "MedicineRequest" ||
      item.notificationType === "Duyệt thuốc" ||
      (item.title && (
        item.title.toLowerCase().includes("yêu cầu thuốc") ||
        item.title.toLowerCase().includes("thuốc") ||
        item.title.toLowerCase().includes("medicine")
      ));
    
    // Nếu là thông báo khám sức khỏe định kỳ thì fetch chi tiết khám
    const isCheckupNotification =
      item.notificationType === "CheckupRecord" ||
      (item.title && (
        item.title.toLowerCase().includes("khám sức khỏe") ||
        item.title.toLowerCase().includes("kết quả khám") ||
        item.title.toLowerCase().includes("checkup")
      ));
    
    if (isMedicineNotification && item.relatedEntityID) {
      try {
        console.log("Fetching medicine details for:", item.relatedEntityID);
        const res = await api.get(`/MedicineRequest/${item.relatedEntityID}`);
        const medicineData = res.data;
        console.log("Medicine data received:", medicineData);
        
        // Xử lý medicineDetails để đảm bảo có cấu trúc đúng
        if (medicineData.medicineDetails) {
          const details = medicineData.medicineDetails.$values || medicineData.medicineDetails;
          medicineData.medicineDetails = Array.isArray(details) ? details : [];
        }
        
        setMedicineDetail(medicineData);
        
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
        
        // Lấy thông tin học sinh
        if (res.data.studentID) {
          try {
            const studentRes = await api.get(`/Student/${res.data.studentID}`);
            setStudentClass(studentRes.data.className || studentRes.data.class || "");
            setStudentName(studentRes.data.fullName || "");
          } catch {
            setStudentClass("");
            setStudentName("");
          }
        } else {
          setStudentClass("");
          setStudentName("");
        }
        
        // Lấy ghi chú của y tá
        setNurseNote(res.data.nurseNote || res.data.note || "");
      } catch {
        setMedicineDetail(null);
        setNurseName("");
        setStudentClass("");
        setStudentName("");
        setNurseNote("");
      }
    } else if (isCheckupNotification && item.relatedEntityID) {
      try {
        console.log("Fetching checkup details for:", item.relatedEntityID);
        const res = await api.get(`/CheckupRecord/${item.relatedEntityID}`);
        const checkupData = res.data;
        console.log("Checkup data received:", checkupData);
        
        setCheckupDetail(checkupData);
        
        // Lấy tên học sinh
        if (checkupData.studentID) {
          try {
            const studentRes = await api.get(`/Student/${checkupData.studentID}`);
            setCheckupStudentName(studentRes.data.fullName || "");
          } catch {
            setCheckupStudentName("");
          }
        } else {
          setCheckupStudentName("");
        }
        
        // Lấy tên y tá
        if (checkupData.nurseID) {
          try {
            const nurseRes = await api.get(`/Nurse/${checkupData.nurseID}`);
            setCheckupNurseName(nurseRes.data.fullName || "");
          } catch {
            setCheckupNurseName("");
          }
        } else {
          setCheckupNurseName("");
        }
      } catch {
        setCheckupDetail(null);
        setCheckupStudentName("");
        setCheckupNurseName("");
      }
    } else {
      setMedicineDetail(null);
      setNurseName("");
      setStudentClass("");
      setStudentName("");
      setNurseNote("");
      setCheckupDetail(null);
      setCheckupStudentName("");
      setCheckupNurseName("");
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
        background: 'linear-gradient(135deg, #f4f8fb 60%, #e6f0ff 100%)',
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
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 22,
        boxShadow: '0 6px 32px #dbeafe55',
        padding: 36,
        border: '1px solid #e6f4ff',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <BellOutlined style={{ fontSize: 36, color: '#1677ff', background: '#e6f4ff', borderRadius: '50%', padding: 8, boxShadow: '0 2px 8px #bae7ff55' }} />
          <Title level={2} style={{ marginBottom: 0, textAlign: 'left', color: '#1677ff', fontWeight: 800, letterSpacing: 1, fontSize: 32 }}>
            Thông Báo
          </Title>
        </div>
        <Divider style={{ margin: '12px 0 24px 0' }} />
        {/* Bộ lọc loại thông báo */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Thêm thanh tìm kiếm */}
          <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <span style={{ fontWeight: 500, marginBottom: 4, color: '#1677ff', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FilterOutlined /> Tìm kiếm thông báo
            </span>
            <Input.Search
              placeholder="Nhập từ khóa tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: 12, background: '#f0f5ff' }}
              allowClear
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 500, marginBottom: 4, color: '#1677ff', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FilterOutlined /> Loại thông báo
            </span>
            <Select
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value);
                // Reset bộ lọc trạng thái khi đổi loại thông báo
                setStatusFilter("ALL");
              }}
              style={{ width: 200, borderRadius: 12, background: '#f0f5ff' }}
              placeholder="Chọn loại thông báo"
              options={[
                { value: "ALL", label: <span><InfoCircleOutlined /> Tất cả</span> },
                { value: "ConsentRequest", label: <span style={{ color: '#52c41a' }}>📅 Xác nhận sự kiện</span> },
                { value: "MedicineRequest", label: <span style={{ color: '#1677ff' }}>💊 Gửi thuốc</span> },
                { value: "CheckupRecord", label: <span style={{ color: '#fa8c16' }}>🏥 Khám sức khỏe</span> },
                { value: "OTHER", label: <span style={{ color: '#b37feb' }}>🔔 Khác</span> },
              ]}
            />
          </div>

          {/* Bộ lọc trạng thái - chỉ hiển thị khi loại thông báo là xác nhận sự kiện */}
          {typeFilter === "ConsentRequest" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 500, marginBottom: 4, color: '#1677ff', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircleOutlined /> Trạng thái
              </span>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200, borderRadius: 12, background: '#f0f5ff' }}
                placeholder="Trạng thái"
                options={[
                  { value: "ALL", label: <span><InfoCircleOutlined /> Tất cả</span> },
                  { value: "Accepted", label: <span style={{ color: '#52c41a' }}><CheckCircleTwoTone twoToneColor="#52c41a" /> Đã đồng ý</span> },
                  { value: "Pending", label: <span style={{ color: '#faad14' }}><ExclamationCircleTwoTone twoToneColor="#faad14" /> Chờ phản hồi</span> },
                  { value: "Rejected", label: <span style={{ color: '#ff4d4f' }}><CloseCircleTwoTone twoToneColor="#ff4d4f" /> Đã từ chối</span> },
                ]}
              />
            </div>
          )}

          {/* Bộ lọc học sinh */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 500, marginBottom: 4, color: '#1677ff', display: 'flex', alignItems: 'center', gap: 4 }}>
              <UserOutlined /> Học sinh
            </span>
            <Select
              value={studentFilter}
              onChange={setStudentFilter}
              style={{ width: 200, borderRadius: 12, background: '#f0f5ff' }}
              placeholder="Chọn học sinh"
              options={[
                { value: "ALL", label: <span><InfoCircleOutlined /> Tất cả học sinh</span> },
                ...studentsOfParent.map(student => ({
                  value: student.studentID,
                  label: student.fullName
                }))
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
              // Xác định nếu là thông báo thuốc
              const isMedicineNotification =
                item.notificationType === "MedicineRequest" ||
                item.notificationType === "Duyệt thuốc" ||
                (item.title && (
                  item.title.toLowerCase().includes("yêu cầu thuốc") ||
                  item.title.toLowerCase().includes("thuốc") ||
                  item.title.toLowerCase().includes("medicine")
                ));
              
              // Xác định nếu là thông báo khám sức khỏe định kỳ
              const isCheckupNotification =
                item.notificationType === "CheckupRecord" ||
                (item.title && (
                  item.title.toLowerCase().includes("khám sức khỏe") ||
                  item.title.toLowerCase().includes("kết quả khám") ||
                  item.title.toLowerCase().includes("checkup")
                ));
              
              console.log("Notification item:", {
                notificationType: item.notificationType,
                title: item.title,
                isMedicineNotification: isMedicineNotification,
                relatedEntityID: item.relatedEntityID
              });
              
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
              
            // Icon trạng thái
            let statusIcon = <InfoCircleOutlined style={{ color: '#bfbfbf', fontSize: 22 }} />;
            if (status === 'Đã đồng ý') statusIcon = <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 22 }} />;
            else if (status === 'Đã từ chối') statusIcon = <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 22 }} />;
            else if (status === 'Chờ phản hồi') statusIcon = <ExclamationCircleTwoTone twoToneColor="#faad14" style={{ fontSize: 22 }} />;

            return (
              <Card
                key={item.notificationID}
                style={{
                  marginBottom: 28,
                  background: readIds.includes(item.notificationID)
                    ? 'linear-gradient(90deg, #f6faff 80%, #e6f7ff 100%)'
                    : 'linear-gradient(90deg, #e6f7ff 80%, #f6faff 100%)',
                  borderRadius: 18,
                  boxShadow: '0 4px 18px #e0e7ef33',
                  border: '1px solid #bae7ff',
                  padding: 0,
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                bodyStyle={{ padding: 0 }}
                onClick={() => handleOpen(item)}
                hoverable
              >
                <div style={{ padding: 28, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ flex: 'none' }}>{statusIcon}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: 19, color: '#222' }}>
                      {item.title}
                    </span>
                    <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
                      {item.sentDate
                        ? `Đã nhận: ${new Date(item.sentDate).toLocaleString('vi-VN')}`
                        : ''}
                    </div>
                  </div>
                </div>
                {/* Chi tiết thông báo */}
                {openedId === item.notificationID && (
                  <div style={{ margin: '0 28px 18px 28px', background: '#f8faff', borderRadius: 12, boxShadow: '0 2px 8px #e6f7ff55', padding: 24, border: '1px solid #e6f7ff' }}>
                    <div style={{ fontWeight: 500, marginBottom: 8 }}>
                      <span style={{ color: '#1677ff' }}>Sự kiện:</span> {item.title.includes('tham gia sự kiện') ? item.title.split('tham gia sự kiện ')[1].split(' đã có')[0] : item.title.replace(/^\[[^\]]*\]\s*/, '')}
                    </div>
                    {/* Hiển thị thông tin học sinh cho sự kiện */}
                    {isEvent && studentInfo.studentName && (
                      <div style={{ fontWeight: 500, marginBottom: 8 }}>
                        <span style={{ color: '#1677ff' }}>Học sinh:</span> {studentInfo.studentName}
                        {studentInfo.className && ` - ${studentInfo.className}`}
                      </div>
                    )}
                    {/* Ẩn dòng trạng thái trong chi tiết */}
                    {/*
                    <div style={{ fontWeight: 500, marginBottom: 8 }}>
                      <span style={{ color: '#1677ff' }}>Trạng thái:</span> {studentInfo.status || status}
                    </div>
                    */}
                    {/* Hiển thị chi tiết thuốc nếu có */}
                    {console.log("Rendering medicine details:", { isMedicineNotification, medicineDetail })}
                    {isMedicineNotification && medicineDetail && (
                      <div style={{ marginTop: 8 }}>
                        {studentName && (
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            <span style={{ color: '#1677ff' }}>Học sinh:</span> {studentName}
                          </div>
                        )}
                        {studentClass && (
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            <span style={{ color: '#1677ff' }}></span> {studentClass}
                          </div>
                        )}
                        {medicineDetail.medicineDetails && Array.isArray(medicineDetail.medicineDetails) && (
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            <span style={{ color: '#1677ff' }}>Thông tin đơn thuốc:</span>
                            <div style={{ marginLeft: 16, marginTop: 4 }}>
                              {medicineDetail.medicineDetails.map((detail, index) => (
                                <div key={index} style={{ marginBottom: 2, fontSize: 13 }}>
                                  • {detail.requestItemName || detail.medicineName} - Số lượng: {detail.quantity}
                                  {detail.dosageInstructions && ` - Liều dùng: ${detail.dosageInstructions}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {nurseName && (
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            <span style={{ color: '#1677ff' }}>Nhân viên y tế:</span> {nurseName}
                          </div>
                        )}
                        {nurseNote && (
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            <span style={{ color: '#1677ff' }}>Ghi chú của nhân viên y tế:</span> {nurseNote}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Hiển thị thông báo khám sức khỏe đơn giản */}
                    {console.log("Rendering checkup details:", { isCheckupNotification, checkupDetail })}
                    {isCheckupNotification && checkupDetail && (
                      <div style={{ marginTop: 8 }}>
                        {checkupStudentName && (
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            <span style={{ color: '#1677ff' }}>Học sinh:</span> {checkupStudentName}
                          </div>
                        )}
                        <div style={{ fontWeight: 500, marginBottom: 4, color: '#52c41a' }}>
                          ✅ <strong>Đã được khám thành công</strong>
                        </div>
                        {checkupNurseName && (
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            <span style={{ color: '#1677ff' }}>Nhân viên y tế:</span> {checkupNurseName} <strong>đã gửi phiếu kết quả cho học sinh</strong>
                          </div>
                        )}
                        {checkupDetail.checkupDate && (
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            <span style={{ color: '#1677ff' }}>Ngày khám:</span> {new Date(checkupDetail.checkupDate).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Nút xác nhận sự kiện cho các thông báo không phải gửi thuốc */}
                    {!isMedicineNotification && !isCheckupNotification && isEvent && (
                      <Button
                        type="primary"
                        style={{ marginTop: 12 }}
                        onClick={() => navigateToConfirmEvent(item)}
                      >
                        Xem chi tiết
                      </Button>
                    )}
                  </div>
                )}
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
