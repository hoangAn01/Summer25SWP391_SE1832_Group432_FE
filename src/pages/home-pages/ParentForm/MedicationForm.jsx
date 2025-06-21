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
} from "antd";
import { PhoneOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./MedicationForm.css";
import api from "../../../config/axios";
import { useSelector } from "react-redux";

const { Option } = Select;
const { TextArea } = Input;

const MedicationForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [medicinePages, setMedicinePages] = useState(["1"]); // Track medicine pages
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const user = useSelector((state) => state.user); // Lấy user từ Redux

  const fetchStudents = async () => {
    try {
      // API 2 lần hơi lỏ, fix sau
      const response = await api.get(`/Parent/user/${user.userID}`); // gọi api lấy id phụ huynh
      const response2 = await api.get(`/Student/${response.data.parentID}`);
      console.log(response2.data);
      setStudents(response2.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, []);

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
    console.log(values);
    try {
      const payload = {
        studentID: values.studentID,
        parentID: user.userID,
        note: values.note || "",
        medicineDetails: medicinePages.map((_, idx) => ({
          itemName: values.itemName?.[idx]?.medicineName || "",
          quantity: values.quantity?.[idx]?.quantity || 1,
          dosageInstructions: values.dosageIntructions?.[idx]?.dosage || "",
          time: (values.medicines?.[idx]?.time || []).join(", ")
        }))
      };
      console.log("Payload", payload);
      await api.post("/MedicineRequest", payload);
      message.success("Đơn gửi thuốc đã được gửi cho nhân viên y tá.");
      setTimeout(() => {
        form.resetFields();
      }, 1000);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
        "Không thể gửi đơn thuốc. Vui lòng thử lại."
      );
    }
  };

  const handleGoBack = () => {
    navigate("/home");
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


                {/* NOTE  */}

              <Form.Item
                  name="note"
                  label="Ghi chú"
                >
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
                  Thông tin thuốc
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
                  style={{ display: idx + 1 === currentPage ? "block" : "none" }}
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
                    label="Tên thuốc"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên thuốc" },
                    ]}
                  >
                    <Input placeholder="Nhập tên thuốc" />
                  </Form.Item>

                  <Form.Item
                    name={["quantity", idx, "quantity"]}
                    label="Số lượng"
                    rules={[
                      { required: true, message: "Vui lòng nhập số lượng" }
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
                    label="Liều lượng"
                    rules={[
                      { required: true, message: "Vui lòng nhập liều lượng" },
                    ]}
                  >
                    <Input placeholder="VD: 1 viên/1 lần uống" />
                  </Form.Item>

                  <Form.Item
                    name={["medicines", idx, "time"]}
                    label="Thời điểm uống"
                    rules={[
                      { required: true, message: "Vui lòng chọn thời điểm uống" },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn thời điểm uống thuốc"
                      allowClear
                    >
                      <Option value="morning">Sáng</Option>
                      <Option value="noon">Trưa</Option>
                      <Option value="evening">Tối</Option>
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
              onClick={() => form.resetFields()}
            >
              Nhập lại
            </Button>
            <Button type="primary" htmlType="submit" size="large">
              Xác nhận
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default MedicationForm;
