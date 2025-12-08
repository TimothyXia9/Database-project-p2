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
	const [history, setHistory] = useState([]);
	const [historyStats, setHistoryStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("stats");

	useEffect(() => {
		fetchStats();
		fetchCountries();
		fetchLogs();
		fetchHistory();
	}, []);

	const fetchStats = async () => {
		try {
			const data = await adminService.getSystemStats();
			setStats(data);
		} catch (error) {
			console.error("Failed to fetch stats:", error);
			alert("Failed to fetch stats: " + (error.message || "Unknown error"));
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

	const fetchHistory = async () => {
		try {
			const [historyData, statsData] = await Promise.all([adminService.getRecentHistory(50), adminService.getHistoryStats()]);
			setHistory(historyData.history || []);
			setHistoryStats(statsData);
		} catch (error) {
			console.error("Failed to fetch history:", error);
		}
	};

	const handleAddCountry = async () => {
		const countryName = prompt("Please enter the name of the country to add:");
		if (countryName) {
			try {
				await adminService.createCountry(countryName);
				alert("Country added successfully");
				fetchCountries();
			} catch (error) {
				console.error("Failed to add country:", error);
				alert("Failed to add country: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleDeleteCountry = async (countryName) => {
		if (window.confirm(`Are you sure you want to delete the country "${countryName}"?`)) {
			try {
				await adminService.deleteCountry(countryName);
				alert("Country deleted successfully.");
				fetchCountries();
			} catch (error) {
				console.error("Failed to delete country:", error);
				alert("Failed to delete country: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleVacuum = async () => {
		if (window.confirm("Are you sure you want to perform database vacuum?")) {
			try {
				await adminService.vacuumDatabase();
				alert("Database vacuum completed");
			} catch (error) {
				console.error("Failed to vacuum database:", error);
				alert("Database vacuum failed");
			}
		}
	};

	const handleBackup = async () => {
		if (window.confirm("Are you sure you want to create a database backup?")) {
			try {
				await adminService.backupDatabase();
				alert("Backup initiated");
			} catch (error) {
				console.error("Failed to backup database:", error);
				alert("Backup failed");
			}
		}
	};

	if (!permissions.canManageUsers) {
		return (
			<div className="admin-page">
				<Navbar />
				<div className="admin-container">
					<div className="access-denied">
						<h1>Access Denied</h1>
						<p>You do not have permission to access this page.</p>
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
							<h1>System Management</h1>
							<p>System statistics, country management, database maintenance</p>
						</div>
					</div>
				</div>

				<div className="admin-content">
					<div className="admin-tabs">
						<button className={`tab-button ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>
							<StorageIcon /> System Stats
						</button>
						<button className={`tab-button ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
							<HistoryIcon /> Change History
						</button>

						<button className={`tab-button ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>
							<HistoryIcon /> System Logs
						</button>
					</div>

					{activeTab === "stats" && stats && (
						<div className="system-stats-section">
							<h2>System Statistics</h2>

							<div className="stats-grid">
								<div className="stats-category">
									<h3>User Statistics</h3>
									<div className="admin-stats">
										<div className="stat-box">
											<h3>{stats.users.total}</h3>
											<p>Total Users</p>
										</div>
										<div className="stat-box">
											<h3>{stats.users.customers}</h3>
											<p>Customers</p>
										</div>
										<div className="stat-box">
											<h3>{stats.users.employees}</h3>
											<p>Employees</p>
										</div>
										<div className="stat-box">
											<h3>{stats.users.admins}</h3>
											<p>Admins</p>
										</div>
										<div className="stat-box">
											<h3>{stats.users.active}</h3>
											<p>Active Users</p>
										</div>
									</div>
								</div>

								<div className="stats-category">
									<h3>Content Statistics</h3>
									<div className="admin-stats">
										<div className="stat-box">
											<h3>{stats.series.total}</h3>
											<p>Total Series</p>
										</div>
										<div className="stat-box">
											<h3>{stats.series.this_month}</h3>
											<p>New This Month</p>
										</div>
										<div className="stat-box">
											<h3>{stats.series.total_episodes}</h3>
											<p>Total Episodes</p>
										</div>
									</div>
								</div>

								<div className="stats-category">
									<h3>Feedback Statistics</h3>
									<div className="admin-stats">
										<div className="stat-box">
											<h3>{stats.feedback.total}</h3>
											<p>Total Feedback</p>
										</div>
										<div className="stat-box">
											<h3>{stats.feedback.average_rating}</h3>
											<p>Average Rating</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{activeTab === "countries" && (
						<div className="countries-section">
							<div className="section-header">
								<h2>Country List</h2>
								<button className="btn btn-primary" onClick={handleAddCountry}>
									<AddIcon /> Add Country
								</button>
							</div>

							<div className="countries-grid">
								{countries.map((country) => (
									<div key={country.country_name} className="country-card">
										<PublicIcon />
										<span>{country.country_name}</span>
										<button className="btn-icon" title="Delete" onClick={() => handleDeleteCountry(country.country_name)} style={{ color: "#f44336" }}>
											<DeleteIcon />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{activeTab === "history" && (
						<div className="history-section">
							<h2>Change History</h2>

							{historyStats && (
								<div className="history-stats">
									<div className="stat-box">
										<h3>{historyStats.total_records.accounts}</h3>
										<p>Account Changes</p>
									</div>
									<div className="stat-box">
										<h3>{historyStats.total_records.series}</h3>
										<p>Series Changes</p>
									</div>
									<div className="stat-box">
										<h3>{historyStats.total_records.feedback}</h3>
										<p>Feedback Changes</p>
									</div>
									<div className="stat-box highlight">
										<h3>{historyStats.last_24h.accounts + historyStats.last_24h.series + historyStats.last_24h.feedback}</h3>
										<p>Changes (Last 24h)</p>
									</div>
								</div>
							)}

							<div className="history-list">
								{history.length > 0 ? (
									history.map((record) => (
										<div key={`${record.entity_type}-${record.id}`} className="history-item">
											<div className={`history-operation history-operation-${record.operation.toLowerCase()}`}>{record.operation}</div>
											<div className="history-content">
												<div className="history-header">
													<span className="history-type">{record.entity_type}</span>
													<span className="history-id">{record.entity_id}</span>
												</div>
												<p className="history-details">{record.details}</p>
												<div className="history-meta">
													<span className="history-timestamp">{new Date(record.changed_at).toLocaleString("zh-CN")}</span>
													{record.changed_by && <span className="history-user">by {record.changed_by}</span>}
												</div>
											</div>
										</div>
									))
								) : (
									<div className="empty-admin-state">
										<HistoryIcon style={{ fontSize: 64, opacity: 0.3 }} />
										<p>No History Records</p>
									</div>
								)}
							</div>
						</div>
					)}

					{activeTab === "logs" && (
						<div className="logs-section">
							<h2>System Logs</h2>

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
										<p>No Logs Available</p>
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
