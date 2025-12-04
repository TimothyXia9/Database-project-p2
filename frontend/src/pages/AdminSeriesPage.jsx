import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import MovieIcon from "@mui/icons-material/Movie";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import "./AdminPages.css";
import seriesService from "../services/seriesService";
import * as adminService from "../services/adminService";
import * as contentService from "../services/contentService";

const AdminSeriesPage = () => {
	const { permissions } = usePermissions();
	const [series, setSeries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [stats, setStats] = useState({
		total: 0,
		this_month: 0,
		total_episodes: 0,
	});
	const [productionHouses, setProductionHouses] = useState([]);

	// Modal state
	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState("create");
	const [currentSeries, setCurrentSeries] = useState(null);
	const [formData, setFormData] = useState({});

	useEffect(() => {
		fetchSeries();
		fetchStats();
		fetchProductionHouses();
	}, []);

	const fetchProductionHouses = async () => {
		try {
			const data = await contentService.getAllProductionHouses();
			setProductionHouses(data.production_houses);
		} catch (error) {
			console.error("Failed to fetch production houses:", error);
		}
	};

	const fetchSeries = async (search = "") => {
		try {
			setLoading(true);
			const data = await seriesService.getAllSeries({ search, per_page: 100 });
			setSeries(data.series);
		} catch (error) {
			console.error("Failed to fetch series:", error);
			alert("获取剧集列表失败: " + (error.message || "未知错误"));
		} finally {
			setLoading(false);
		}
	};

	const fetchStats = async () => {
		try {
			const data = await adminService.getSystemStats();
			setStats(data.series);
		} catch (error) {
			console.error("Failed to fetch stats:", error);
		}
	};

	const handleSearchInputChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleSearchClick = () => {
		fetchSeries(searchTerm);
	};

	const handleSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchSeries(searchTerm);
		}
	};

	const openCreateModal = () => {
		setModalMode("create");
		setCurrentSeries(null);
		setFormData({});
		setShowModal(true);
	};

	const openEditModal = (item) => {
		setModalMode("edit");
		setCurrentSeries(item);
		setFormData({ ...item });
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setCurrentSeries(null);
		setFormData({});
	};

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (modalMode === "create") {
				await seriesService.createSeries(formData);
				alert("剧集创建成功");
			} else {
				await seriesService.updateSeries(currentSeries.webseries_id, formData);
				alert("剧集更新成功");
			}
			fetchSeries(searchTerm);
			fetchStats();
			closeModal();
		} catch (error) {
			console.error("Failed to save series:", error);
			alert("操作失败: " + (error.error || error.message || "未知错误"));
		}
	};

	const handleDeleteSeries = async (seriesId) => {
		if (window.confirm("确定要删除该剧集吗？此操作将同时删除所有相关集数、反馈等数据，且无法撤销。")) {
			try {
				await seriesService.deleteSeries(seriesId);
				alert("剧集删除成功");
				fetchSeries(searchTerm);
				fetchStats();
			} catch (error) {
				console.error("Failed to delete series:", error);
				alert("剧集删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

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
						<button className="btn btn-primary" onClick={openCreateModal}>
							<AddIcon /> 创建剧集
						</button>
					)}
				</div>

				<div className="admin-content">
					<div className="admin-stats">
						<div className="stat-box">
							<h3>{stats.total}</h3>
							<p>总剧集数</p>
						</div>
						<div className="stat-box">
							<h3>{stats.this_month}</h3>
							<p>本月新增</p>
						</div>
						<div className="stat-box">
							<h3>{stats.total_episodes}</h3>
							<p>总集数</p>
						</div>
					</div>

					<div className="admin-table-container">
						<div className="table-header">
							<h2>剧集列表</h2>
							<div className="search-container">
								<input type="text" placeholder="搜索剧集..." className="search-input" value={searchTerm} onChange={handleSearchInputChange} onKeyPress={handleSearchKeyPress} />
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

						{series.length > 0 ? (
							<table className="admin-table">
								<thead>
									<tr>
										<th>剧集ID</th>
										<th>标题</th>
										<th>类型</th>
										<th>集数</th>
										<th>评分</th>
										{(permissions.canEditSeries || permissions.canDeleteSeries) && <th>操作</th>}
									</tr>
								</thead>
								<tbody>
									{series.map((item) => (
										<tr key={item.webseries_id}>
											<td>{item.webseries_id}</td>
											<td>{item.title}</td>
											<td>{item.type}</td>
											<td>{item.num_episodes}</td>
											<td>{item.rating || "N/A"}</td>
											{(permissions.canEditSeries || permissions.canDeleteSeries) && (
												<td className="action-buttons">
													{permissions.canEditSeries && (
														<button className="btn-icon" title="编辑" onClick={() => openEditModal(item)}>
															<EditIcon />
														</button>
													)}
													{permissions.canDeleteSeries && (
														<button className="btn-icon" title="删除" onClick={() => handleDeleteSeries(item.webseries_id)} style={{ color: "#f44336" }}>
															<DeleteIcon />
														</button>
													)}
												</td>
											)}
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div className="empty-admin-state">
								<MovieIcon style={{ fontSize: 64, opacity: 0.3 }} />
								<p>暂无剧集数据</p>
								{permissions.canCreateSeries && (
									<button className="btn btn-primary" onClick={openCreateModal}>
										创建第一部剧集
									</button>
								)}
							</div>
						)}
					</div>

					{/* Modal for Create/Edit */}
					{showModal && (
						<div className="modal-overlay" onClick={closeModal}>
							<div className="modal-content" onClick={(e) => e.stopPropagation()}>
								<div className="modal-header">
									<h2>{modalMode === "create" ? "创建" : "编辑"}剧集</h2>
									<button className="btn-icon" onClick={closeModal}>
										<CloseIcon />
									</button>
								</div>

								<form onSubmit={handleSubmit} className="modal-form">
									<div className="form-group">
										<label>剧集标题 *</label>
										<input type="text" name="title" value={formData.title || ""} onChange={handleFormChange} required placeholder="请输入剧集标题" />
									</div>
									<div className="form-group">
										<label>类型 *</label>
										<select name="type" value={formData.type || ""} onChange={handleFormChange} required>
											<option value="">请选择类型</option>
											<option value="Drama">剧情</option>
											<option value="Comedy">喜剧</option>
											<option value="Action">动作</option>
											<option value="Sci-Fi">科幻</option>
											<option value="Horror">恐怖</option>
											<option value="Romance">爱情</option>
											<option value="Thriller">惊悚</option>
											<option value="Documentary">纪录片</option>
										</select>
									</div>
									<div className="form-group">
										<label>制作公司 *</label>
										<select name="house_id" value={formData.house_id || ""} onChange={handleFormChange} required>
											<option value="">请选择制作公司</option>
											{productionHouses.map((house) => (
												<option key={house.house_id} value={house.house_id}>
													{house.name}
												</option>
											))}
										</select>
									</div>
									<div className="form-group">
										<label>集数</label>
										<input type="number" name="num_episodes" value={formData.num_episodes || ""} onChange={handleFormChange} min="0" placeholder="0" />
									</div>

									<div className="modal-actions">
										<button type="button" className="btn btn-secondary" onClick={closeModal}>
											取消
										</button>
										<button type="submit" className="btn btn-primary">
											{modalMode === "create" ? "创建" : "保存"}
										</button>
									</div>
								</form>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminSeriesPage;
