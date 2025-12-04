import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, clearError } from "../store/slices/authSlice";
import "./AuthPages.css";

const LoginPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

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
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		dispatch(login(formData));
	};

	return (
		<div className="auth-page">
			<div className="auth-background">
				<img src="https://source.unsplash.com/1920x1080/?cinema,theater,entertainment" alt="Background" />
				<div className="auth-overlay"></div>
			</div>

			<div className="auth-navbar">
				<Link to="/" className="auth-logo">
					NEWS
				</Link>
			</div>

			<div className="auth-container">
				<div className="auth-box">
					<h1 className="auth-title">登录</h1>

					{error && <div className="auth-error">{error}</div>}

					<form onSubmit={handleSubmit} className="auth-form">
						<div className="auth-input-group">
							<input type="email" name="email" placeholder="邮箱地址" value={formData.email} onChange={handleChange} required className="auth-input" />
						</div>

						<div className="auth-input-group">
							<input type="password" name="password" placeholder="密码" value={formData.password} onChange={handleChange} required className="auth-input" />
						</div>

						<button type="submit" className="auth-submit" disabled={loading}>
							{loading ? "登录中..." : "登录"}
						</button>

						<div className="auth-help">
							<label className="auth-checkbox">
								<input type="checkbox" />
								<span>记住我</span>
							</label>
							<Link to="/forgot-password" className="auth-link">
								忘记密码？
							</Link>
						</div>
					</form>

					<div className="auth-footer">
						<span className="auth-footer-text">还没有账户？</span>
						<Link to="/register" className="auth-link">
							立即注册
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
