import React, { useEffect, useState } from "react";
import { Table, Button, Tag, message, Popconfirm, Modal, Descriptions } from "antd";
import api from "../config/axios";
import { useSelector } from "react-redux";

const ApproveMedicine = () => {
  const user = useSelector((state) => state.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, record: null });
  console.log("user", user)
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/MedicineRequest/getAll");
      console.log("tesstttttt",res);
      setData(res.data);
    } catch {
      message.error("Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (requestID) => {
    try {
      await api.put(`/MedicineRequest/${requestID}/approve?approvedBy=${user.userID}`); // Giả sử API này tồn tại
      message.success("Đã duyệt đơn thuốc thành công!");
      fetchData();
    } catch {
      message.error("Duyệt thất bại!");
    }
  };

  console.log(detailModal)

  const columns = [
    {
      title: "ID đơn",
      dataIndex: "requestID",
      key: "requestID",
    },
    {
      title: "Ngày tạo",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Phụ huynh",
      dataIndex: "parentName",
      key: "parentName",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Trạng thái",
      dataIndex: "requestStatus",
      key: "requestStatus",
      render: (status) => (
        <Tag color={status === "Đã duyệt" ? "green" : "orange"}>{(status === "Approved" ? ("Đã duyệt") : ("Đang chờ"))}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <>
          <Button style={{ marginRight: 8 }} onClick={() => setDetailModal({ open: true, record })}>
            Xem chi tiết
          </Button>
          {record.requestStatus === "Chờ duyệt" || record.requestStatus === "Pending" ? (
            <Popconfirm
              title="Bạn chắc chắn muốn duyệt đơn này?"
              onConfirm={() => handleApprove(record.requestID)}
              okText="Duyệt"
              cancelText="Hủy"
            >
              <Button type="primary">Duyệt</Button>
            </Popconfirm>
          ) : (
            <span>Đã duyệt</span>
          )}
        </>
      ),
    },
  ];

  const expandedRowRender = (record) => (
    <Table
      columns={[
        { title: "Tên thuốc", dataIndex: "itemName", key: "itemName" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
        { title: "Liều dùng", dataIndex: "dosageInstructions", key: "dosageInstructions" },
        { title: "Thời điểm", dataIndex: "time", key: "time" },
      ]}
      dataSource={record.medicineDetails}
      pagination={false}
      rowKey="requestDetailID"
    />
  );

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Danh sách đơn xin cấp thuốc</h2>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="requestID"
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 8 }}
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
              <Descriptions.Item label="ID đơn">{detailModal.record.requestID}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{new Date(detailModal.record.date).toLocaleDateString("vi-VN")}</Descriptions.Item>
              <Descriptions.Item label="Học sinh">{detailModal.record.studentName}</Descriptions.Item>
              <Descriptions.Item label="Phụ huynh">{detailModal.record.parentName}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{detailModal.record.note}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={detailModal.record.requestStatus === "Đã duyệt" ? "green" : "orange"}>{detailModal.record.requestStatus}</Tag>
              </Descriptions.Item>

            </Descriptions>
            <div style={{ marginTop: 24 }}>
              <Table
                columns={[
                  { title: "Tên thuốc", dataIndex: "itemName", key: "itemName" },
                  { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
                  { title: "Liều dùng", dataIndex: "dosageInstructions", key: "dosageInstructions" },
                  { title: "Thời điểm", dataIndex: "time", key: "time" },
                ]}
                dataSource={detailModal.record.medicineDetails}
                pagination={false}
                rowKey="requestDetailID"
                size="small"
              />
            </div>
            <div  style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "flex-end",
              gap: 5
            }}>
              <Button onClick={() => handleApprove(detailModal.record.requestID)}>
                Duyệt đơn thuốc
              </Button>
              <Button danger>
                Hủy
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ApproveMedicine;