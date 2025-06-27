import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  message,
  Modal,
  Descriptions,
  Input,
  Card,
  Space,
  Typography,
} from "antd";
import api from "../config/axios";
import { useSelector } from "react-redux";

const { Title } = Typography;
const { TextArea } = Input;

const ApproveMedicine = () => {
  const user = useSelector((state) => state.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, record: null });
  const [rejectModal, setRejectModal] = useState({
    open: false,
    reason: "",
    requestID: null,
  });
  const [actionLoading, setActionLoading] = useState({
    approving: false,
    rejecting: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/MedicineRequest/getAll");
      let requests = res.data.$values || [];
      const processedData = requests.map((record) => ({
        ...record,
        medicineDetails: record.medicineDetails?.$values || [],
      }));
      setData(processedData);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu đơn thuốc!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (requestID) => {
    setActionLoading((prev) => ({ ...prev, approving: true }));
    try {
      await api.put(
        `/MedicineRequest/${requestID}/approve?approvedBy=${user.userID}`
      );
      message.success("Đã duyệt đơn thuốc thành công!");
      fetchData();
      setDetailModal({ open: false, record: null });
    } catch (error) {
      message.error("Duyệt đơn thuốc thất bại!");
    } finally {
      setActionLoading((prev) => ({ ...prev, approving: false }));
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối!");
      return;
    }
    setActionLoading((prev) => ({ ...prev, rejecting: true }));
    try {
      await api.put(`/MedicineRequest/${rejectModal.requestID}/reject`, {
        reason: rejectModal.reason,
      });
      message.success("Đã từ chối đơn thuốc!");
      setRejectModal({ open: false, reason: "", requestID: null });
      setDetailModal({ open: false, record: null });
      fetchData();
    } catch (error) {
      message.error("Thao tác thất bại!");
    } finally {
      setActionLoading((prev) => ({ ...prev, rejecting: false }));
    }
  };

  const timeVN = (val) => {
    if (!val) return "Không có";
    return val
      .split(",")
      .map(
        (t) =>
          ({ morning: "Sáng", noon: "Trưa", evening: "Tối" }[t.trim()] || t)
      )
      .join(", ");
  };

  const statusVN = (status) => {
    const statusMap = {
      Pending: { text: "Chờ duyệt", color: "orange" },
      "Chờ duyệt": { text: "Chờ duyệt", color: "orange" },
      Approved: { text: "Đã duyệt", color: "green" },
      "Đã duyệt": { text: "Đã duyệt", color: "green" },
      Rejected: { text: "Không duyệt", color: "red" },
      "Không duyệt": { text: "Không duyệt", color: "red" },
    };
    const { text, color } = statusMap[status] || {
      text: status,
      color: "default",
    };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    { title: "ID", dataIndex: "requestID", key: "requestID" },
    {
      title: "Ngày tạo",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    { title: "Học sinh", dataIndex: "studentName", key: "studentName" },
    { title: "Phụ huynh", dataIndex: "parentName", key: "parentName" },
    {
      title: "Trạng thái",
      dataIndex: "requestStatus",
      key: "requestStatus",
      render: statusVN,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button onClick={() => setDetailModal({ open: true, record })}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const detailTableColumns = [
    {
      title: "Tên thuốc",
      dataIndex: "requestItemName",
      key: "requestItemName",
    },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Liều dùng",
      dataIndex: "dosageInstructions",
      key: "dosageInstructions",
    },
    { title: "Thời điểm", dataIndex: "time", key: "time", render: timeVN },
  ];

  return (
    <Card>
      <Title level={3}>Duyệt đơn thuốc từ phụ huynh</Title>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="requestID"
        pagination={{ pageSize: 8 }}
      />

      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={null}
        title="Chi tiết đơn xin cấp thuốc"
        width={700}
      >
        {detailModal.record && (
          <>
            <Descriptions
              bordered
              column={1}
              size="middle"
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Học sinh">
                {detailModal.record.studentName}
              </Descriptions.Item>
              <Descriptions.Item label="Phụ huynh">
                {detailModal.record.parentName}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {detailModal.record.note || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {statusVN(detailModal.record.requestStatus)}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Chi tiết thuốc:</Title>
            <Table
              columns={detailTableColumns}
              dataSource={detailModal.record.medicineDetails}
              pagination={false}
              rowKey="requestDetailID"
              size="small"
            />

            {(detailModal.record.requestStatus === "Pending" ||
              detailModal.record.requestStatus === "Chờ duyệt") && (
              <Space
                style={{
                  marginTop: 24,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  danger
                  loading={actionLoading.rejecting}
                  onClick={() =>
                    setRejectModal({
                      open: true,
                      reason: "",
                      requestID: detailModal.record.requestID,
                    })
                  }
                >
                  Không duyệt
                </Button>
                <Button
                  type="primary"
                  loading={actionLoading.approving}
                  onClick={() => handleApprove(detailModal.record.requestID)}
                >
                  Duyệt đơn thuốc
                </Button>
              </Space>
            )}
          </>
        )}
      </Modal>

      <Modal
        open={rejectModal.open}
        onCancel={() =>
          setRejectModal({ open: false, reason: "", requestID: null })
        }
        onOk={handleReject}
        title="Lý do không duyệt đơn thuốc"
        okText="Gửi lý do"
        cancelText="Hủy"
        confirmLoading={actionLoading.rejecting}
      >
        <TextArea
          rows={3}
          placeholder="Nhập lý do để gửi cho phụ huynh..."
          value={rejectModal.reason}
          onChange={(e) =>
            setRejectModal((r) => ({ ...r, reason: e.target.value }))
          }
        />
      </Modal>
    </Card>
  );
};

export default ApproveMedicine;
