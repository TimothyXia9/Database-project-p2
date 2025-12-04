import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockResetIcon from "@mui/icons-material/LockReset";
import SearchIcon from "@mui/icons-material/Search";
import "./AdminPages.css";
import * as adminService from "../services/adminService";

const AdminUsersPage = () => {
	const { permissions } = usePermissions();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [stats, setStats] = useState({
		total: 0,
		customers: 0,
		employees: 0,
		admins: 0,
	});

	useEffect(() => {
		fetchUsers();
		fetchStats();
	}, []);

	const fetchUsers = async (search = "") => {
		try {
			setLoading(true);
			const data = await adminService.getAllUsers({ search, per_page: 100 });
			setUsers(data.users);
		} catch (error) {
			console.error("Failed to fetch users:", error);
			alert("获取用户列表失败: " + (error.message || "未知错误"));
		} finally {
			setLoading(false);
		}
	};

	const fetchStats = async () => {
		try {
			const data = await adminService.getSystemStats();
			setStats(data.users);
		} catch (error) {
			console.error("Failed to fetch stats:", error);
		}
	};

	const handleSearchInputChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleSearchClick = () => {
		fetchUsers(searchTerm);
	};

	const handleSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchUsers(searchTerm);
		}
	};

	const handleChangeRole = async (userId, newRole) => {
		if (window.confirm(`确定要将用户角色更改为 ${newRole} 吗？`)) {
			try {
				await adminService.changeUserRole(userId, newRole);
				alert("角色更新成功");
				fetchUsers(searchTerm);
				fetchStats();
			} catch (error) {
				console.error("Failed to change role:", error);
				alert("角色更新失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleToggleStatus = async (userId, currentStatus) => {
		const newStatus = !currentStatus;
		const action = newStatus ? "激活" : "禁用";

		if (window.confirm(`确定要${action}该用户吗？`)) {
			try {
				await adminService.toggleUserStatus(userId, newStatus);
				alert(`用户${action}成功`);
				fetchUsers(searchTerm);
			} catch (error) {
				console.error("Failed to toggle status:", error);
				alert(`用户${action}失败: ` + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleDeleteUser = async (userId) => {
		if (window.confirm("确定要删除该用户吗？此操作无法撤销。")) {
			try {
				await adminService.deleteUser(userId);
				alert("用户删除成功");
				fetchUsers(searchTerm);
				fetchStats();
			} catch (error) {
				console.error("Failed to delete user:", error);
				alert("用户删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleResetPassword = async (userId) => {
		const newPassword = prompt("请输入新密码（至少8位，包含大小写字母和数字）：");
		if (newPassword) {
			try {
				await adminService.resetUserPassword(userId, newPassword);
				alert("密码重置成功");
			} catch (error) {
				console.error("Failed to reset password:", error);
				alert("密码重置失败: " + (error.error || error.message || "未知错误"));
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
						<PeopleIcon style={{ fontSize: 40 }} />
						<div>
							<h1>用户管理</h1>
							<p>管理系统用户和权限 (仅限管理员)</p>
						</div>
					</div>
				</div>

				<div className="admin-content">
					<div className="admin-stats">
						<div className="stat-box">
							<h3>{stats.total}</h3>
							<p>总用户数</p>
						</div>
						<div className="stat-box">
							<h3>{stats.customers}</h3>
							<p>观众</p>
						</div>
						<div className="stat-box">
							<h3>{stats.employees}</h3>
							<p>员工</p>
						</div>
						<div className="stat-box">
							<h3>{stats.admins}</h3>
							<p>管理员</p>
						</div>
					</div>

					<div className="admin-table-container">
						<div className="table-header">
							<h2>用户列表</h2>
							<div className="search-container">
								<input type="text" placeholder="搜索用户..." className="search-input" value={searchTerm} onChange={handleSearchInputChange} onKeyPress={handleSearchKeyPress} />
								<button className="btn btn-primary" onClick={handleSearchClick}>
									<SearchIcon /> 搜索
								</button>
							</div>
						</div>

						{loading && (
							<div className="loading-state">
								<p>加载中...</p>
							</div>
						)}

						{users.length > 0 ? (
							<table className="admin-table">
								<thead>
									<tr>
										<th>账户ID</th>
										<th>姓名</th>
										<th>邮箱</th>
										<th>角色</th>
										<th>状态</th>
										<th>注册日期</th>
										<th>操作</th>
									</tr>
								</thead>
								<tbody>
									{users.map((user) => (
										<tr key={user.account_id}>
											<td>{user.account_id}</td>
											<td>
												{user.first_name} {user.last_name}
											</td>
											<td>{user.email}</td>
											<td>
												<select value={user.account_type} onChange={(e) => handleChangeRole(user.account_id, e.target.value)} className="role-select">
													<option value="Customer">Customer</option>
													<option value="Employee">Employee</option>
													<option value="Admin">Admin</option>
												</select>
											</td>
											<td>
												<span className={`status-badge ${user.is_active ? "active" : "inactive"}`} onClick={() => handleToggleStatus(user.account_id, user.is_active)} style={{ cursor: "pointer" }} title="点击切换状态">
													{user.is_active ? "活跃" : "未激活"}
												</span>
											</td>
											<td>{user.open_date}</td>
											<td className="action-buttons">
												<button className="btn-icon" title="重置密码" onClick={() => handleResetPassword(user.account_id)}>
													<LockResetIcon />
												</button>
												{permissions.canDeleteUsers && (
													<button className="btn-icon" title="删除" onClick={() => handleDeleteUser(user.account_id)} style={{ color: "#f44336" }}>
														<DeleteIcon />
													</button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div className="empty-admin-state">
								<PeopleIcon style={{ fontSize: 64, opacity: 0.3 }} />
								<p>暂无用户数据</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminUsersPage;
