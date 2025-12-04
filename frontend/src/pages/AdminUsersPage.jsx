import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "./AdminPages.css";

const AdminUsersPage = () => {
	const { permissions } = usePermissions();
	const [users, setUsers] = useState([]);

	// TODO: Fetch users data from API

	const handleChangeRole = (userId, newRole) => {
		if (window.confirm(`确定要将用户角色更改为 ${newRole} 吗？`)) {
			// TODO: Implement role change API call
			console.log("Change role:", userId, newRole);
		}
	};

	const handleDeleteUser = (userId) => {
		if (window.confirm("确定要删除该用户吗？此操作无法撤销。")) {
			// TODO: Implement delete user API call
			console.log("Delete user:", userId);
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
							<h3>0</h3>
							<p>总用户数</p>
						</div>
						<div className="stat-box">
							<h3>0</h3>
							<p>观众</p>
						</div>
						<div className="stat-box">
							<h3>0</h3>
							<p>员工</p>
						</div>
						<div className="stat-box">
							<h3>0</h3>
							<p>管理员</p>
						</div>
					</div>

					<div className="admin-table-container">
						<div className="table-header">
							<h2>用户列表</h2>
							<input type="text" placeholder="搜索用户..." className="search-input" />
						</div>

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
												<span className={`status-badge ${user.is_active ? "active" : "inactive"}`}>{user.is_active ? "活跃" : "未激活"}</span>
											</td>
											<td>{user.open_date}</td>
											<td className="action-buttons">
												<button className="btn-icon" title="编辑">
													<EditIcon />
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
