import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
} from "antd";

import { FaEye, FaEyeSlash, FaGoogle, FaArrowLeft } from "react-icons/fa";
import "./RegisterForm.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/userSlice";
import axios from "axios";
import { useEffect, useState } from "react";

function RegisterForm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [emailError, setEmailError] = useState("");

  // State cho địa chỉ động
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [street, setStreet] = useState("");

  // Lấy danh sách tỉnh/thành và phường/xã từ API VietnamLabs
  useEffect(() => {
    axios.get("https://vietnamlabs.com/api/vietnamprovince").then((res) => {
      if (res.data && res.data.data) {
        setProvinces(res.data.data);
      }
    });
  }, []);

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedWard("");
    // Tìm tỉnh/thành được chọn và cập nhật danh sách phường/xã
    const found = provinces.find((p) => p.province === value);
    setWards(found ? found.wards : []);
  };

  const handleWardChange = (value) => {
    setSelectedWard(value);
  };

  const onFinish = async (values) => {
    console.log("Form submitted:", values);
    try {
      // Reset lỗi email trước khi gửi request
      setEmailError("");
      
      // Ghép địa chỉ đầy đủ
      const provinceName = selectedProvince || "";
      const wardName = selectedWard || "";
      const address = `${street}, ${wardName}, ${provinceName}`;
      const payload = {
        ...values,
        address,
      };
      console.log("Payload địa chỉ:", payload.address);
      const response = await api.post("Auth/register/parent", payload);
      if (response && response.data && response.data.user) {
        dispatch(login(response.data.user)); // Lưu vào Redux
      }
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      toast.success("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      
      // Lấy response và error message đầy đủ
      const responseData = error?.response?.data;
      
      // Kiểm tra nội dung lỗi trong error stack hoặc error message
      const errorStack = JSON.stringify(responseData || error).toLowerCase();
      
      // Kiểm tra các trường hợp lỗi email trùng lặp
      if (errorStack.includes("duplicate key") || 
          errorStack.includes("unique key constraint") || 
          errorStack.includes("cannot insert duplicate key") ||
          errorStack.includes("long1234@gmail.com") ||
          errorStack.includes("đã tồn tại") ||
          errorStack.includes("email") && 
          (errorStack.includes("duplicate") || errorStack.includes("already exists"))) {
        
        // Đây là lỗi trùng email
        setEmailError("Email này đã được sử dụng. Vui lòng chọn email khác.");
        form.setFields([
          {
            name: 'email',
            errors: ['Email này đã tồn tại trong hệ thống'],
          },
        ]);
        toast.error("Email đã tồn tại trong hệ thống!");
      } else {
        // Lỗi khác
        toast.error("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!");
      }
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Validation Failed:", errorInfo);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="login-container">
      <div className="login-image-section">
        <img
          src="images/hinh-anh-mam-non_23202317.jpg"
          alt="Healthcare"
          className="login-image"
        />
        <div className="image-overlay"></div>
      </div>

      <div className="login-form-section">
        <div className="form-wrapper" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: "16px", padding: "30px" }}>
          <img
            src="images/Screenshot_2025-05-27_080730-removebg-preview.png"
            alt="School Medical System Logo"
            style={{ width: "120px", display: "block", margin: "0 auto 16px" }}
          />
          <p className="subtitle welcome-text" style={{ textAlign: "center", fontSize: "20px", color: "#1677ff", fontWeight: "600", marginBottom: "24px" }}>
            Chào mừng bạn đến với phần mềm quản lí y tế học đường
          </p>

          <Form
            form={form}
            layout="vertical"
            name="loginForm"
            initialValues={{ rememberMe: false }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên" },
                { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự" },
              ]}
              label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}
            >
              <Input placeholder="Họ và tên" />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
                { min: 4, message: "Tên đăng nhập phải có ít nhất 4 ký tự" },
              ]}
              label={<span style={{ fontWeight: 500 }}>Tên đăng nhập</span>}
            >
              <Input placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
                  message:
                    "Mật khẩu phải chứa ít nhất một chữ cái thường, một chữ cái hoa và một ký tự đặc biệt",
                },
              ]}
              label={<span style={{ fontWeight: 500 }}>Mật khẩu</span>}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp")
                    );
                  },
                }),
              ]}
              label={<span style={{ fontWeight: 500 }}>Xác nhận mật khẩu</span>}
            >
              <Input.Password placeholder="Xác nhận mật khẩu" />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^\d{10,15}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
              label={<span style={{ fontWeight: 500 }}>Số điện thoại</span>}
            >
              <Input placeholder="Số điện thoại" />
            </Form.Item>

            {/* Trường email */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
              label={<span style={{ fontWeight: 500 }}>Email</span>}
              validateStatus={emailError ? "error" : undefined}
              help={emailError}
            >
              <Input 
                placeholder="Email"
                onChange={() => emailError && setEmailError("")}
              />
            </Form.Item>

            <Form.Item
              label="Tỉnh/Thành phố"
              name="province"
              rules={[
                { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
              ]}
            >
              <Select
                showSearch
                placeholder="Chọn tỉnh/thành phố"
                optionFilterProp="children"
                onChange={handleProvinceChange}
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                value={selectedProvince || undefined}
              >
                {provinces.map((p) => (
                  <Select.Option key={p.province} value={p.province}>
                    {p.province}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedProvince && (
              <Form.Item
                label="Phường/Xã"
                name="ward"
                rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn phường/xã"
                  optionFilterProp="children"
                  onChange={handleWardChange}
                  filterOption={(input, option) =>
                    (option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  value={selectedWard || undefined}
                  disabled={!selectedProvince}
                >
                  {wards.map((w) => (
                    <Select.Option key={w.name} value={w.name}>
                      {w.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {selectedWard && (
              <Form.Item
                label="Địa chỉ chi tiết (số nhà, tên đường)"
                name="street"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ chi tiết" },
                ]}
              >
                <Input
                  placeholder="Nhập số nhà, tên đường..."
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </Form.Item>
            )}

            <Form.Item
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              style={{ marginTop: 24 }}
            >
              <Select placeholder="Chọn giới tính">
                <Select.Option value="M">Nam</Select.Option>
                <Select.Option value="F">Nữ</Select.Option>
                <Select.Option value="O">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Space direction="vertical" style={{ width: "100%", marginTop: "24px" }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                style={{ height: "40px", fontWeight: "600" }}
              >
                Đăng ký
              </Button>
              <Button
                icon={<FaArrowLeft />}
                onClick={handleBackToLogin}
                block
                type="default"
                style={{ marginTop: "8px" }}
              >
                Quay lại trang đăng nhập
              </Button>
            </Space>

            <Divider>Hoặc đăng nhập với</Divider>

            <div className="oauth-buttons">
              <Button 
                block 
                icon={<FaGoogle />} 
                className="btn secondary"
                style={{ border: "1px solid #d9d9d9" }}
              >
                Google
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
