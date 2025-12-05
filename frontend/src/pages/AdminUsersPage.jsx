import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import PeopleIcon from "@mui/icons-material/People";
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
			alert("Fail to fetch users: " + (error.message || "Unknown error"));
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
		if (window.confirm(`Are you sure you want to change the user role to ${newRole}?`)) {
			try {
				await adminService.changeUserRole(userId, newRole);
				alert("Role updated successfully");
				fetchUsers(searchTerm);
				fetchStats();
			} catch (error) {
				console.error("Failed to change role:", error);
				alert("Failed to update role: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleToggleStatus = async (userId, currentStatus) => {
		const newStatus = !currentStatus;
		const action = newStatus ? "activate" : "deactivate";

		if (window.confirm(`Are you sure you want to ${action} this user?`)) {
			try {
				await adminService.toggleUserStatus(userId, newStatus);
				alert(`User ${action}d successfully`);
				fetchUsers(searchTerm);
			} catch (error) {
				console.error("Failed to toggle status:", error);
				alert(`Failed to ${action} user: ` + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleDeleteUser = async (userId) => {
		if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
			try {
				await adminService.deleteUser(userId);
				alert("User deleted successfully.");
				fetchUsers(searchTerm);
				fetchStats();
			} catch (error) {
				console.error("Failed to delete user:", error);
				alert("Failed to delete user: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleResetPassword = async (userId) => {
		const newPassword = prompt("Please enter a new password (at least 8 characters, including uppercase, lowercase letters, and numbers):");
		if (newPassword) {
			try {
				await adminService.resetUserPassword(userId, newPassword);
				alert("Password reset successfully");
			} catch (error) {
				console.error("Failed to reset password:", error);
				alert("Failed to reset password: " + (error.error || error.message || "Unknown error"));
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
						<p>You do not have permission to access this page</p>
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
							<h1>User Management</h1>
							<p>Manage system users and permissions (Admins only)</p>
						</div>
					</div>
				</div>

				<div className="admin-content">
					<div className="admin-stats">
						<div className="stat-box">
							<h3>{stats.total}</h3>
							<p>Total Users</p>
						</div>
						<div className="stat-box">
							<h3>{stats.customers}</h3>
							<p>Customers</p>
						</div>
						<div className="stat-box">
							<h3>{stats.employees}</h3>
							<p>Employees</p>
						</div>
						<div className="stat-box">
							<h3>{stats.admins}</h3>
							<p>Admins</p>
						</div>
					</div>

					<div className="admin-table-container">
						<div className="table-header">
							<h2>User List</h2>
							<div className="search-container">
								<input type="text" placeholder="Search users..." className="search-input" value={searchTerm} onChange={handleSearchInputChange} onKeyPress={handleSearchKeyPress} />
								<button className="btn btn-primary" onClick={handleSearchClick}>
									<SearchIcon /> Search
								</button>
							</div>
						</div>

						{loading && (
							<div className="loading-state">
								<p>Loading...</p>
							</div>
						)}

						{users.length > 0 ? (
							<table className="admin-table">
								<thead>
									<tr>
										<th>Account ID</th>
										<th>Name</th>
										<th>Email</th>
										<th>Role</th>
										<th>Status</th>
										<th>Registration Date</th>
										<th>Actions</th>
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
												<span className={`status-badge ${user.is_active ? "active" : "inactive"}`} onClick={() => handleToggleStatus(user.account_id, user.is_active)} style={{ cursor: "pointer" }} title="Click to toggle status">
													{user.is_active ? "Active" : "Inactive"}
												</span>
											</td>
											<td>{user.open_date}</td>
											<td className="action-buttons">
												<button className="btn-icon" title="Reset Password" onClick={() => handleResetPassword(user.account_id)}>
													<LockResetIcon />
												</button>
												{permissions.canDeleteUsers && (
													<button className="btn-icon" title="Delete" onClick={() => handleDeleteUser(user.account_id)} style={{ color: "#f44336" }}>
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
								<p>No user data available</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminUsersPage;
