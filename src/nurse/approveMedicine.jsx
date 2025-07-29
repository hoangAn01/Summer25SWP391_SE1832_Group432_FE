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
import { Modal as AntdModal } from "antd";
import "./approveMedicine.css";

const ApproveMedicine = () => {
  const user = useSelector((state) => state.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, record: null });
  const [approving, setApproving] = useState(false);
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
      // Lấy record hiện tại để kiểm tra ngày
      const record = data.find((r) => r.requestID === requestID);
      if (record && record.scheduledDate) {
        const today = new Date();
        const scheduled = new Date(record.scheduledDate);
        // So sánh ngày/tháng/năm
        if (
          today.getFullYear() !== scheduled.getFullYear() ||
          today.getMonth() !== scheduled.getMonth() ||
          today.getDate() !== scheduled.getDate()
        ) {
          AntdModal.info({
            title: "Chưa tới ngày cho học sinh uống thuốc",
            content: `Chỉ được cho sử dụng thuốc/vật tư vào đúng ngày ${formatDateWithDay(record.scheduledDate)} mà phụ huynh đã chọn!`,
            centered: true,
          });
          return;
        }
      }
      setApproving(true);
      // Lấy nurseID từ API Nurse
      const nurseRes = await api.get("Nurse");
      const nurseInfo = nurseRes.data.$values.find(
        (n) => n.accountID === user.userID
      );
      const nurseID = nurseInfo?.nurseID;
      if (!nurseID) {
        message.error("Không tìm thấy thông tin y tá!");
        setApproving(false);
        return;
      }
      await api.put(`/MedicineRequest/${requestID}/approve`, {
        approvedBy: nurseID,
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
        return new Date(d).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Ho_Chi_Minh",
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
      title: "Thời gian cho uống thuốc",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => formatDateWithDay(date),
      sorter: (a, b) => {
        // Ưu tiên hôm nay/đã qua lên trên, tương lai xuống dưới
        const today = new Date();
        today.setHours(0,0,0,0);
        const getSortValue = (d) => {
          if (!d) return 2; // không có ngày, cho xuống dưới cùng
          const scheduled = new Date(d);
          scheduled.setHours(0,0,0,0);
          if (scheduled <= today) return 0; // hôm nay hoặc đã qua
          return 1; // tương lai
        };
        const valA = getSortValue(a.scheduledDate);
        const valB = getSortValue(b.scheduledDate);
        if (valA !== valB) return valA - valB;
        // Nếu cùng nhóm, sort theo ngày giảm dần
        return new Date(b.scheduledDate) - new Date(a.scheduledDate);
      },
      defaultSortOrder: 'ascend',
      filters: [
        { text: "Hôm nay", value: "today" },
        { text: "Ngày tới", value: "future" },
        { text: "Trước đó", value: "past" },
      ],
      onFilter: (value, record) => {
        if (!record.scheduledDate) return false;
        const today = new Date();
        today.setHours(0,0,0,0);
        const scheduled = new Date(record.scheduledDate);
        scheduled.setHours(0,0,0,0);
        if (value === "today") {
          return scheduled.getTime() === today.getTime();
        }
        if (value === "future") {
          return scheduled.getTime() > today.getTime();
        }
        if (value === "past") {
          return scheduled.getTime() < today.getTime();
        }
        return false;
      },
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
      sorter: (a, b) => {
        // Ưu tiên: Đã nhận đơn thuốc > Hoàn thành > Không duyệt
        const order = status => {
          const s = statusVN(status);
          if (s === "Đã nhận đơn thuốc") return 1;
          if (s === "Hoàn thành") return 2;
          if (s === "Không duyệt") return 3;
          return 4;
        };
        return order(a.requestStatus) - order(b.requestStatus);
      },
      filters: [
        { text: "Đã nhận đơn thuốc", value: "Đã nhận đơn thuốc" },
        { text: "Hoàn thành", value: "Hoàn thành" },
      ],
      onFilter: (value, record) => {
        const vnStatus = statusVN(record.requestStatus);
        return vnStatus === value;
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
      .map((t) =>
        t.trim() === "morning"
          ? "Sáng"
          : t.trim() === "noon"
          ? "Trưa"
          : t.trim() === "evening"
          ? "Tối"
          : t.trim()
      )
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

  // Thêm hàm formatDateWithDay
  function formatDateWithDay(dateStr) {
    if (!dateStr) return "Không có";
    const date = new Date(dateStr);
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    const dayName = days[date.getDay()];
    const dateVN = date.toLocaleDateString("vi-VN");
    return `${dayName}, ${dateVN}`;
  }

  return (
    <div className="approve-medicine-wrapper">
      <h2 className="approve-medicine-title">Danh sách đơn gửi thuốc của phụ huynh</h2>
      <div className="date-legend">
        <div className="legend-item today">
          <span className="legend-icon">📌</span>
          <span>Hôm nay</span>
        </div>
        <div className="legend-item future">
          <span className="legend-icon">📅</span>
          <span>Ngày tới</span>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="requestID"
        pagination={{ pageSize: 8 }}
        locale={{
          emptyText: "Không có đơn thuốc nào",
        }}
        rowClassName={(record) => {
          if (!record.scheduledDate) return '';
          const today = new Date();
          today.setHours(0,0,0,0);
          const scheduled = new Date(record.scheduledDate);
          scheduled.setHours(0,0,0,0);
          
          if (
            today.getFullYear() === scheduled.getFullYear() &&
            today.getMonth() === scheduled.getMonth() &&
            today.getDate() === scheduled.getDate()
          ) {
            return 'row-today';
          }
          
          if (scheduled > today) {
            return 'row-future';
          }
          
          return '';
        }}
        // Mặc định chỉ hiển thị các đơn có trạng thái đã nhận đơn thuốc hoặc hoàn thành
        defaultFilteredValue={{ requestStatus: ["Đã nhận đơn thuốc", "Hoàn thành"] }}
        className="approve-medicine-table"
      />

      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={null}
        title="Đơn thuốc gửi phụ huynh"
        width={700}
        className="approve-medicine-modal"
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
              <Descriptions.Item label="Ghi chú của phụ huynh">
                {detailModal.record.note || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian cho uống thuốc">
                {formatDateWithDay(detailModal.record.scheduledDate)}
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
                    render: timeToVN,
                  },
                  {
                    title: "Ảnh thuốc",
                    dataIndex: "medicineRequestImg",
                    key: "medicineRequestImg",
                    render: (img) => {
                      return img ? (
                        <div style={{ position: "relative" }}>
                          <img 
                            src={img} 
                            alt="Ảnh thuốc" 
                            style={{ 
                              maxWidth: 80, 
                              maxHeight: 80,
                              cursor: "pointer", 
                              borderRadius: "4px",
                              border: "1px solid #eee"
                            }}
                            onClick={() => {
                              Modal.info({
                                title: "Ảnh thuốc",
                                content: (
                                  <img 
                                    src={img} 
                                    alt="Ảnh thuốc" 
                                    style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }}
                                  />
                                ),
                                width: 520,
                              });
                            }}
                          />
                        </div>
                      ) : (
                        <span style={{ color: "#999" }}>Không có ảnh</span>
                      );
                    }
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
              {statusVN(detailModal.record.requestStatus) ===
                "Đã nhận đơn thuốc" && (
                <Button
                  type="primary"
                  loading={approving}
                  onClick={() => handleApprove(detailModal.record.requestID)}
                >
                  {approving ? "Đang gửi..." : "Xác nhận "}
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
