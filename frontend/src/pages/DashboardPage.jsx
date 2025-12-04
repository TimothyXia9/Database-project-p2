import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MovieIcon from "@mui/icons-material/Movie";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HistoryIcon from "@mui/icons-material/History";
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
					<h1 className="dashboard-title">个人中心</h1>
					<p className="dashboard-subtitle">管理您的账户和观看列表</p>
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
								<span>账户设置</span>
							</Link>
							<Link to="/my-feedback" className="nav-item">
								<RateReviewIcon />
								<span>我的反馈</span>
							</Link>
							{permissions.canAccessAdmin && (
								<>
									<Link to="/admin/series" className="nav-item">
										<MovieIcon />
										<span>剧集管理</span>
									</Link>
									<Link to="/admin/content" className="nav-item">
										<BusinessIcon />
										<span>内容管理</span>
									</Link>
								</>
							)}
							{isAdmin && (
								<>
									<Link to="/admin/users" className="nav-item">
										<PeopleIcon />
										<span>用户管理</span>
									</Link>
									<Link to="/admin/system" className="nav-item">
										<SettingsIcon />
										<span>系统设置</span>
									</Link>
								</>
							)}
						</nav>
					</div>

					<div className="dashboard-main">
						{/* Role Badge and Welcome Message */}
						<div className="dashboard-welcome">
							<h2>欢迎回来, {user.first_name}!</h2>
							<p className="role-description">
								{isCustomer && "您可以浏览剧集、提交反馈和管理您的观看列表。"}
								{isEmployee && "您可以管理剧集内容、集数、制作公司和制片人信息。"}
								{isAdmin && "您拥有完整的系统管理权限，包括用户管理和系统设置。"}
							</p>
						</div>

						<div className="dashboard-section">
							<h2 className="section-title">账户信息</h2>
							<div className="info-cards">
								<div className="info-card">
									<div className="info-row">
										<span className="info-key">会员类型</span>
										<span className="info-value">
											{user.account_type}
											{isCustomer && " - 观众"}
											{isEmployee && " - 员工"}
											{isAdmin && " - 管理员"}
										</span>
									</div>
									<div className="info-row">
										<span className="info-key">账户状态</span>
										<span className="info-value">{user.is_active ? "活跃" : "未激活"}</span>
									</div>
									<div className="info-row">
										<span className="info-key">注册日期</span>
										<span className="info-value">{user.open_date || "未知"}</span>
									</div>
									<div className="info-row">
										<span className="info-key">所在地</span>
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
