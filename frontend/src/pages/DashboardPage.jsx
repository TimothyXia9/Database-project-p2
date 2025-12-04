import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MovieIcon from "@mui/icons-material/Movie";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HistoryIcon from "@mui/icons-material/History";
import "./DashboardPage.css";

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

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
              <Link to="/my-list" className="nav-item">
                <FavoriteIcon />
                <span>我的列表</span>
              </Link>
              <Link to="/history" className="nav-item">
                <HistoryIcon />
                <span>观看历史</span>
              </Link>
              {(user.account_type === "Employee" ||
                user.account_type === "Admin") && (
                <Link to="/admin" className="nav-item">
                  <MovieIcon />
                  <span>管理后台</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="dashboard-main">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <MovieIcon />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">0</h3>
                  <p className="stat-label">观看中</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FavoriteIcon />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">0</h3>
                  <p className="stat-label">收藏</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <HistoryIcon />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">0</h3>
                  <p className="stat-label">已完成</p>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2 className="section-title">账户信息</h2>
              <div className="info-cards">
                <div className="info-card">
                  <div className="info-row">
                    <span className="info-key">会员类型</span>
                    <span className="info-value">{user.account_type}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">账户状态</span>
                    <span className="info-value">
                      {user.is_active ? "活跃" : "未激活"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">注册日期</span>
                    <span className="info-value">
                      {user.open_date || "未知"}
                    </span>
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

            <div className="dashboard-section">
              <h2 className="section-title">继续观看</h2>
              <div className="empty-state-dashboard">
                <MovieIcon style={{ fontSize: 64, opacity: 0.3 }} />
                <p>您还没有开始观看任何剧集</p>
                <Link to="/browse" className="btn btn-primary">
                  开始浏览
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
