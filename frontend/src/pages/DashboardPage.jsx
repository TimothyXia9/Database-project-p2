import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MovieIcon from "@mui/icons-material/Movie";
import RateReviewIcon from "@mui/icons-material/RateReview";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import "./DashboardPage.css";

const DashboardPage = () => {
	const { user } = useSelector((state) => state.auth);
	const { permissions, isCustomer, isEmployee, isAdmin } = usePermissions();

	if (!user) {
		return null;
	}

	return (
		<div className="dashboard-page">
			<Navbar />

			<div className="dashboard-container">
				<div className="dashboard-header">
					<h1 className="dashboard-title">Dashboard</h1>
					<p className="dashboard-subtitle">Manage your account</p>
				</div>

				<div className="dashboard-content">
					<div className="dashboard-sidebar">
						<div className="profile-card">
							<div className="profile-avatar">
								<AccountCircleIcon style={{ fontSize: 80 }} />
							</div>
							<h2 className="profile-name">
								{user.first_name} {user.last_name}
							</h2>
							<p className="profile-email">{user.email}</p>
							<span className="profile-badge">{user.account_type}</span>
						</div>

						<nav className="dashboard-nav">
							<Link to="/account" className="nav-item">
								<AccountCircleIcon />
								<span>Account Settings</span>
							</Link>
							<Link to="/my-feedback" className="nav-item">
								<RateReviewIcon />
								<span>My Feedback</span>
							</Link>
							{permissions.canAccessAdmin && (
								<>
									<Link to="/admin/series" className="nav-item">
										<MovieIcon />
										<span>Webseries Management</span>
									</Link>
									<Link to="/admin/content" className="nav-item">
										<BusinessIcon />
										<span>Content Management</span>
									</Link>
								</>
							)}
							{isAdmin && (
								<>
									<Link to="/admin/users" className="nav-item">
										<PeopleIcon />
										<span>User Management</span>
									</Link>
									<Link to="/admin/system" className="nav-item">
										<SettingsIcon />
										<span>System Settings</span>
									</Link>
								</>
							)}
						</nav>
					</div>

					<div className="dashboard-main">
						{/* Role Badge and Welcome Message */}
						<div className="dashboard-welcome">
							<h2>Welcome back, {user.first_name}!</h2>
							<p className="role-description">
								{isCustomer && "You can explore and enjoy our vast collection of web series."}
								{isEmployee && "You can manage web series content, episodes, production houses, and producers."}
								{isAdmin && "You have full system administration privileges, including user management and system settings."}
							</p>
						</div>

						<div className="dashboard-section">
							<h2 className="section-title">Account Information</h2>
							<div className="info-cards">
								<div className="info-card">
									<div className="info-row">
										<span className="info-key">Membership Type</span>
										<span className="info-value">
											{user.account_type}
											{isCustomer && " - Customer"}
											{isEmployee && " - Employee"}
											{isAdmin && " - Administrator"}
										</span>
									</div>
									<div className="info-row">
										<span className="info-key">Account Status</span>
										<span className="info-value">{user.is_active ? "Active" : "Inactive"}</span>
									</div>
									<div className="info-row">
										<span className="info-key">Registration Date</span>
										<span className="info-value">{user.open_date || "Unknown"}</span>
									</div>
									<div className="info-row">
										<span className="info-key">Location</span>
										<span className="info-value">
											{user.city}, {user.state}, {user.country_name}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardPage;
