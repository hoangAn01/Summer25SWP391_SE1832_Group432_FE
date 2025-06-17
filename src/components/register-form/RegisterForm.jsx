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
import { AddressSelector } from "./AddressSelector";
import provinces from '../../hanhchinhvn-master/dist/tinh_tp.json';
import districts from '../../hanhchinhvn-master/dist/quan_huyen.json';
import wards from '../../hanhchinhvn-master/dist/xa_phuong.json';

function RegisterForm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    console.log("Form submitted:", values);
    try {
      const { dateOfBirth, addressDetails, province, district, ward, ...rest } = values;
      
      // In ra thông tin chi tiết để debug
      console.log('Province code:', province);
      console.log('District code:', district);
      console.log('Ward code:', ward);

      // Kiểm tra dữ liệu tỉnh/huyện/xã
      console.log('Province data:', provinces[province]);
      console.log('District data:', districts[district]);
      console.log('Ward data:', wards[ward]);

      // Lấy tên tỉnh, huyện, xã
      const provinceName = provinces[province]?.name_with_type || '';
      const districtName = districts[district]?.name_with_type || '';
      const wardName = wards[ward]?.name_with_type || '';

      const payload = {
        ...rest,
        dateOfBirth: dateOfBirth.toISOString(),
        address: `Số ${addressDetails}, ${wardName}, ${districtName}, ${provinceName}`,
        province,
        district,
        ward
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

            <AddressSelector 
              onChange={(addressData) => {
                form.setFieldsValue({
                  province: addressData.province,
                  district: addressData.district,
                  ward: addressData.ward
                });
              }}
            />

            <Form.Item
              name="province"
              hidden
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="district"
              hidden
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="ward"
              hidden
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="addressDetails"
              rules={[{ required: true, message: "Vui lòng nhập số nhà, đường" }]}
            >
              <Input.TextArea placeholder="Số nhà, đường" rows={2} />
            </Form.Item>

            <Form.Item
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
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
