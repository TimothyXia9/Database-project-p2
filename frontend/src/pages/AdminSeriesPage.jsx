import React, { useState, useEffect } from "react";
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
			alert("Failed to fetch series: " + (error.message || "Unknown error"));
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
				alert("Series created successfully");
			} else {
				await seriesService.updateSeries(currentSeries.webseries_id, formData);
				alert("Series updated successfully");
			}
			fetchSeries(searchTerm);
			fetchStats();
			closeModal();
		} catch (error) {
			console.error("Failed to save series:", error);
			alert("Operation failed: " + (error.error || error.message || "Unknown error"));
		}
	};

	const handleDeleteSeries = async (seriesId) => {
		if (window.confirm("Are you sure you want to delete this series? This action will also delete all related episodes, feedback, and cannot be undone.")) {
			try {
				await seriesService.deleteSeries(seriesId);
				alert("Series deleted successfully.");
				fetchSeries(searchTerm);
				fetchStats();
			} catch (error) {
				console.error("Failed to delete series:", error);
				alert("Failed to delete series: " + (error.error || error.message || "Unknown error"));
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
							<h1>Series Management</h1>
							<p>Manage all web series information</p>
						</div>
					</div>
					{permissions.canCreateSeries && (
						<button className="btn btn-primary" onClick={openCreateModal}>
							<AddIcon /> Create Series
						</button>
					)}
				</div>

				<div className="admin-content">
					<div className="admin-stats">
						<div className="stat-box">
							<h3>{stats.total}</h3>
							<p>Total Series</p>
						</div>
						<div className="stat-box">
							<h3>{stats.this_month}</h3>
							<p>New This Month</p>
						</div>
						<div className="stat-box">
							<h3>{stats.total_episodes}</h3>
							<p>Total Episodes</p>
						</div>
					</div>

					<div className="admin-table-container">
						<div className="table-header">
							<h2>Series List</h2>
							<div className="search-container">
								<input type="text" placeholder="Search series..." className="search-input" value={searchTerm} onChange={handleSearchInputChange} onKeyPress={handleSearchKeyPress} />
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

						{series.length > 0 ? (
							<table className="admin-table">
								<thead>
									<tr>
										<th>Series ID</th>
										<th>Title</th>
										<th>Type</th>
										<th>Episodes</th>
										<th>Rating</th>
										{(permissions.canEditSeries || permissions.canDeleteSeries) && <th>Actions</th>}
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
														<button className="btn-icon" title="Edit" onClick={() => openEditModal(item)}>
															<EditIcon />
														</button>
													)}
													{permissions.canDeleteSeries && (
														<button className="btn-icon" title="Delete" onClick={() => handleDeleteSeries(item.webseries_id)} style={{ color: "#f44336" }}>
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
								<p>No series data available</p>
								{permissions.canCreateSeries && (
									<button className="btn btn-primary" onClick={openCreateModal}>
										Create the first series
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
									<h2>{modalMode === "create" ? "Create" : "Edit"} Series</h2>
									<button className="btn-icon" onClick={closeModal}>
										<CloseIcon />
									</button>
								</div>

								<form onSubmit={handleSubmit} className="modal-form">
									<div className="form-group">
										<label>Series Title *</label>
										<input type="text" name="title" value={formData.title || ""} onChange={handleFormChange} required placeholder="Enter series title" />
									</div>
									<div className="form-group">
										<label>Type *</label>
										<select name="type" value={formData.type || ""} onChange={handleFormChange} required>
											<option value="">Please select a type</option>
											<option value="Drama">Drama</option>
											<option value="Comedy">Comedy</option>
											<option value="Action">Action</option>
											<option value="Sci-Fi">Sci-Fi</option>
											<option value="Horror">Horror</option>
											<option value="Romance">Romance</option>
											<option value="Thriller">Thriller</option>
											<option value="Documentary">Documentary</option>
										</select>
									</div>
									<div className="form-group">
										<label>Production House *</label>
										<select name="house_id" value={formData.house_id || ""} onChange={handleFormChange} required>
											<option value="">Please select a production house</option>
											{productionHouses.map((house) => (
												<option key={house.house_id} value={house.house_id}>
													{house.name}
												</option>
											))}
										</select>
									</div>
									<div className="form-group">
										<label>Number of Episodes</label>
										<input type="number" name="num_episodes" value={formData.num_episodes || ""} onChange={handleFormChange} min="0" placeholder="0" />
									</div>

									<div className="modal-actions">
										<button type="button" className="btn btn-secondary" onClick={closeModal}>
											Cancel
										</button>
										<button type="submit" className="btn btn-primary">
											{modalMode === "create" ? "Create" : "Save"}
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
