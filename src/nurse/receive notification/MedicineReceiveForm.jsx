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
} from "antd";

// Component xác nhận đã nhận thuốc
const MedicineReceiveForm = ({ medicineRequest, onConfirm, onReject }) => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // medicineRequest: object chứa thông tin đơn thuốc
  // onConfirm: callback khi xác nhận đã nhận thuốc
  // onReject: callback khi từ chối nhận thuốc

  const handleConfirm = () => {
    message.success("Đã xác nhận đã nhận thuốc!");
    if (onConfirm) onConfirm();
  };

  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const handleRejectOk = async () => {
    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối.");
      return;
    }
    setRejectLoading(true);
    // Gọi API gửi lý do từ chối cho phụ huynh ở đây nếu cần
    if (onReject) await onReject(rejectReason);
    setRejectLoading(false);
    setRejectModalVisible(false);
    setRejectReason("");
    message.info("Đã gửi lý do từ chối cho phụ huynh.");
  };

  const handleRejectCancel = () => {
    setRejectModalVisible(false);
    setRejectReason("");
  };

  if (!medicineRequest) return <div>Không có dữ liệu đơn thuốc.</div>;

  return (
    <Card style={{ maxWidth: 700, margin: "0 auto", marginTop: 32 }}>
      {/* PHẦN TRÊN: THÔNG BÁO */}
      <div
        style={{
          marginBottom: 24,
          fontWeight: 600,
          color: "#1677ff",
          fontSize: 18,
        }}
      >
        Xác nhận đã nhận thuốc từ phụ huynh
      </div>

      {/* PHẦN DƯỚI: NỘI DUNG ĐƠN THUỐC */}
      <Descriptions
        title="Thông tin học sinh"
        bordered
        column={1}
        style={{ marginBottom: 24 }}
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

      <List
        header={<b>Danh sách thuốc</b>}
        bordered
        dataSource={medicineRequest.medicineDetails}
        renderItem={(item, idx) => (
          <List.Item>
            <div>
              <b>Thuốc {idx + 1}:</b> {item.medicineName || "Không rõ"}
              <br />
              <span>Liều lượng: {item.dosage}</span>
              <br />
              <span>Thời điểm uống: {item.time}</span>
              <br />
              <span>Ghi chú: {item.note}</span>
            </div>
          </List.Item>
        )}
        style={{ marginBottom: 24 }}
      />

      <div style={{ textAlign: "center" }}>
        <Space>
          <Button type="primary" size="large" onClick={handleConfirm}>
            Xác nhận đã nhận thuốc
          </Button>
          <Button danger size="large" onClick={handleReject}>
            Từ chối
          </Button>
        </Space>
      </div>

      <Modal
        title="Nhập lý do từ chối"
        open={rejectModalVisible}
        onOk={handleRejectOk}
        onCancel={handleRejectCancel}
        confirmLoading={rejectLoading}
        okText="Gửi lý do từ chối"
        cancelText="Hủy"
      >
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối để gửi cho phụ huynh"
        />
      </Modal>
    </Card>
  );
};

export default MedicineReceiveForm;
