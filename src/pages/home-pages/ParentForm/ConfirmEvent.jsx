import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Divider,
  Modal,
  Input,
  Space,
  Spin,
  Empty,
  Flex, // Import Flex for better layout
} from "antd";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../../../config/axios";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"; // Import icons for actions

const { Title, Text, Paragraph } = Typography;

// --- Constants for status strings to prevent typos ---
const STATUS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

// --- A small helper component for status tags for cleaner JSX ---
const StatusTag = ({ status }) => {
  switch (status) {
    case STATUS.ACCEPTED:
      return <Tag color="success">Đã đồng ý</Tag>;
    case STATUS.REJECTED:
      return <Tag color="error">Đã từ chối</Tag>;
    case STATUS.PENDING:
    default:
      return <Tag color="warning">Chờ phản hồi</Tag>;
  }
};

const ConfirmEvent = () => {
  const parent = useSelector((state) => state.parent.parent);

  // --- State Management ---
  const [allJoinRequests, setAllJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ item: null, isAttending: true });
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Derived State with useMemo for performance ---
  const pendingList = useMemo(
    () => allJoinRequests.filter((req) => req.status === STATUS.PENDING),
    [allJoinRequests]
  );
  const historyList = useMemo(
    () => allJoinRequests.filter((req) => req.status !== STATUS.PENDING),
    [allJoinRequests]
  );

  // --- Data Fetching ---
  const fetchJoinEvents = async (parentId) => {
    setLoading(true);
    try {
      // Assuming 'api' instance already has the base URL configured
      // The original GET URL: `StudentJoinEvent/by-parent/${parentId}`
      const response = await api.get(`StudentJoinEvent/by-parent/${parentId}`);
      // Handle potential API response format differences
      const data = response.data.$values || response.data;
      setAllJoinRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch join events:", error);
      toast.error("Không thể tải danh sách sự kiện. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parent?.parentID) {
      fetchJoinEvents(parent.parentID);
    } else {
      setLoading(false); // If there's no parent ID, stop loading
    }
  }, [parent?.parentID]);

  // --- Event Handlers ---
  const handleOpenModal = (item, isAttending) => {
    setModalData({ item, isAttending });
    setIsModalVisible(true);
    setNote(""); // Reset note on modal open
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setModalData({ item: null, isAttending: true });
  };

  const handleSubmitResponse = async () => {
    const { item, isAttending } = modalData;
    if (!item) return;

    setIsSubmitting(true);
    try {
      // The original PUT URL: `/api/StudentJoinEvent/respond-by-student`
      // Note: If your axios instance has a baseURL, the leading `/api` might be redundant.
      // Adjust if necessary.
      await api.put("/StudentJoinEvent/respond-by-student", {
        studentId: item.studentID,
        eventId: item.eventID,
        status: isAttending ? STATUS.ACCEPTED : STATUS.REJECTED,
        note,
      });
      toast.success("Gửi phản hồi thành công!");
      handleCloseModal();
      // Re-fetch data to update lists
      fetchJoinEvents(parent.parentID);
    } catch (error) {
      console.error("Failed to submit response:", error);
      toast.error("Gửi phản hồi thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  return (
    <div
      style={{
        marginTop: 60,
        padding: "24px",
        background: "#f0f2f5",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Title level={2} style={{ marginBottom: 24, textAlign: "center" }}>
        Xác nhận tham gia sự kiện
      </Title>

      <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
        {/* Section for Pending Confirmations */}
        <Divider orientation="left" orientationMargin="0">
          <Title level={4}>Cần xác nhận</Title>
        </Divider>
        {pendingList.length === 0 && !loading ? (
          <Empty description="Không có yêu cầu nào cần xác nhận." />
        ) : (
          <Row gutter={[16, 24]}>
            {pendingList.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.studentJoinEventID}>
                <Card
                  bordered
                  hoverable
                  actions={[
                    <Button
                      type="text"
                      icon={<CheckCircleOutlined />}
                      key="attend"
                      onClick={() => handleOpenModal(item, true)}
                      style={{ color: "#52c41a" }}
                    >
                      Tham gia
                    </Button>,
                    <Button
                      type="text"
                      danger
                      icon={<CloseCircleOutlined />}
                      key="reject"
                      onClick={() => handleOpenModal(item, false)}
                    >
                      Từ chối
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={<Text strong>{item.eventName}</Text>}
                    description={
                      <Flex vertical>
                        <Text>
                          Học sinh: <Text strong>{item.studentName}</Text>
                        </Text>
                        <Text>
                          Trạng thái: <StatusTag status={item.status} />
                        </Text>
                      </Flex>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Section for Confirmation History */}
        <Divider
          orientation="left"
          orientationMargin="0"
          style={{ marginTop: 40 }}
        >
          <Title level={4}>Lịch sử xác nhận</Title>
        </Divider>
        <Row gutter={[16, 24]}>
          {historyList.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.studentJoinEventID}>
              <Card bordered>
                <Flex vertical gap="small">
                  <Text strong>{item.eventName}</Text>
                  <Text>
                    Học sinh: <Text strong>{item.studentName}</Text>
                  </Text>
                  <Text>
                    Trạng thái: <StatusTag status={item.status} />
                  </Text>
                  {item.note && (
                    <Paragraph
                      ellipsis={{
                        rows: 2,
                        expandable: true,
                        symbol: "xem thêm",
                      }}
                    >
                      <Text type="secondary">Ghi chú: {item.note}</Text>
                    </Paragraph>
                  )}
                  {item.responseDate && (
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Phản hồi lúc:{" "}
                      {new Date(item.responseDate).toLocaleString("vi-VN")}
                    </Text>
                  )}
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {/* Confirmation Modal */}
      <Modal
        open={isModalVisible}
        title={modalData.isAttending ? "Xác nhận tham gia" : "Từ chối tham gia"}
        onCancel={handleCloseModal}
        onOk={handleSubmitResponse}
        okText={modalData.isAttending ? "Đồng ý tham gia" : "Gửi từ chối"}
        cancelText="Huỷ"
        confirmLoading={isSubmitting}
        destroyOnClose // Reset state inside modal when closed
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>
            Học sinh: <Text strong>{modalData.item?.studentName}</Text>
          </Text>
          <Text>
            Sự kiện: <Text strong>{modalData.item?.eventName}</Text>
          </Text>
          <Input.TextArea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              modalData.isAttending
                ? "Ghi chú cho nhà trường (tuỳ chọn)"
                : "Lý do từ chối (tuỳ chọn)"
            }
          />
        </Space>
      </Modal>
    </div>
  );
};

export default ConfirmEvent;
