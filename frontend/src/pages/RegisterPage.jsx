import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register, clearError } from "../store/slices/authSlice";
import "./AuthPages.css";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    street: "",
    city: "",
    state: "",
    country_name: "USA",
  });

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/browse");
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError("");
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "密码至少需要8个字符";
    }
    if (!/[A-Z]/.test(password)) {
      return "密码必须包含至少一个大写字母";
    }
    if (!/[a-z]/.test(password)) {
      return "密码必须包含至少一个小写字母";
    }
    if (!/\d/.test(password)) {
      return "密码必须包含至少一个数字";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 验证密码
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    // 验证密码匹配
    if (formData.password !== formData.confirmPassword) {
      setValidationError("两次输入的密码不匹配");
      return;
    }

    // 移除 confirmPassword 字段
    const { confirmPassword, ...registerData } = formData;
    dispatch(register(registerData));
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <img
          src="https://source.unsplash.com/1920x1080/?cinema,theater,entertainment"
          alt="Background"
        />
        <div className="auth-overlay"></div>
      </div>

      <div className="auth-navbar">
        <Link to="/" className="auth-logo">
          NEWS
        </Link>
      </div>

      <div className="auth-container">
        <div className="auth-box auth-box-large">
          <h1 className="auth-title">注册</h1>

          {(error || validationError) && (
            <div className="auth-error">{error || validationError}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-row">
              <div className="auth-input-group">
                <input
                  type="text"
                  name="first_name"
                  placeholder="名"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>

              <div className="auth-input-group">
                <input
                  type="text"
                  name="last_name"
                  placeholder="姓"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <input
                type="email"
                name="email"
                placeholder="邮箱地址"
                value={formData.email}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-input-group">
              <input
                type="password"
                name="password"
                placeholder="密码"
                value={formData.password}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-input-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="确认密码"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-input-group">
              <input
                type="text"
                name="street"
                placeholder="街道地址"
                value={formData.street}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-row">
              <div className="auth-input-group">
                <input
                  type="text"
                  name="city"
                  placeholder="城市"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>

              <div className="auth-input-group">
                <input
                  type="text"
                  name="state"
                  placeholder="州/省"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <input
                type="text"
                name="country_name"
                placeholder="国家"
                value={formData.country_name}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <div className="auth-footer">
            <span className="auth-footer-text">已有账户？</span>
            <Link to="/login" className="auth-link">
              立即登录
            </Link>
          </div>

          <div className="auth-info">
            注册即表示您同意我们的服务条款和隐私政策。
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
