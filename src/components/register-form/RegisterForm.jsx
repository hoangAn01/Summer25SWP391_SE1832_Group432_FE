import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Select,
  DatePicker,
  Space
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

  // State cho địa chỉ động
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [street, setStreet] = useState("");

  useEffect(() => {
    axios.get("https://provinces.open-api.vn/api/?depth=1").then(res => setProvinces(res.data));
  }, []);

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
    axios.get(`https://provinces.open-api.vn/api/p/${value}?depth=2`).then(res => setDistricts(res.data.districts));
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setSelectedWard("");
    setWards([]);
    axios.get(`https://provinces.open-api.vn/api/d/${value}?depth=2`).then(res => setWards(res.data.wards));
  };

  const handleWardChange = (value) => {
    setSelectedWard(value);
  };

  const onFinish = async (values) => {
    console.log("Form submitted:", values);
    try {
      const { dateOfBirth, ...rest } = values;
      // Ghép địa chỉ đầy đủ
      const provinceName = provinces.find(p => p.code === selectedProvince)?.name || "";
      const districtName = districts.find(d => d.code === selectedDistrict)?.name || "";
      const wardName = wards.find(w => w.code === selectedWard)?.name || "";
      const address = `${street}, ${wardName}, ${districtName}, ${provinceName}`;
      const payload = {
        ...rest,
        dateOfBirth: dateOfBirth.toISOString(),
        address
      };
      console.log("Payload địa chỉ:", payload.address);
      const response = await api.post("Auth/register", payload);
      if (response && response.data && response.data.user) {
        dispatch(login(response.data.user)); // Lưu vào Redux
      }
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      toast.success("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đăng ký thất bại!");
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
        <div className="form-wrapper">
          <img
            src="images/Screenshot_2025-05-27_080730-removebg-preview.png"
            alt=""
          />
          <p className="subtitle welcome-text">
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
            >
              <Input placeholder="Họ và tên" />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
                { min: 4, message: "Tên đăng nhập phải có ít nhất 4 ký tự" },
              ]}
            >
              <Input placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
                  message: "Mật khẩu phải chứa ít nhất một chữ cái thường, một chữ cái hoa và một ký tự đặc biệt"
                }
              ]}
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
                })
              ]}
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
            >
              <Input placeholder="Số điện thoại" />
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              rules={[
                { required: true, message: "Vui lòng chọn ngày sinh" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const year = value.year();
                    if (year >= 1960 && year <= 2006) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Năm sinh nằm ngoài tuổi quy định, vui lòng đăng ký lại."));
                  },
                })
              ]}
            >
              <DatePicker
                placeholder="Ngày sinh"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              required
              style={{ marginBottom: 0 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                  placeholder="Chọn tỉnh/thành phố"
                  value={selectedProvince || undefined}
                  onChange={handleProvinceChange}
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                >
                  {provinces.map(p => (
                    <Select.Option key={p.code} value={p.code}>{p.name}</Select.Option>
                  ))}
                </Select>
                {selectedProvince && (
                  <Select
                    placeholder="Chọn quận/huyện"
                    value={selectedDistrict || undefined}
                    onChange={handleDistrictChange}
                    style={{ width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  >
                    {districts.map(d => (
                      <Select.Option key={d.code} value={d.code}>{d.name}</Select.Option>
                    ))}
                  </Select>
                )}
                {selectedDistrict && (
                  <Select
                    placeholder="Chọn phường/xã"
                    value={selectedWard || undefined}
                    onChange={handleWardChange}
                    style={{ width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  >
                    {wards.map(w => (
                      <Select.Option key={w.code} value={w.code}>{w.name}</Select.Option>
                    ))}
                  </Select>
                )}
                {selectedWard && (
                  <Input
                    placeholder="Nhập tên đường/số nhà"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                  />
                )}
              </Space>
            </Form.Item>

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

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" block>
                Đăng ký
              </Button>
              <Button 
                icon={<FaArrowLeft />} 
                onClick={handleBackToLogin} 
                block
                type="default"
              >
                Quay lại trang đăng nhập
              </Button>
            </Space>

            <Divider>Hoặc đăng nhập với</Divider>

            <div className="oauth-buttons">
              <Button block icon={<FaGoogle />} className="btn secondary">
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
