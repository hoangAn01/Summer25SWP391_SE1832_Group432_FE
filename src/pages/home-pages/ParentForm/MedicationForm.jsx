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

  const fetchStudents = async () => {
    try {
      // Lấy thông tin phụ huynh trước
      const parentResponse = await api.get(`/Parent/user/${user.userID}`);
      const parentID = parentResponse.data.parentID;

      // Sau đó lấy danh sách học sinh theo parentID
      const studentsResponse = await api.get(`/Student/${parentID}`);

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

  // Lấy danh sách thuốc và vật tư y tế từ MedicalInventory
  const fetchMedicineList = async () => {
    try {
      setLoading(true);
      const res = await api.get("/MedicalInventory");

      // Xử lý response với cấu trúc mới có $values
      const medicineData = res.data.$values || [];
      console.log("Medical inventory data:", medicineData);
      setMedicineList(medicineData);
    } catch (error) {
      console.error("Lỗi lấy danh sách thuốc và vật tư:", error);
      message.error("Không thể tải danh sách thuốc và vật tư");
      setMedicineList([]);
    } finally {
      setLoading(false);
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
      const parentResponse = await api.get(`/Parent/user/${user.userID}`);
      const parentID = parentResponse.data.parentID;

      const payload = {
        studentID: values.studentID,
        parentID: parentID,
        note: values.note || "",
        medicineDetails: medicinePages.map((_, idx) => {
          const selectedItemName = values.itemName?.[idx]?.medicineName;
          console.log(
            `Page ${idx + 1} - Selected item name:`,
            selectedItemName
          );

          // Tìm item trong danh sách để lấy requestItemID
          const selectedItem = medicineList.find(
            (item) => item.itemName === selectedItemName
          );
          console.log(`Page ${idx + 1} - Found item:`, selectedItem);

          const result = {
            requestItemID: selectedItem
              ? selectedItem.$id || selectedItem.id
              : 0,
            quantity: values.quantity?.[idx]?.quantity || 1,
            dosageInstructions: values.dosageIntructions?.[idx]?.dosage || "",
            time: (values.medicines?.[idx]?.time || []).join(", "),
          };

          console.log(`Page ${idx + 1} - Final result:`, result);
          return result;
        }),
      };

      console.log("Final payload:", payload);
      await api.post("/MedicineRequest", payload);
      toast.success("Đơn gửi thuốc đã được gửi cho nhân viên y tá.");

      // Reset form sau khi gửi thành công
      setTimeout(() => {
        form.resetFields();
        setMedicinePages(["1"]);
        setCurrentPage(1);
      }, 1000);
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

  // Lấy màu cho category
  const getCategoryColor = (category) => {
    switch (category) {
      case "Thuốc":
        return "blue";
      case "Vật tư":
        return "green";
      default:
        return "default";
    }
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

              <Form.Item name="className" label="Lớp">
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

              {medicinePages.map((_, idx) => (
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
                        message: "Vui lòng chọn hoặc nhập tên thuốc/vật tư",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn từ danh sách hoặc nhập tên thuốc/vật tư"
                      filterOption={(input, option) => {
                        const item = option?.data;
                        if (!item) return false;
                        return (
                          item.itemName
                            .toLowerCase()
                            .includes(input.toLowerCase()) ||
                          item.description
                            .toLowerCase()
                            .includes(input.toLowerCase()) ||
                          item.category
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        );
                      }}
                      allowClear
                      loading={loading}
                      optionLabelProp="label"
                      showArrow={true}
                      notFoundContent={
                        <div
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            color: "#666",
                          }}
                        >
                          Không tìm thấy trong danh sách. Bạn có thể nhập tên
                          thuốc/vật tư trực tiếp.
                        </div>
                      }
                    >
                      {medicineList.map((item) => (
                        <Option
                          key={item.$id || item.id}
                          value={item.itemName}
                          data={item}
                          label={item.itemName}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: "bold" }}>
                                {item.itemName}
                              </div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {item.description}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <Tag
                                color={getCategoryColor(item.category)}
                                size="small"
                              >
                                {item.category}
                              </Tag>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
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
                    >
                      <Option value="morning">Sáng</Option>
                      <Option value="noon">Trưa</Option>
                    </Select>
                  </Form.Item>
                </div>
              ))}
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
    </div>
  );
};

export default MedicationForm;
