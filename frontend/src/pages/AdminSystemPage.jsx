import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import SettingsIcon from "@mui/icons-material/Settings";
import PublicIcon from "@mui/icons-material/Public";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import StorageIcon from "@mui/icons-material/Storage";
import BackupIcon from "@mui/icons-material/Backup";
import HistoryIcon from "@mui/icons-material/History";
import "./AdminPages.css";
import * as adminService from "../services/adminService";

const AdminSystemPage = () => {
	const { permissions } = usePermissions();
	const [stats, setStats] = useState(null);
	const [countries, setCountries] = useState([]);
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("stats");

	useEffect(() => {
		fetchStats();
		fetchCountries();
		fetchLogs();
	}, []);

	const fetchStats = async () => {
		try {
			const data = await adminService.getSystemStats();
			setStats(data);
		} catch (error) {
			console.error("Failed to fetch stats:", error);
			alert("获取统计信息失败");
		} finally {
			setLoading(false);
		}
	};

	const fetchCountries = async () => {
		try {
			const data = await adminService.getAllCountries();
			setCountries(data.countries);
		} catch (error) {
			console.error("Failed to fetch countries:", error);
		}
	};

	const fetchLogs = async () => {
		try {
			const data = await adminService.getSystemLogs();
			setLogs(data.logs);
		} catch (error) {
			console.error("Failed to fetch logs:", error);
		}
	};

	const handleAddCountry = async () => {
		const countryName = prompt("请输入国家名称：");
		if (countryName) {
			try {
				await adminService.createCountry(countryName);
				alert("国家添加成功");
				fetchCountries();
			} catch (error) {
				console.error("Failed to add country:", error);
				alert("国家添加失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleDeleteCountry = async (countryName) => {
		if (window.confirm(`确定要删除国家"${countryName}"吗？`)) {
			try {
				await adminService.deleteCountry(countryName);
				alert("国家删除成功");
				fetchCountries();
			} catch (error) {
				console.error("Failed to delete country:", error);
				alert("国家删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleVacuum = async () => {
		if (window.confirm("确定要执行数据库优化吗？")) {
			try {
				await adminService.vacuumDatabase();
				alert("数据库优化完成");
			} catch (error) {
				console.error("Failed to vacuum database:", error);
				alert("数据库优化失败");
			}
		}
	};

	const handleBackup = async () => {
		if (window.confirm("确定要创建数据库备份吗？")) {
			try {
				await adminService.backupDatabase();
				alert("备份已启动");
			} catch (error) {
				console.error("Failed to backup database:", error);
				alert("备份失败");
			}
		}
	};

	if (!permissions.canManageUsers) {
		return (
			<div className="admin-page">
				<Navbar />
				<div className="admin-container">
					<div className="access-denied">
						<h1>访问被拒绝</h1>
						<p>您没有权限访问此页面</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="admin-page">
			<Navbar />
			<div className="admin-container">
				<div className="admin-header">
					<div className="header-content">
						<SettingsIcon style={{ fontSize: 40 }} />
						<div>
							<h1>系统管理</h1>
							<p>系统统计、国家管理、数据库维护</p>
						</div>
					</div>
				</div>

				<div className="admin-content">
					<div className="admin-tabs">
						<button className={`tab-button ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>
							<StorageIcon /> 系统统计
						</button>
						<button className={`tab-button ${activeTab === "countries" ? "active" : ""}`} onClick={() => setActiveTab("countries")}>
							<PublicIcon /> 国家管理
						</button>
						<button className={`tab-button ${activeTab === "maintenance" ? "active" : ""}`} onClick={() => setActiveTab("maintenance")}>
							<BackupIcon /> 数据库维护
						</button>
						<button className={`tab-button ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>
							<HistoryIcon /> 系统日志
						</button>
					</div>

					{activeTab === "stats" && stats && (
						<div className="system-stats-section">
							<h2>系统统计信息</h2>

							<div className="stats-grid">
								<div className="stats-category">
									<h3>用户统计</h3>
									<div className="admin-stats">
										<div className="stat-box">
											<h3>{stats.users.total}</h3>
											<p>总用户数</p>
										</div>
										<div className="stat-box">
											<h3>{stats.users.customers}</h3>
											<p>观众</p>
										</div>
										<div className="stat-box">
											<h3>{stats.users.employees}</h3>
											<p>员工</p>
										</div>
										<div className="stat-box">
											<h3>{stats.users.admins}</h3>
											<p>管理员</p>
										</div>
										<div className="stat-box">
											<h3>{stats.users.active}</h3>
											<p>活跃用户</p>
										</div>
									</div>
								</div>

								<div className="stats-category">
									<h3>内容统计</h3>
									<div className="admin-stats">
										<div className="stat-box">
											<h3>{stats.series.total}</h3>
											<p>总剧集数</p>
										</div>
										<div className="stat-box">
											<h3>{stats.series.this_month}</h3>
											<p>本月新增</p>
										</div>
										<div className="stat-box">
											<h3>{stats.series.total_episodes}</h3>
											<p>总集数</p>
										</div>
									</div>
								</div>

								<div className="stats-category">
									<h3>反馈统计</h3>
									<div className="admin-stats">
										<div className="stat-box">
											<h3>{stats.feedback.total}</h3>
											<p>总反馈数</p>
										</div>
										<div className="stat-box">
											<h3>{stats.feedback.average_rating}</h3>
											<p>平均评分</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{activeTab === "countries" && (
						<div className="countries-section">
							<div className="section-header">
								<h2>国家列表</h2>
								<button className="btn btn-primary" onClick={handleAddCountry}>
									<AddIcon /> 添加国家
								</button>
							</div>

							<div className="countries-grid">
								{countries.map((country) => (
									<div key={country.country_name} className="country-card">
										<PublicIcon />
										<span>{country.country_name}</span>
										<button className="btn-icon" title="删除" onClick={() => handleDeleteCountry(country.country_name)} style={{ color: "#f44336" }}>
											<DeleteIcon />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{activeTab === "maintenance" && (
						<div className="maintenance-section">
							<h2>数据库维护</h2>

							<div className="maintenance-actions">
								<div className="maintenance-card">
									<StorageIcon style={{ fontSize: 48 }} />
									<h3>数据库优化</h3>
									<p>清理和优化数据库，提高查询性能</p>
									<button className="btn btn-secondary" onClick={handleVacuum}>
										执行优化
									</button>
								</div>

								<div className="maintenance-card">
									<BackupIcon style={{ fontSize: 48 }} />
									<h3>数据库备份</h3>
									<p>创建数据库完整备份</p>
									<button className="btn btn-primary" onClick={handleBackup}>
										创建备份
									</button>
								</div>
							</div>
						</div>
					)}

					{activeTab === "logs" && (
						<div className="logs-section">
							<h2>系统日志</h2>

							<div className="logs-list">
								{logs.length > 0 ? (
									logs.map((log, index) => (
										<div key={index} className="log-item">
											<div className={`log-type log-type-${log.type}`}>{log.type}</div>
											<div className="log-content">
												<p className="log-message">{log.message}</p>
												<span className="log-timestamp">{new Date(log.timestamp).toLocaleString("zh-CN")}</span>
											</div>
										</div>
									))
								) : (
									<div className="empty-admin-state">
										<HistoryIcon style={{ fontSize: 64, opacity: 0.3 }} />
										<p>暂无日志记录</p>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminSystemPage;
