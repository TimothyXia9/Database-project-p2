import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import MovieIcon from "@mui/icons-material/Movie";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "./AdminPages.css";

const AdminSeriesPage = () => {
	const { permissions } = usePermissions();

	// TODO: Fetch series data from API
	const series = [];

	return (
		<div className="admin-page">
			<Navbar />
			<div className="admin-container">
				<div className="admin-header">
					<div className="header-content">
						<MovieIcon style={{ fontSize: 40 }} />
						<div>
							<h1>剧集管理</h1>
							<p>管理所有网络剧集信息</p>
						</div>
					</div>
					{permissions.canCreateSeries && (
						<Link to="/admin/series/create" className="btn btn-primary">
							<AddIcon /> 创建剧集
						</Link>
					)}
				</div>

				<div className="admin-content">
					<div className="admin-stats">
						<div className="stat-box">
							<h3>0</h3>
							<p>总剧集数</p>
						</div>
						<div className="stat-box">
							<h3>0</h3>
							<p>本月新增</p>
						</div>
						<div className="stat-box">
							<h3>0</h3>
							<p>活跃剧集</p>
						</div>
					</div>

					<div className="admin-table-container">
						<div className="table-header">
							<h2>剧集列表</h2>
							<input type="text" placeholder="搜索剧集..." className="search-input" />
						</div>

						{series.length > 0 ? (
							<table className="admin-table">
								<thead>
									<tr>
										<th>剧集ID</th>
										<th>标题</th>
										<th>类型</th>
										<th>集数</th>
										<th>评分</th>
										<th>操作</th>
									</tr>
								</thead>
								<tbody>
									{series.map((item) => (
										<tr key={item.id}>
											<td>{item.id}</td>
											<td>{item.title}</td>
											<td>{item.type}</td>
											<td>{item.num_episodes}</td>
											<td>{item.rating || "N/A"}</td>
											<td className="action-buttons">
												{permissions.canEditSeries && (
													<button className="btn-icon" title="编辑">
														<EditIcon />
													</button>
												)}
												{permissions.canDeleteSeries && (
													<button className="btn-icon" title="删除" style={{ color: "#f44336" }}>
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
								<MovieIcon style={{ fontSize: 64, opacity: 0.3 }} />
								<p>暂无剧集数据</p>
								{permissions.canCreateSeries && (
									<Link to="/admin/series/create" className="btn btn-primary">
										创建第一部剧集
									</Link>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminSeriesPage;
