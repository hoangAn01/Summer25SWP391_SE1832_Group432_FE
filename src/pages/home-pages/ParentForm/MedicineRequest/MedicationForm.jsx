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
  Upload,
} from "antd";
import { PhoneOutlined, ArrowLeftOutlined, UserOutlined, MedicineBoxOutlined, InfoCircleOutlined, FileTextOutlined, PlusCircleOutlined, DeleteOutlined, HistoryOutlined, CalendarOutlined, CheckCircleOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./MedicationForm.css";
import api from "../../../../config/axios";
import axios from "axios";
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
  const [medicineImages, setMedicineImages] = useState({}); // Store medicine images for each page
  const [uploadLoading, setUploadLoading] = useState({});
  const [isAnyUploading, setIsAnyUploading] = useState(false);

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
      
      // Process history data to ensure medicineDetails are properly structured
      const processedHistory = filtered.map(item => {
        // Extract medicineDetails to correct format
        const medicineDetails = item.medicineDetails?.$values || item.medicineDetails || [];
        return {
          ...item,
          medicineDetails: Array.isArray(medicineDetails) ? medicineDetails : []
        };
      });
      
      console.log("Processed history data:", processedHistory);
      setHistoryData(processedHistory);
    } catch (error) {
      console.error("Error fetching history:", error);
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
            medicineRequestImg: medicineImages[idx] || "", // Changed field name to match backend expectation
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
      setMedicineImages({});
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

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file, pageIdx) => {
    // Update both specific page loading state and the general uploading state
    setUploadLoading(prev => ({...prev, [pageIdx]: true}));
    setIsAnyUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "upload_NguyenLong");

    try {
      // Thêm log để debug
      console.log("Bắt đầu tải ảnh lên Cloudinary cho trang", pageIdx);
      
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dueel4qtb/image/upload",
        formData
      );
      
      console.log("Kết quả tải ảnh lên:", res.data);
      
      // Store the image URL for this page
      const updatedImages = {
        ...medicineImages, 
        [pageIdx]: res.data.secure_url
      };
      
      setMedicineImages(updatedImages);
      console.log("Đã lưu URL ảnh:", updatedImages);
      
      message.success("Tải ảnh lên thành công");
      return res.data.secure_url;
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      message.error("Tải ảnh lên thất bại. Vui lòng thử lại!");
      return null;
    } finally {
      // Update upload loading status for this specific page
      const newUploadLoading = {...uploadLoading, [pageIdx]: false};
      setUploadLoading(newUploadLoading);
      
      // Check if any uploads are still in progress
      const stillUploading = Object.values(newUploadLoading).some(val => val === true);
      setIsAnyUploading(stillUploading);
    }
  };

  // Props for Upload component
  const uploadProps = (pageIdx) => ({
    name: 'file',
    listType: 'picture',
    maxCount: 1,
    showUploadList: false, // Ẩn danh sách file đã upload
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error(`${file.name} không phải là file ảnh`);
        return Upload.LIST_IGNORE;
      }
      
      // Handle manual upload to Cloudinary
      handleImageUpload(file, pageIdx);
      return false; // Prevent auto upload
    },
  });

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
        backgroundColor: "#f8f9ff",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
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
          color: "#4a6bff",
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
            color: "#4a6bff",
            borderBottom: "2px solid #4a6bff",
            paddingBottom: "10px",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: "linear-gradient(to right, #f8f9ff, #e6eaff, #f8f9ff)",
            padding: "15px 0",
            borderRadius: "8px 8px 0 0"
          }}
        >
          <FileTextOutlined style={{fontSize: 28, color: '#4a6bff'}} />
          {user
            ? `Phụ huynh ${user.fullName} tạo đơn gửi thuốc uống`
            : "ĐƠN GỬI THUỐC UỐNG"}
        </h2>

        <Row gutter={32}>
          <Col span={9}>
            <div
              className="student-info"
              style={{
                backgroundColor: "#e6f7ff",
                padding: "20px",
                borderRadius: "12px",
                height: "100%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "1px solid #bae7ff"
              }}
            >
              <h3 className="section-title" style={{ color: "#096dd9", borderBottom: "1px solid #bae7ff", paddingBottom: "10px" }}><UserOutlined style={{color:'#096dd9', marginRight:8}}/> Thông tin học sinh</h3>

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
                backgroundColor: "#f6ffed",
                padding: "20px",
                borderRadius: "12px",
                height: "100%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "1px solid #b7eb8f"
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
                  borderBottom: "1px solid #b7eb8f",
                  paddingBottom: "10px"
                }}
              >
                <h3 className="section-title" style={{ color: "#52c41a" }}><MedicineBoxOutlined style={{color:'#52c41a', marginRight:8}}/> Thông tin thuốc hoặc vật dụng</h3>
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
                          dropdownStyle={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
                        >
                          {medicineList.map((item) => (
                            <Select.Option
                              key={item.requestItemID}
                              value={item.requestItemID}
                              data={item}
                              label={item.requestItemName}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: "bold", color: "#1d39c4" }}>{item.requestItemName}</span>
                                <span style={{ color: "#5c6bbf", fontSize: 12, fontStyle: "italic" }}>
                                {item.description}
                              </span>
                              </div>
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
                          <Tag color="orange">Sáng</Tag>
                        </Option>
                        <Option
                          value="noon"
                          disabled={(
                            form.getFieldValue(["medicines", idx, "time"]) || []
                          ).includes("noon")}
                        >
                          <Tag color="blue">Trưa</Tag>
                        </Option>
                      </Select>
                    </Form.Item>

                    {/* Thêm trường tải ảnh */}
                    <Form.Item
                      label={<span><UploadOutlined /> Ảnh thuốc/vật dụng (nếu có)</span>}
                    >
                      <Upload
                        {...uploadProps(idx)}
                        loading={uploadLoading[idx]}
                      >
                        <Button icon={<UploadOutlined />} loading={uploadLoading[idx]} style={{ background: "#f9f0ff", borderColor: "#d3adf7", color: "#722ed1" }}>
                          Chọn ảnh
                        </Button>
                      </Upload>
                      {medicineImages[idx] && (
                        <div style={{marginTop: 8, position: 'relative'}}>
                          <img 
                            src={medicineImages[idx]} 
                            alt="Ảnh thuốc" 
                            style={{maxWidth: '100%', maxHeight: '200px', objectFit: 'contain'}} 
                          />
                          <Button 
                            icon={<DeleteOutlined />} 
                            type="primary" 
                            danger
                            style={{position: 'absolute', top: 8, right: 8}}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Xóa ảnh khỏi state
                              const updatedImages = {...medicineImages};
                              delete updatedImages[idx];
                              setMedicineImages(updatedImages);
                              message.success("Đã xóa ảnh");
                            }}
                          />
                        </div>
                      )}
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
            background: "linear-gradient(to right, #f8f9ff, #e6eaff, #f8f9ff)",
            padding: "15px",
            borderRadius: "0 0 8px 8px"
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
              style={{ background: "#fff1f0", borderColor: "#ffa39e", color: "#f5222d" }}
            >
              Nhập lại
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              disabled={isAnyUploading}
              icon={<CheckCircleOutlined />}
              style={{ background: isAnyUploading ? "#d9d9d9" : "#52c41a", borderColor: isAnyUploading ? "#bfbfbf" : "#3f8600" }}
            >
              {isAnyUploading ? "Đang tải ảnh lên..." : "Xác nhận"}
            </Button>
          </Space>
        </div>
      </Form>

      <Button
        type="default"
        style={{ 
          marginBottom: 16, 
          marginTop: 16, 
          background: "#fff2e8", 
          borderColor: "#ffbb96", 
          color: "#fa541c" 
        }}
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
        title={<span style={{ color: "#fa541c" }}><HistoryOutlined /> Lịch sử gửi thuốc</span>}
        footer={null}
        width={900}
        bodyStyle={{ background: "#fff8f0" }}
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
                        style={{ 
                          textAlign: 'left', 
                          whiteSpace: 'normal',
                          ...(selectedHistoryRequest?.requestID === item.requestID 
                            ? { background: "#fa8c16", borderColor: "#d46b08" }
                            : { background: "#fff7e6", borderColor: "#ffd591", color: "#d46b08" })
                        }}
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
                <>
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
                      { 
                        title: "Tên thuốc/Vật tư", 
                        dataIndex: "requestItemName", 
                        key: "requestItemName",
                        render: (text) => <span style={{ fontWeight: "500", color: "#096dd9" }}>{text}</span>
                      },
                      { 
                        title: "Số lượng", 
                        dataIndex: "quantity", 
                        key: "quantity",
                        render: (text) => <Tag color="geekblue">{text}</Tag>
                      },
                      { 
                        title: "Liều dùng/Cách sử dụng", 
                        dataIndex: "dosageInstructions", 
                        key: "dosageInstructions",
                        render: (text) => <span style={{ color: "#08979c" }}>{text}</span>
                      },
                      { 
                        title: "Thời điểm", 
                        dataIndex: "time", 
                        key: "time", 
                        render: (text) => {
                          const timeVN = timeToVN(text);
                          return (
                            <span>
                              {timeVN.split(", ").map((time, i) => (
                                <Tag 
                                  key={i} 
                                  color={time === "Sáng" ? "orange" : time === "Trưa" ? "blue" : "purple"}
                                  style={{ margin: "2px" }}
                                >
                                  {time}
                                </Tag>
                              ))}
                            </span>
                          );
                        }
                      },
                      { 
                        title: "Ảnh thuốc", 
                        dataIndex: "medicineRequestImg", 
                        key: "medicineRequestImg", 
                        render: (medicineRequestImg) => {
                          // Check multiple possible field names for image URL
                          const image = medicineRequestImg || null;
                          return image ? (
                            <div style={{ position: "relative" }}>
                              <img 
                                src={image} 
                                alt="Ảnh thuốc" 
                                style={{ 
                                  maxWidth: 80, 
                                  maxHeight: 80,
                                  cursor: "pointer", 
                                  borderRadius: "4px",
                                  border: "1px solid #ffccc7"
                                }}
                                onClick={() => {
                                  Modal.info({
                                    title: "Ảnh thuốc",
                                    content: (
                                      <img 
                                        src={image} 
                                        alt="Ảnh thuốc" 
                                        style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }}
                                      />
                                    ),
                                    width: 520,
                                  });
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  right: 0,
                                  background: "rgba(0,0,0,0.45)",
                                  color: "#fff",
                                  padding: "2px 6px",
                                  fontSize: "12px",
                                  borderRadius: "0 0 4px 0",
                                }}
                              >
                                <PlusOutlined />
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: "#999" }}>Không có ảnh</span>
                          );
                        }
                      },
                    ]}
                  />

                  {/* Log the history data to debug */}
                  <div style={{ display: "none" }}>
                    {console.log("Selected history details:", JSON.stringify(selectedHistoryRequest, null, 2))}
                  </div>
                </>
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
