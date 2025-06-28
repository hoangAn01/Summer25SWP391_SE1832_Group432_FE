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
import { toast } from "react-toastify";

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
  const [noteNurse, setNoteNurse] = useState("");

  console.log("user", user);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/MedicineRequest/getAll");

      let medicineRequestsData = res.data.$values || [];

      if (!Array.isArray(medicineRequestsData)) {
        console.warn("API response không phải array:", medicineRequestsData);
        medicineRequestsData = [];
      }

      const processedData = medicineRequestsData.map((record) => {
        const d = record.approvalDate || record.date;
        return {
          ...record,
          medicineDetails:
            record.medicineDetails && record.medicineDetails.$values
              ? record.medicineDetails.$values
              : [],
          approvalDateSort: d ? new Date(d).getTime() : 0, // timestamp để sort
        };
      });

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
      console.log(user.userID);
      console.log(noteNurse);
      await api.put(`/MedicineRequest/${requestID}/approve`, {
        approvedBy: user.userID,
        nurseNote: noteNurse,
      });
      toast.success("Đã gửi phụ huynh!");
      setNoteNurse("");
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
    // {
    //   title: "ID đơn",
    //   key: "index",
    //   render: (text, record, index) => index + 1,
    //   sorter: (a, b) => b.requestID - a.requestID,
    //   defaultSortOrder: "descend",
    // },
    {
      title: "Thời gian nhận đơn  ",
      dataIndex: "approvalDateSort",
      key: "approvalDate",
      render: (_, record) => {
        const d = record.approvalDate || record.date;
        if (!d) return "Không có";
        const utc = new Date(d);
        const vietnamTime = new Date(utc.getTime() + 7 * 60 * 60 * 1000);
        return vietnamTime.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
      },
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
      render: (status) => {
        const vnStatus = statusVN(status);
        let tagProps = {};
        if (vnStatus === "Hoàn thành") {
          tagProps = {
            style: {
              fontWeight: 600,
              fontSize: 14,
              padding: "2px 12px",
              borderRadius: 16,
              background: "#e6fffb",
              color: "#389e0d",
              border: "1px solid #b7eb8f",
              letterSpacing: 1,
            },
          };
        } else if (vnStatus === "Đã nhận đơn thuốc") {
          tagProps = {
            style: {
              fontWeight: 600,
              fontSize: 14,
              padding: "2px 12px",
              borderRadius: 16,
              background: "#e6f4ff",
              color: "#1677ff",
              border: "1px solid #91caff",
              letterSpacing: 1,
            },
          };
        } else if (vnStatus === "Không duyệt") {
          tagProps = {
            style: {
              fontWeight: 600,
              fontSize: 14,
              padding: "2px 12px",
              borderRadius: 16,
              background: "#fff1f0",
              color: "#cf1322",
              border: "1px solid #ffa39e",
              letterSpacing: 1,
            },
          };
        }
        return <Tag {...tagProps}>{vnStatus}</Tag>;
      },
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

  const timeToVN = (val) => {
    if (!val) return "";
    return val
      .split(",")
      .map(t => t.trim() === "morning" ? "Sáng" : t.trim() === "noon" ? "Trưa" : t.trim() === "evening" ? "Tối" : t.trim())
      .join(", ");
  };

  const statusVN = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "đã duyệt" || s === "approve" || s === "approved")
      return "Hoàn thành";
    if (s === "không duyệt") return "Không duyệt";
    if (s === "chờ duyệt" || s === "pending") return "Đã nhận đơn thuốc";
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
        pagination={{ pageSize: 8 }}
        locale={{
          emptyText: "Không có đơn thuốc nào",
        }}
      />

      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={null}
        title="Duyệt đơn thuốc gửi phụ huynh"
        width={700}
      >
        {detailModal.record && (
          <>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="ID đơn">
                {detailModal.record.requestID || "Không có"}
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
              {console.log(
                "Chi tiết thuốc:",
                detailModal.record.medicineDetails
              )}
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
                    title: "Liều dùng/Cách sử dụng",
                    dataIndex: "dosageInstructions",
                    key: "dosageInstructions",
                    render: (dosage) => dosage || "Không có",
                  },
                  {
                    title: "Thời điểm",
                    dataIndex: "time",
                    key: "time",
                    render: timeToVN
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
              {/* Nếu đang chờ duyệt thì cho nhập ghi chú, nếu đã duyệt thì chỉ hiển thị ghi chú */}
              {detailModal.record.requestStatus === "Chờ duyệt" ||
              detailModal.record.requestStatus === "Pending" ? (
                <div style={{ marginTop: 16 }}>
                  <b>Ghi chú của nhân viên y tế:</b>
                  <Input.TextArea
                    value={noteNurse}
                    onChange={(e) => setNoteNurse(e.target.value)}
                    placeholder="Nhập ghi chú cho phụ huynh (nếu có)"
                    rows={2}
                    style={{ marginTop: 8 }}
                  />
                </div>
              ) : (
                detailModal.record.nurseNote && (
                  <div style={{ marginTop: 16 }}>
                    <b>Ghi chú của nhân viên y tế:</b>{" "}
                    {detailModal.record.nurseNote}
                  </div>
                )
              )}
            </div>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              {statusVN(detailModal.record.requestStatus) === "Đã nhận đơn thuốc" && (
                <Button
                  type="primary"
                  loading={approving}
                  onClick={() => handleApprove(detailModal.record.requestID)}
                >
                  {approving ? "Đang gửi..." : "Gửi phụ huynh"}
                </Button>
                
              )}
            </div>
          </>
        )}
      </Modal>

      
    </div>
  );
};

export default ApproveMedicine;
