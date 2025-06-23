import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  message,
  Popconfirm,
  Modal,
  Descriptions,
  Input,
} from "antd";
import api from "../config/axios";
import { useSelector } from "react-redux";

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
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  console.log("user", user);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/MedicineRequest/getAll");

      // Xử lý response với cấu trúc mới có $values
      let medicineRequestsData = res.data.$values || [];

      // Đảm bảo dữ liệu là array và có cấu trúc đúng
      if (!Array.isArray(medicineRequestsData)) {
        console.warn("API response không phải array:", medicineRequestsData);
        medicineRequestsData = [];
      }

      // Đảm bảo mỗi record có medicineDetails là array từ $values
      const processedData = medicineRequestsData.map((record) => ({
        ...record,
        medicineDetails:
          record.medicineDetails && record.medicineDetails.$values
            ? record.medicineDetails.$values
            : [],
      }));

      console.log("Medicine requests data:", processedData);
      setData(processedData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Lỗi khi tải dữ liệu!");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (requestID) => {
    try {
      setApproving(true);
      await api.put(
        `/MedicineRequest/${requestID}/approve?approvedBy=${user.userID}`
      );
      message.success("Đã duyệt đơn thuốc thành công!");
      fetchData();
      setDetailModal({ open: false, record: null });
    } catch (error) {
      console.error("Lỗi khi duyệt đơn thuốc:", error);
      message.error("Duyệt thất bại!");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      message.warning("Vui lòng nhập lý do không duyệt!");
      return;
    }
    try {
      setRejecting(true);
      await api.put(`/MedicineRequest/${rejectModal.requestID}/reject`, {
        reason: rejectModal.reason,
      });
      message.success("Đã gửi lý do không duyệt đơn thuốc cho phụ huynh!");
      setRejectModal({ open: false, reason: "", requestID: null });
      setDetailModal({ open: false, record: null });
      fetchData();
    } catch (error) {
      console.error("Lỗi khi từ chối đơn thuốc:", error);
      message.error("Không thể gửi lý do không duyệt!");
    } finally {
      setRejecting(false);
    }
  };

  console.log("Detail modal:", detailModal);

  const columns = [
    {
      title: "ID đơn",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Ngày tạo",
      dataIndex: "date",
      key: "date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "Không có",
    },
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (name) => name || "Không có",
    },
    {
      title: "Phụ huynh",
      dataIndex: "parentName",
      key: "parentName",
      render: (name) => name || "Không có",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => note || "Không có",
    },
    {
      title: "Trạng thái",
      dataIndex: "requestStatus",
      key: "requestStatus",
      render: (status) => (
        <Tag
          color={
            status === "Đã duyệt"
              ? "green"
              : status === "Không duyệt"
              ? "red"
              : "orange"
          }
        >
          {statusVN(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            style={{ marginRight: 8 }}
            onClick={() => setDetailModal({ open: true, record })}
          >
            Xem chi tiết
          </Button>
        </>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    // Đảm bảo medicineDetails là array
    const medicineDetails = Array.isArray(record.medicineDetails)
      ? record.medicineDetails
      : [];

    return (
      <Table
        columns={[
          {
            title: "Tên thuốc",
            dataIndex: "requestItemName",
            key: "requestItemName",
            render: (name) => name || "Không có",
          },
          {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (qty) => qty || "Không có",
          },
          {
            title: "Liều dùng",
            dataIndex: "dosageInstructions",
            key: "dosageInstructions",
            render: (dosage) => dosage || "Không có",
          },
          {
            title: "Thời điểm",
            dataIndex: "time",
            key: "time",
            render: timeVN,
          },
        ]}
        dataSource={medicineDetails}
        pagination={false}
        rowKey="requestDetailID"
        locale={{
          emptyText: "Không có chi tiết thuốc",
        }}
      />
    );
  };

  const timeVN = (val) => {
    if (!val) return "Không có";
    return val
      .split(",")
      .map((t) =>
        t.trim() === "morning"
          ? "Sáng"
          : t.trim() === "noon"
          ? "Trưa"
          : t.trim() === "evening"
          ? "Tối"
          : t
      )
      .join(", ");
  };

  const statusVN = (status) => {
    if (status === "Đã duyệt") return "Đã duyệt";
    if (status === "Không duyệt") return "Không duyệt";
    if (status === "Chờ duyệt") return "Chờ duyệt";
    if (status === "Pending") return "Chờ duyệt";
    return status || "Không rõ";
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>Danh sách đơn xin cấp thuốc</h2>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="requestID"
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 8 }}
        locale={{
          emptyText: "Không có đơn thuốc nào",
        }}
      />

      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={null}
        title="Chi tiết đơn thuốc"
        width={700}
      >
        {detailModal.record && (
          <>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="ID đơn">
                {detailModal.record.requestID || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {detailModal.record.date
                  ? new Date(detailModal.record.date).toLocaleDateString(
                      "vi-VN"
                    )
                  : "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Học sinh">
                {detailModal.record.studentName || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Phụ huynh">
                {detailModal.record.parentName || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {detailModal.record.note || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    detailModal.record.requestStatus === "Đã duyệt"
                      ? "green"
                      : detailModal.record.requestStatus === "Không duyệt"
                      ? "red"
                      : "orange"
                  }
                >
                  {statusVN(detailModal.record.requestStatus)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4>Chi tiết thuốc:</h4>
              <Table
                columns={[
                  {
                    title: "Tên thuốc",
                    dataIndex: "requestItemName",
                    key: "requestItemName",
                    render: (name) => name || "Không có",
                  },
                  {
                    title: "Số lượng",
                    dataIndex: "quantity",
                    key: "quantity",
                    render: (qty) => qty || "Không có",
                  },
                  {
                    title: "Liều dùng",
                    dataIndex: "dosageInstructions",
                    key: "dosageInstructions",
                    render: (dosage) => dosage || "Không có",
                  },
                  {
                    title: "Thời điểm",
                    dataIndex: "time",
                    key: "time",
                    render: timeVN,
                  },
                ]}
                dataSource={
                  Array.isArray(detailModal.record.medicineDetails)
                    ? detailModal.record.medicineDetails
                    : []
                }
                pagination={false}
                rowKey="requestDetailID"
                size="small"
                locale={{
                  emptyText: "Không có chi tiết thuốc",
                }}
              />
            </div>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Button
                type="primary"
                loading={approving}
                onClick={() => handleApprove(detailModal.record.requestID)}
                disabled={
                  detailModal.record.requestStatus !== "Chờ duyệt" &&
                  detailModal.record.requestStatus !== "Pending"
                }
              >
                {approving ? "Đang duyệt..." : "Duyệt đơn thuốc"}
              </Button>
              <Button
                danger
                loading={rejecting}
                onClick={() =>
                  setRejectModal({
                    open: true,
                    reason: "",
                    requestID: detailModal.record.requestID,
                  })
                }
                disabled={
                  detailModal.record.requestStatus !== "Chờ duyệt" &&
                  detailModal.record.requestStatus !== "Pending"
                }
              >
                {rejecting ? "Đang từ chối..." : "Không duyệt đơn thuốc"}
              </Button>
            </div>
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
        confirmLoading={rejecting}
      >
        <Input.TextArea
          rows={3}
          placeholder="Nhập lý do không duyệt đơn thuốc..."
          value={rejectModal.reason}
          onChange={(e) =>
            setRejectModal((r) => ({ ...r, reason: e.target.value }))
          }
        />
      </Modal>
    </div>
  );
};

export default ApproveMedicine;
