import React, { useState } from "react";
import {
  Card,
  List,
  Button,
  Descriptions,
  message,
  Modal,
  Input,
  Space,
  Typography,
  Alert,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const MedicineReceiveForm = ({ medicineRequest, onConfirm, onReject }) => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  if (!medicineRequest) {
    return (
      <Card>
        <Alert
          message="Không có dữ liệu"
          description="Không tìm thấy thông tin đơn thuốc để xác nhận."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  const handleConfirm = () => {
    // In a real app, you would call an API here.
    message.success("Đã xác nhận nhận thuốc từ phụ huynh!");
    if (onConfirm) onConfirm(medicineRequest.requestID);
  };

  const handleShowRejectModal = () => {
    setRejectModalVisible(true);
  };

  const handleRejectOk = async () => {
    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối.");
      return;
    }
    setRejectLoading(true);
    // In a real app, you would call an API here.
    try {
      if (onReject) await onReject(medicineRequest.requestID, rejectReason);
      message.info("Đã gửi lý do từ chối cho phụ huynh.");
      setRejectModalVisible(false);
      setRejectReason("");
    } catch (error) {
      message.error("Gửi lý do thất bại!");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleRejectCancel = () => {
    setRejectModalVisible(false);
    setRejectReason("");
  };

  return (
    <Card
      bordered={false}
      style={{
        maxWidth: 700,
        margin: "24px auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Alert
        message="Yêu cầu xác nhận"
        description="Vui lòng kiểm tra và xác nhận đã nhận đủ thuốc từ phụ huynh."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Descriptions
        title={
          <>
            <UserOutlined /> Thông tin học sinh
          </>
        }
        bordered
        column={1}
      >
        <Descriptions.Item label="Họ tên">
          {medicineRequest.studentName}
        </Descriptions.Item>
        <Descriptions.Item label="Lớp">
          {medicineRequest.className}
        </Descriptions.Item>
        <Descriptions.Item label="Phụ huynh">
          {medicineRequest.parentName}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {medicineRequest.phone}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <List
        header={
          <Title level={5}>
            <MedicineBoxOutlined /> Danh sách thuốc
          </Title>
        }
        dataSource={medicineRequest.medicineDetails}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar>{index + 1}</Avatar>}
              title={<Text strong>{item.medicineName || "Không rõ tên"}</Text>}
              description={
                <>
                  <Paragraph style={{ margin: 0 }}>
                    Liều lượng: <Text type="secondary">{item.dosage}</Text>
                  </Paragraph>
                  <Paragraph style={{ margin: 0 }}>
                    Thời điểm: <Text type="secondary">{item.time}</Text>
                  </Paragraph>
                  <Paragraph style={{ margin: 0 }}>
                    Ghi chú:{" "}
                    <Text type="secondary">{item.note || "Không có"}</Text>
                  </Paragraph>
                </>
              }
            />
          </List.Item>
        )}
        style={{
          marginTop: 24,
          background: "#fafafa",
          padding: "8px 16px",
          borderRadius: 8,
        }}
      />

      <div style={{ textAlign: "right", marginTop: 32 }}>
        <Space size="large">
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleShowRejectModal}
          >
            Từ chối
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleConfirm}
          >
            Xác nhận đã nhận
          </Button>
        </Space>
      </div>

      <Modal
        title="Nhập lý do từ chối"
        open={rejectModalVisible}
        onOk={handleRejectOk}
        onCancel={handleRejectCancel}
        confirmLoading={rejectLoading}
        okText="Gửi lý do"
        cancelText="Hủy"
      >
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối để hệ thống gửi thông báo cho phụ huynh."
        />
      </Modal>
    </Card>
  );
};

export default MedicineReceiveForm;
