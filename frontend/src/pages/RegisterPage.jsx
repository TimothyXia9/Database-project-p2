import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register, clearError } from "../store/slices/authSlice";
import "./AuthPages.css";

const RegisterPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

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
			return "Password must be at least 8 characters long";
		}
		if (!/[A-Z]/.test(password)) {
			return "Password must contain at least one uppercase letter";
		}
		if (!/[a-z]/.test(password)) {
			return "Password must contain at least one lowercase letter";
		}
		if (!/\d/.test(password)) {
			return "Password must contain at least one number";
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
			setValidationError("Passwords do not match");
			return;
		}

		const { confirmPassword, ...registerData } = formData;
		dispatch(register(registerData));
	};

	return (
		<div className="auth-page">
			<div className="auth-background">
				<img src="https://source.unsplash.com/dvNWscgOUZ4" alt="Background" />
				<div className="auth-overlay"></div>
			</div>

			<div className="auth-navbar">
				<Link to="/" className="auth-logo">
					NEWS
				</Link>
			</div>

			<div className="auth-container">
				<div className="auth-box auth-box-large">
					<h1 className="auth-title">Register</h1>

					{(error || validationError) && <div className="auth-error">{error || validationError}</div>}

					<form onSubmit={handleSubmit} className="auth-form">
						<div className="auth-row">
							<div className="auth-input-group">
								<input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required className="auth-input" />
							</div>

							<div className="auth-input-group">
								<input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required className="auth-input" />
							</div>
						</div>

						<div className="auth-input-group">
							<input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="auth-input" />
						</div>

						<div className="auth-input-group">
							<input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="auth-input" />
						</div>

						<div className="auth-input-group">
							<input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required className="auth-input" />
						</div>

						<div className="auth-input-group">
							<input type="text" name="street" placeholder="Street Address" value={formData.street} onChange={handleChange} required className="auth-input" />
						</div>

						<div className="auth-row">
							<div className="auth-input-group">
								<input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required className="auth-input" />
							</div>

							<div className="auth-input-group">
								<input type="text" name="state" placeholder="State/Province" value={formData.state} onChange={handleChange} required className="auth-input" />
							</div>
						</div>

						<div className="auth-input-group">
							<input type="text" name="country_name" placeholder="Country" value={formData.country_name} onChange={handleChange} required className="auth-input" />
						</div>

						<button type="submit" className="auth-submit" disabled={loading}>
							{loading ? "Registering..." : "Register"}
						</button>
					</form>

					<div className="auth-footer">
						<span className="auth-footer-text">Already have an account?</span>
						<Link to="/login" className="auth-link">
							Login now
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
