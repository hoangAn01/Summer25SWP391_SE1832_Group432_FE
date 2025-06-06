import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Select,
  DatePicker,
} from "antd";
import axios from "axios";
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import "./RegisterPage.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";

function RegisterPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const onFinish = async (values) => {
    console.log("Form submitted:", values);
    try {
      await api.post("Auth/register", values);
      toast.success("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Validation Failed:", errorInfo);
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
                }),
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
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
            >
              <DatePicker
                placeholder="Ngày sinh"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <Form.Item
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input.TextArea placeholder="Địa chỉ" rows={2} />
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

            {/* <div className="form-options">
              <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <a href="#" className="forgot-password">
                Quên mật khẩu?
              </a>
            </div> */}

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Đăng ký
              </Button>
            </Form.Item>

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

export default RegisterPage;
