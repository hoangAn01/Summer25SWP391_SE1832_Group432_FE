import { Form, Input, Button, Checkbox, Select, Divider } from "antd";
import { FaEye, FaEyeSlash, FaGoogle, FaMicrosoft } from "react-icons/fa";
import "./LoginForm.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../../config/axios";
import { login } from "../../redux/features/userSlice";

const { Option } = Select;

const LoginForm = () => {
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    console.log(values);
    console.log("Form submitted:", values);
    try {
      const response = await api.post("Auth/login", values);
      // Lưu toàn bộ thông tin user vào Redux
        
      dispatch(login(response.data.user));
      localStorage.setItem("token", response.data.token); //lấy cái token
      if (response.data.user.role === "Admin") {
        navigate("/dashboard");
        toast.success("Đăng nhập thành công!");
        return;
      }
      if (response.data.user.role === "Nurse") {
        navigate("/nurse");
        toast.success("Đăng nhập thành công!");
        return;
      }

      navigate("/home");
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      toast.error(error.response.data.message);
    }

    console.log("Login successful!");
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Validation Failed:", errorInfo);
  };

  return (
    <div className="auth-page">
      <div className="login-container">
        <div className="login-image-section">
          <img
            src="images/hinh-anh-mam-non_23202317.jpg "
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
                name="username"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập" },
                  {
                    min: 6,
                    message: "Tên đăng nhập phải có ít nhất 6 ký tự",
                  },
                ]}
              >
                <Input placeholder="Tên đăng nhập" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ]}
              >
                <Input.Password placeholder="Mật khẩu" />
              </Form.Item>

              <div className="form-options">
                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                  <Checkbox>Nhớ mật khẩu</Checkbox>
                </Form.Item>
                <a href="#" className="forgot-password">
                  Quên mật khẩu?
                </a>
              </div>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Đăng nhập
                </Button>
              </Form.Item>

              <div className="oauth-buttons">
                <Button
                  block
                  className="btn secondary"
                  onClick={() => navigate("/register")}
                >
                  Đăng ký tài khoản
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
