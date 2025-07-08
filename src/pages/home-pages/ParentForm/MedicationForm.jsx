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
import { PhoneOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./MedicationForm.css";
import api from "../../../config/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

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
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [createMedicineModal, setCreateMedicineModal] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineDesc, setNewMedicineDesc] = useState("");
  const [creatingMedicine, setCreatingMedicine] = useState(false);

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

  const fetchHistory = async (parentID) => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`MedicineRequest/sent/${parentID}`);
      console.log("Lịch sử đơn thuốc trả về:", res.data);
      let rawHistory = res.data.$values || [];
      // Tạm thời không filter theo students để kiểm tra
      // const studentIDs = students.map((s) => s.studentID);
      // rawHistory = rawHistory.filter((item) =>
      //   studentIDs.includes(item.studentID)
      // );
      console.log("rawHistory không filter:", rawHistory);
      setHistoryData(rawHistory);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
      setHistoryData([]);
    }
    setHistoryLoading(false);
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
      fetchHistory(parentID);
      setHistoryVisible(true);
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
        maxWidth: "1200px",
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
          }}
        >
          {user
            ? `Phụ huynh ${user.fullName} tạo đơn gửi thuốc uống`
            : "ĐƠN GỬI THUỐC UỐNG"}
        </h2>

        <Row gutter={32}>
          <Col span={12}>
            <div
              className="student-info"
              style={{
                backgroundColor: "#f9f9f9",
                padding: "20px",
                borderRadius: "8px",
                height: "100%",
              }}
            >
              <h3
                style={{
                  color: "#1677ff",
                  marginBottom: "20px",
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: "10px",
                }}
              >
                Thông tin học sinh
              </h3>

              <Form.Item
                name="studentID"
                label="Chọn học sinh"
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

              <Form.Item name="studentName" label="Họ và tên">
                <Input disabled />
              </Form.Item>

              <Form.Item name="className" label="Lớp ">
                <Input disabled />
              </Form.Item>

              {/* NOTE */}
              <Form.Item name="note" label="Ghi chú">
                <TextArea
                  rows={2}
                  placeholder="Nhập các lưu ý đặc biệt (nếu có)"
                />
              </Form.Item>
            </div>
          </Col>

          <Col span={12}>
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
                }}
              >
                <h3
                  style={{
                    color: "#1677ff",
                    margin: 0,
                    borderBottom: "1px solid #e0e0e0",
                    paddingBottom: "10px",
                  }}
                >
                  Thông tin thuốc và vật tư
                </h3>
                <div>
                  <Button
                    size="small"
                    style={{ marginRight: "10px" }}
                    onClick={handleRemoveMedicinePage}
                    disabled={medicinePages.length <= 1}
                  >
                    Xóa trang
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleAddMedicinePage}
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
                      label="Tên thuốc/vật tư"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn tên thuốc/vật tư",
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
                        <Button
                          type="dashed"
                          onClick={() => setCreateMedicineModal(true)}
                          style={{ width: 130, marginLeft: 8 }}
                        >
                          Phụ huynh tạo thuốc
                        </Button>
                      </Input.Group>
                    </Form.Item>

                    <Form.Item
                      name={["quantity", idx, "quantity"]}
                      label="Số lượng"
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
                      label="Liều lượng/Hướng dẫn sử dụng"
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
                      label="Thời điểm sử dụng"
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
            >
              Nhập lại
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
            >
              Xác nhận
            </Button>
          </Space>
        </div>
      </Form>

      <Button
        type="default"
        style={{ marginBottom: 16 }}
        onClick={async () => {
          // Lấy parentID trước khi gọi API
          let parentID = null;
          try {
            const parentResponse = await api.get(
              `Parent/ByAccount/${user.userID}`
            );
            parentID = parentResponse.data.parentID;
          } catch (error) {
            console.error("Lỗi lấy parentID:", error);
          }
          if (parentID) fetchHistory(parentID);
          setHistoryVisible(true);
        }}
      >
        Lịch sử gửi thuốc
      </Button>
      <Modal
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        title="Lịch sử gửi thuốc"
        footer={null}
        width={1200}
      >
        <Table
          dataSource={historyData}
          loading={historyLoading}
          rowKey="requestID"
          columns={[
            {
              title: "Ngày gửi",
              key: "approvalDate",
              render: (_, record) => {
                const d = record.approvalDate || record.date;
                if (!d) return "";
                const date = new Date(d);
                const vietnamTime = new Date(
                  date.getTime() + 7 * 60 * 60 * 1000
                );
                return vietnamTime.toLocaleString("vi-VN");
              },
            },
            { title: "Học sinh", dataIndex: "studentName", key: "studentName" },
            {
              title: "Ghi chú",
              dataIndex: "note",
              key: "note",
              render: (text) => text || "Không có",
            },
          ]}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                dataSource={
                  Array.isArray(record.medicineDetails)
                    ? record.medicineDetails
                    : Array.isArray(record.medicineDetails?.$values)
                    ? record.medicineDetails.$values
                    : []
                }
                pagination={false}
                rowKey="requestDetailID"
                columns={[
                  {
                    title: "Tên thuốc/Vật tư ",
                    dataIndex: "requestItemName",
                    key: "requestItemName",
                  },
                  { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
                  {
                    title: "Liều dùng/Cách sử dụng ",
                    dataIndex: "dosageInstructions",
                    key: "dosageInstructions",
                  },
                  {
                    title: "Thời điểm",
                    dataIndex: "time",
                    key: "time",
                    render: timeToVN,
                  },
                ]}
              />
            ),
            rowExpandable: () => true,
          }}
        />
      </Modal>

      {/* Modal tạo thuốc mới */}
      <Modal
        open={createMedicineModal}
        onCancel={() => setCreateMedicineModal(false)}
        title="Tạo thuốc/vật tư mới"
        onOk={async () => {
          setCreatingMedicine(true);
          try {
            await api.post("MedicalInventory", {
              itemName: newMedicineName,
              quantity: 0,
              unit: "Cái",
              location: "Kho y tế",
            });
            toast.success("Tạo thuốc mới thành công!");
            setCreateMedicineModal(false);
            setNewMedicineName("");
            setNewMedicineDesc("");
            await fetchMedicineList();
            // Tự động chọn thuốc vừa tạo cho trang hiện tại
            const updatedList = await api.get("MedicalInventory");
            const created = (updatedList.data.$values || updatedList.data).find(
              (item) => item.itemName === newMedicineName
            );
            if (created) {
              // Tạo mảng mới để trigger re-render
              const itemName = [...(form.getFieldValue("itemName") || [])];
              itemName[currentPage - 1] = {
                medicineName: created.itemID,
              };
              form.setFieldsValue({ itemName });
              console.log(
                "itemName sau khi set:",
                form.getFieldValue("itemName")
              );
              // Trigger validate lại trường này sau khi setFieldsValue
              setTimeout(async () => {
                try {
                  await form.validateFields([
                    ["itemName", currentPage - 1, "medicineName"],
                  ]);
                  console.log("Validate OK");
                } catch (err) {
                  console.log("Validate lỗi:", err);
                }
              }, 0);
            }
          } catch (error) {
            console.error("Lỗi tạo thuốc:", error);
            toast.error("Tạo thuốc thất bại!");
          }
          setCreatingMedicine(false);
        }}
        confirmLoading={creatingMedicine}
      >
        <Form layout="vertical">
          <Form.Item label="Tên thuốc/vật tư" required>
            <Input
              value={newMedicineName}
              onChange={(e) => setNewMedicineName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Mô tả">
            <Input
              value={newMedicineDesc}
              onChange={(e) => setNewMedicineDesc(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicationForm;
