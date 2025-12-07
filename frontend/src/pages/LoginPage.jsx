import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, clearError } from "../store/slices/authSlice";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "./AuthPages.css";

const LoginPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const [showPassword, setShowPassword] = useState(false);

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
			<div className="auth-navbar">
				<Link to="/" className="auth-logo">
					NEWS
				</Link>
			</div>

			<div className="auth-container">
				<div className="auth-box">
					<h1 className="auth-title">Login</h1>

					{error && <div className="auth-error">{error}</div>}

					<form onSubmit={handleSubmit} className="auth-form">
						<div className="auth-input-group">
							<input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="auth-input" />
						</div>

						<div className="auth-input-group password-input-group">
							<input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="auth-input auth-input-password" />
							<button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
								{showPassword ? <VisibilityOff /> : <Visibility />}
							</button>
						</div>

						<button type="submit" className="auth-submit" disabled={loading}>
							{loading ? "Logging in..." : "Login"}
						</button>

						<div className="auth-help">
							<label className="auth-checkbox">
								<input type="checkbox" />
								<span>Remember me</span>
							</label>
							<Link to="/forgot-password" className="auth-link">
								Forgot password?
							</Link>
						</div>
					</form>

					<div className="auth-footer">
						<div>
							<span className="auth-footer-text">Don't have an account?</span>
						</div>
						<Link to="/register" className="auth-link">
							Register now
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
