import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Pagination,
  message,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Tag,
  Modal,
  Table,
} from "antd";
import { PhoneOutlined, ArrowLeftOutlined, UserOutlined, MedicineBoxOutlined, InfoCircleOutlined, FileTextOutlined, PlusCircleOutlined, DeleteOutlined, HistoryOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./MedicationForm.css";
import api from "../../../../config/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const MedicationForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [medicinePages, setMedicinePages] = useState(["1"]); // Track medicine pages
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [medicineList, setMedicineList] = useState([]); // Danh sách thuốc và vật tư
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user); // Lấy user từ Redux
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyStudentID, setHistoryStudentID] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [selectedHistoryRequest, setSelectedHistoryRequest] = useState(null);

  const fetchStudents = async () => {
    try {
      // Lấy thông tin phụ huynh trước
      const parentResponse = await api.get(`Parent/ByAccount/${user.userID}`);
      const parentID = parentResponse.data.parentID;

      // Sau đó lấy danh sách học sinh theo parentID
      const studentsResponse = await api.get(`Student/by-parent/${parentID}`);

      // Xử lý response với cấu trúc mới có $values
      const studentsData =
        studentsResponse.data.$values || studentsResponse.data;
      console.log("Students data:", studentsData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Lỗi lấy danh sách học sinh:", error);
      message.error("Không thể tải danh sách học sinh");
    }
  };

  // Lấy danh sách thuốc và vật tư y tế từ MedicineRequest/items
  const fetchMedicineList = async () => {
    try {
      setLoading(true);
      const res = await api.get("MedicineRequest/items");
      const medicineData = res.data.$values || [];
      setMedicineList(medicineData);
    } catch (error) {
      console.error("Lỗi lấy danh sách thuốc:", error);
      message.error("Không thể tải danh sách thuốc");
      setMedicineList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryByStudent = async (studentID) => {
    try {
      if (!studentID) {
        setHistoryData([]);
        return;
      }
      const res = await api.get("/MedicineRequest/getAll");
      let allHistory = res.data.$values || res.data || [];
      // Lọc theo studentID
      const filtered = allHistory.filter(item => item.studentID === studentID);
      setHistoryData(filtered);
    } catch {
      setHistoryData([]);
    }
  };

  useEffect(() => {
    if (user?.userID) {
      fetchStudents();
      fetchMedicineList();
    }
  }, [user]);

  const handleAddMedicinePage = () => {
    const newPageNumber = String(medicinePages.length + 1);
    setMedicinePages([...medicinePages, newPageNumber]);
    setCurrentPage(medicinePages.length + 1);
  };

  const handleRemoveMedicinePage = () => {
    if (medicinePages.length <= 1) return;

    const newPages = medicinePages.slice(0, -1);
    setMedicinePages(newPages);
    setCurrentPage(Math.min(currentPage, newPages.length));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSubmit = async (values) => {
    console.log("Form values:", values);
    console.log("Medicine list:", medicineList);
    setLoading(true);

    try {
      // Lấy parentID từ thông tin phụ huynh
      const parentResponse = await api.get(`Parent/ByAccount/${user.userID}`);
      const parentID = parentResponse.data.parentID;

      const payload = {
        StudentID: values.studentID,
        ParentID: parentID,
        scheduledDate: values.scheduledDate ? values.scheduledDate.format("YYYY-MM-DD") : undefined,
        Note: values.note || "",
        MedicineDetails: medicinePages.map((_, idx) => {
          const selectedItemID = values.itemName?.[idx]?.medicineName;
          return {
            RequestItemID: selectedItemID,
            DosageInstructions: values.dosageIntructions?.[idx]?.dosage || "",
            Quantity: values.quantity?.[idx]?.quantity || 1,
            Time: (form.getFieldValue(["medicines", idx, "time"]) || []).join(
              ", "
            ),
          };
        }),
      };

      console.log("Final payload:", payload);
      await api.post("/MedicineRequest", payload);
      toast.success("Đơn gửi thuốc đã được gửi cho nhân viên y tá.");
      // Sau khi gửi thành công, tự động mở modal lịch sử và reload
      fetchHistoryByStudent(values.studentID);
      setHistoryVisible(true);
      form.resetFields();
      setMedicinePages(["1"]);
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi gửi đơn thuốc:", error);
      message.error(
        error.response?.data?.message ||
          "Không thể gửi đơn thuốc. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/home");
  };

  // Helper chuyển time sang tiếng Việt
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

  return (
    <div
      className="medication-form-container"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "white",
      }}
    >
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={handleGoBack}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "#1677ff",
        }}
      >
        Quay lại
      </Button>

      <Form
        form={form}
        layout="vertical"
        className="medication-form"
        onFinish={handleSubmit}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#1677ff",
            borderBottom: "2px solid #1677ff",
            paddingBottom: "10px",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <FileTextOutlined style={{fontSize: 28, color: '#1677ff'}} />
          {user
            ? `Phụ huynh ${user.fullName} tạo đơn gửi thuốc uống`
            : "ĐƠN GỬI THUỐC UỐNG"}
        </h2>

        <Row gutter={32}>
          <Col span={9}>
            <div
              className="student-info"
              style={{
                backgroundColor: "#f9f9f9",
                padding: "20px",
                borderRadius: "8px",
                height: "100%",
              }}
            >
              <h3 className="section-title"><UserOutlined style={{color:'#1677ff', marginRight:8}}/> Thông tin học sinh</h3>

              <Form.Item
                name="studentID"
                label={<span><UserOutlined /> Chọn học sinh</span>}
                rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
              >
                <Select
                  showSearch
                  placeholder="Tìm và chọn học sinh"
                  onChange={(studentID) => {
                    const student = students.find(
                      (s) => s.studentID === studentID
                    );
                    if (student) {
                      form.setFieldsValue({
                        studentID: student.studentID,
                        studentName: student.fullName,
                        className: student.className,
                      });
                    }
                  }}
                  allowClear
                >
                  {students.map((student) => (
                    <Select.Option
                      key={student.studentID}
                      value={student.studentID}
                    >
                      {student.fullName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="studentName" label={<span><InfoCircleOutlined /> Họ và tên</span>}>
                <Input disabled />
              </Form.Item>

              <Form.Item name="className" label={<span><InfoCircleOutlined /> Lớp</span>}>
                <Input disabled />
              </Form.Item>

              {/* Thêm ngày cho uống thuốc */}
              <Form.Item
                name="scheduledDate"
                label={<span><CalendarOutlined /> Ngày cho uống thuốc</span>}
                rules={[{ required: true, message: "Vui lòng chọn ngày cho uống thuốc" }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={current => {
                    const today = dayjs().startOf('day');
                    const threeDaysLater = today.add(2, 'day');
                    return current < today || current > threeDaysLater;
                  }}
                  placeholder="Chọn ngày cho uống thuốc (tối đa 3 ngày từ hôm nay trở đi)"
                />
              </Form.Item>

              <Form.Item
                name="note"
                label={<span><FileTextOutlined /> Ghi chú của phụ huynh</span>}
              >
                <TextArea
                  rows={2}
                  placeholder="Nhập các lưu ý đặc biệt cho y tế (nếu có)"
                />
              </Form.Item>

              {/* GHI CHÚ ĐÃ BỊ XÓA */}
            </div>
          </Col>

          <Col span={15}>
            <div
              className="medicine-info"
              style={{
                backgroundColor: "#f9f9f9",
                padding: "20px",
                borderRadius: "8px",
                height: "100%",
              }}
            >
              <div
                className="medicine-box-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  gap: 16,
                }}
              >
                <h3 className="section-title"><MedicineBoxOutlined style={{color:'#1677ff', marginRight:8}}/> Thông tin thuốc hoặc vật dụng</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    size="small"
                    style={{ marginRight: "10px" }}
                    onClick={handleRemoveMedicinePage}
                    disabled={medicinePages.length <= 1}
                    icon={<DeleteOutlined />}
                  >
                    Xóa trang
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleAddMedicinePage}
                    icon={<PlusCircleOutlined />}
                  >
                    Thêm trang
                  </Button>
                </div>
              </div>

              {medicinePages.map((_, idx) => {
                return (
                  <div
                    key={idx}
                    className="medicine-box"
                    style={{
                      display: idx + 1 === currentPage ? "block" : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <span>Trang {idx + 1}</span>
                      <Pagination
                        simple
                        current={currentPage}
                        total={medicinePages.length * 10}
                        pageSize={10}
                        onChange={handlePageChange}
                      />
                    </div>

                    <Form.Item
                      name={["itemName", idx, "medicineName"]}
                      label={<span><MedicineBoxOutlined /> Tên thuốc/vật dụng y tế</span>}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn tên thuốc/vật dụng",
                        },
                      ]}
                    >
                      <Input.Group compact>
                        <Select
                          showSearch
                          placeholder="Chọn từ danh sách thuốc/vật tư"
                          filterOption={(input, option) => {
                            const item = option?.data;
                            if (!item) return false;
                            return (
                              item.requestItemName
                                .toLowerCase()
                                .includes(input.toLowerCase()) ||
                              (item.description || "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            );
                          }}
                          allowClear
                          loading={loading}
                          optionLabelProp="label"
                          showArrow={true}
                          style={{ width: "calc(100% - 140px)" }}
                          value={form.getFieldValue([
                            "itemName",
                            idx,
                            "medicineName",
                          ])}
                          onChange={(value) => {
                            // Cập nhật giá trị vào form khi chọn thuốc
                            const itemName = [
                              ...(form.getFieldValue("itemName") || []),
                            ];
                            itemName[idx] = { medicineName: value };
                            form.setFieldsValue({ itemName });
                          }}
                        >
                          {medicineList.map((item) => (
                            <Select.Option
                              key={item.requestItemID}
                              value={item.requestItemID}
                              data={item}
                              label={item.requestItemName}
                            >
                              {item.requestItemName}{" "}
                              <span style={{ color: "#888", fontSize: 12 }}>
                                {item.description}
                              </span>
                            </Select.Option>
                          ))}
                        </Select>

                      </Input.Group>
                    </Form.Item>

                    <Form.Item
                      name={["quantity", idx, "quantity"]}
                      label={<span><InfoCircleOutlined /> Số lượng</span>}
                      rules={[
                        { required: true, message: "Vui lòng nhập số lượng" },
                      ]}
                    >
                      <InputNumber
                        placeholder="Nhập số lượng"
                        min={1}
                        max={100}
                      />
                    </Form.Item>

                    <Form.Item
                      name={["dosageIntructions", idx, "dosage"]}
                      label={<span><InfoCircleOutlined /> Liều lượng/Hướng dẫn sử dụng</span>}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập liều lượng hoặc hướng dẫn",
                        },
                      ]}
                    >
                      <Input placeholder="VD: 1 viên/1 lần uống hoặc hướng dẫn sử dụng" />
                    </Form.Item>

                    <Form.Item
                      name={["medicines", idx, "time"]}
                      label={<span><CalendarOutlined /> Thời điểm sử dụng</span>}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn thời điểm sử dụng",
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn thời điểm sử dụng"
                        allowClear
                        value={form.getFieldValue(["medicines", idx, "time"])}
                        onChange={(value) => {
                          form.setFieldsValue({
                            medicines: {
                              ...form.getFieldValue("medicines"),
                              [idx]: {
                                ...form.getFieldValue(["medicines", idx]),
                                time: value,
                              },
                            },
                          });
                        }}
                      >
                        <Option
                          value="morning"
                          disabled={(
                            form.getFieldValue(["medicines", idx, "time"]) || []
                          ).includes("morning")}
                        >
                          Sáng
                        </Option>
                        <Option
                          value="noon"
                          disabled={(
                            form.getFieldValue(["medicines", idx, "time"]) || []
                          ).includes("noon")}
                        >
                          Trưa
                        </Option>
                      </Select>
                    </Form.Item>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>

        <div
          className="buttons"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "30px",
          }}
        >
          <Space size="large">
            <Button
              type="default"
              size="large"
              onClick={() => {
                form.resetFields();
                setMedicinePages(["1"]);
                setCurrentPage(1);
              }}
              icon={<DeleteOutlined />}
            >
              Nhập lại
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<CheckCircleOutlined />}
            >
              Xác nhận
            </Button>
          </Space>
        </div>
      </Form>

      <Button
        type="default"
        style={{ marginBottom: 16 }}
        onClick={() => {
          setHistoryVisible(true);
          setHistoryStudentID(null);
          setHistoryData([]);
        }}
        icon={<HistoryOutlined />}
      >
        Lịch sử gửi thuốc
      </Button>
      <Modal
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        title={<span><HistoryOutlined /> Lịch sử gửi thuốc</span>}
        footer={null}
        width={900}
      >
        <div style={{ marginBottom: 16 }}>
          <Select
            showSearch
            placeholder="Chọn học sinh để xem lịch sử"
            style={{ width: 300 }}
            value={historyStudentID || undefined}
            onChange={studentID => {
              setHistoryStudentID(studentID);
              setSelectedHistoryRequest(null);
              fetchHistoryByStudent(studentID);
            }}
            allowClear
          >
            {students.map((student) => (
              <Select.Option key={student.studentID} value={student.studentID}>
                {student.fullName}
              </Select.Option>
            ))}
          </Select>
        </div>
        {historyStudentID ? (
          <div style={{ display: 'flex', gap: 24 }}>
            {/* Cột trái: Danh sách ngày gửi */}
            <div style={{ width: 250, borderRight: '1px solid #eee', paddingRight: 16, maxHeight: 400, overflowY: 'auto' }}>
              <h4><CalendarOutlined /> Ngày gửi</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {historyData.length === 0 && <li>Không có dữ liệu</li>}
                {historyData.map((item) => {
                  const d = item.approvalDate || item.date;
                  const dateStr = d ? new Date(d).toLocaleString('vi-VN') : '';
                  return (
                    <li key={item.requestID} style={{ marginBottom: 8 }}>
                      <Button
                        type={selectedHistoryRequest?.requestID === item.requestID ? 'primary' : 'default'}
                        block
                        onClick={() => setSelectedHistoryRequest(item)}
                        style={{ textAlign: 'left', whiteSpace: 'normal' }}
                      >
                        {dateStr}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
            {/* Cột phải: Chi tiết đơn gửi thuốc */}
            <div style={{ flex: 1, paddingLeft: 16 }}>
              <h4><MedicineBoxOutlined /> Chi tiết đơn gửi thuốc</h4>
              {selectedHistoryRequest ? (
                <Table
                  dataSource={
                    Array.isArray(selectedHistoryRequest.medicineDetails)
                      ? selectedHistoryRequest.medicineDetails
                      : Array.isArray(selectedHistoryRequest.medicineDetails?.$values)
                      ? selectedHistoryRequest.medicineDetails.$values
                      : []
                  }
                  pagination={false}
                  rowKey="requestDetailID"
                  columns={[
                    { title: "Tên thuốc/Vật tư ", dataIndex: "requestItemName", key: "requestItemName" },
                    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
                    { title: "Liều dùng/Cách sử dụng ", dataIndex: "dosageInstructions", key: "dosageInstructions" },
                    { title: "Thời điểm", dataIndex: "time", key: "time", render: timeToVN },
                  ]}
                />
              ) : (
                <div>Chọn ngày gửi để xem chi tiết đơn thuốc</div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
            Chọn học sinh để xem lịch sử gửi thuốc
          </div>
        )}
      </Modal>
    </div>
  );
};



export default MedicationForm;
