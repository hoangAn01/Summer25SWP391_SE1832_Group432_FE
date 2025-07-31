import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Tag,
  Typography,
  Space,
  Spin,
  Input,
  message,
  Flex,
  Avatar,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../../../../config/axios";
import "./ConfirmEvent.css";

const { Title, Text, Paragraph } = Typography;

const STATUS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

const ConfirmEvent = () => {
  const parent = useSelector((state) => state.parent.parent);
  const [selectedEventStudent, setSelectedEventStudent] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [joinStatus, setJoinStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('selectedEventStudent');
    if (saved && parent?.parentID) {
      const info = JSON.parse(saved);
      setSelectedEventStudent(info);
      fetchEventDetailAndStatus(info);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [parent?.parentID]);

  const fetchEventDetailAndStatus = async (info) => {
    setLoading(true);
    try {
      const eventRes = await api.get(`Event/${info.eventID}`);
      const joinRes = await api.get(`StudentJoinEvent/by-parent/${parent.parentID}`);
      const joinList = joinRes.data.$values || joinRes.data;
      const join = joinList.find(
        j => j.studentID === info.studentID && j.eventID === info.eventID
      );
      setEventDetail(eventRes.data);
      setJoinStatus(join);
    } catch {
      message.error("Không thể tải chi tiết sự kiện hoặc trạng thái xác nhận!");
    }
    setLoading(false);
  };

  const handleConfirm = async (isAccept) => {
    if (!joinStatus) return;
    setIsSubmitting(true);
    try {
      await api.put("/StudentJoinEvent/respond-by-student", {
        studentId: joinStatus.studentID,
        eventId: joinStatus.eventID,
        status: isAccept ? STATUS.ACCEPTED : STATUS.REJECTED,
        note,
      });
      toast.success(isAccept ? "Đã xác nhận tham gia sự kiện!" : "Đã từ chối tham gia sự kiện!");
      setJoinStatus({ ...joinStatus, status: isAccept ? STATUS.ACCEPTED : STATUS.REJECTED, note });
    } catch {
      message.error("Gửi phản hồi thất bại. Vui lòng thử lại!");
    }
    setIsSubmitting(false);
  };

  // Xác định class dựa trên trạng thái
  const getStatusClass = () => {
    if (!joinStatus) return "confirm-event-card-pending";
    
    switch (joinStatus.status) {
      case STATUS.ACCEPTED:
        return "confirm-event-card-accepted";
      case STATUS.REJECTED:
        return "confirm-event-card-rejected";
      default:
        return "confirm-event-card-pending";
    }
  };

  const getAvatarClass = () => {
    if (!joinStatus) return "confirm-event-avatar-pending";
    
    switch (joinStatus.status) {
      case STATUS.ACCEPTED:
        return "confirm-event-avatar-accepted";
      case STATUS.REJECTED:
        return "confirm-event-avatar-rejected";
      default:
        return "confirm-event-avatar-pending";
    }
  };

  return (
    <div className="confirm-event-container">
      {/* Nút quay lại */}
      <div style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => window.location.href = "/event"}
          style={{ borderRadius: 8 }}
        >
          Quay lại danh sách thông báo
        </Button>
      </div>
      
      <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
        {selectedEventStudent && eventDetail && joinStatus && (
          <Card
            className={`confirm-event-card ${getStatusClass()}`}
            bodyStyle={{
              padding: 0,
            }}
          >
            {/* Header với tiêu đề sự kiện */}
            <div className="confirm-event-header">
              <Flex align="center" gap={20}>
                <Avatar 
                  size={80} 
                  icon={<CalendarOutlined style={{ fontSize: 40 }} />} 
                  className={`confirm-event-avatar ${getAvatarClass()}`}
                />
                <div>
                  <Title level={2} className="confirm-event-title">
                    {eventDetail.eventName || selectedEventStudent.eventTitle}
                  </Title>
                  <Text type="secondary" className="confirm-event-subtitle">
                    Mã sự kiện: #{eventDetail.eventID || selectedEventStudent.eventID}
                  </Text>
                </div>
              </Flex>
            </div>

            {/* Nội dung chính */}
            <div className="confirm-event-body">
              {/* Thông tin sự kiện */}
              <Flex vertical gap={24}>
                <Flex align="center" gap={16}>
                  <CalendarOutlined className="confirm-event-icon" />
                  <Text strong className="confirm-event-label">Thời gian:</Text>
                  <Text className="confirm-event-label">
                    {eventDetail.eventDate 
                      ? new Date(eventDetail.eventDate).toLocaleString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) 
                      : 'Chưa xác định'}
                  </Text>
                </Flex>

                <Flex align="center" gap={16}>
                  <UserOutlined className="confirm-event-icon" />
                  <Text strong className="confirm-event-label">Học sinh:</Text>
                  <Text className="confirm-event-label">{selectedEventStudent.studentName}</Text>
                </Flex>

                <Flex align="flex-start" gap={16}>
                  <FileTextOutlined className="confirm-event-icon" style={{ marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <Text strong className="confirm-event-label">Mô tả:</Text>
                    <div style={{ 
                      backgroundColor: '#fafafa', 
                      padding: '12px', 
                      borderRadius: '6px',
                      marginTop: '8px',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.8'
                    }}>
                      {eventDetail.description || 'Không có mô tả chi tiết.'}
                    </div>
                  </div>
                </Flex>

                {/* Trạng thái */}
                <Flex align="center" gap={16}>
                  <InfoCircleOutlined className="confirm-event-icon" />
                  <Text strong className="confirm-event-label">Trạng thái:</Text>
                  {joinStatus.status === STATUS.ACCEPTED ? (
                    <Tag 
                      icon={<CheckCircleOutlined />} 
                      color="success"
                      className="confirm-event-tag"
                    >
                      Đã đồng ý tham gia
                    </Tag>
                  ) : joinStatus.status === STATUS.REJECTED ? (
                    <Tag 
                      icon={<CloseCircleOutlined />} 
                      color="error"
                      className="confirm-event-tag"
                    >
                      Đã từ chối tham gia
                    </Tag>
                  ) : (
                    <Tag 
                      icon={<ClockCircleOutlined />} 
                      color="warning"
                      className="confirm-event-tag"
                    >
                      Chờ phản hồi
                    </Tag>
                  )}
                </Flex>

                {/* Ghi chú nếu đã có */}
                {joinStatus.status !== STATUS.PENDING && joinStatus.note && (
                  <div className="confirm-event-note-container">
                    <Text strong className="confirm-event-label">Ghi chú:</Text>
                    <Paragraph style={{ margin: '12px 0 0 0', fontSize: 16, lineHeight: '1.6' }}>
                      {joinStatus.note}
                    </Paragraph>
                  </div>
                )}
              </Flex>

              {/* Phần xác nhận */}
              {joinStatus.status === STATUS.PENDING && (
                <>
                  <Divider className="confirm-event-divider" />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {/* <Input.TextArea
                      rows={4}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Ghi chú cho nhà trường (tuỳ chọn)"
                      className="confirm-event-textarea"
                    /> */}
                    <Flex justify="center" gap={24} className="confirm-event-button-container">
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        size="large"
                        loading={isSubmitting}
                        onClick={() => handleConfirm(true)}
                        className="confirm-event-button confirm-event-button-accept"
                      >
                        Đồng ý tham gia
                      </Button>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        size="large"
                        loading={isSubmitting}
                        onClick={() => handleConfirm(false)}
                        className="confirm-event-button confirm-event-button-reject"
                      >
                        Từ chối tham gia
                      </Button>
                    </Flex>
                  </Space>
                </>
              )}
            </div>
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default ConfirmEvent;
