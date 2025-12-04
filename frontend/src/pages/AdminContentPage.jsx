import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import MovieIcon from "@mui/icons-material/Movie";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import FeedbackIcon from "@mui/icons-material/Feedback";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import TvIcon from "@mui/icons-material/Tv";
import DescriptionIcon from "@mui/icons-material/Description";
import LanguageIcon from "@mui/icons-material/Language";
import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import "./AdminPages.css";
import * as contentService from "../services/contentService";
import seriesService from "../services/seriesService";

const AdminContentPage = () => {
	const { permissions } = usePermissions();
	const [activeTab, setActiveTab] = useState("episodes");
	const [loading, setLoading] = useState(false);

	// Episodes
	const [episodes, setEpisodes] = useState([]);
	const [seriesList, setSeriesList] = useState([]); // For episode form
	const [episodeSearch, setEpisodeSearch] = useState("");
	// Production Houses
	const [productionHouses, setProductionHouses] = useState([]);
	const [productionHouseSearch, setProductionHouseSearch] = useState("");
	// Producers
	const [producers, setProducers] = useState([]);
	const [producerSearch, setProducerSearch] = useState("");
	// Feedback
	const [feedback, setFeedback] = useState([]);
	const [feedbackSearch, setFeedbackSearch] = useState("");
	// Relations - Affiliations
	const [affiliations, setAffiliations] = useState([]);
	// Relations - Telecasts
	const [telecasts, setTelecasts] = useState([]);
	const [episodesList, setEpisodesList] = useState([]);
	// Relations - Contracts
	const [contracts, setContracts] = useState([]);
	// Relations - Subtitle Languages
	const [subtitleLanguages, setSubtitleLanguages] = useState([]);
	// Relations - Releases
	const [releases, setReleases] = useState([]);

	// Modal state
	const [showModal, setShowModal] = useState(false);
	const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
	const [currentItem, setCurrentItem] = useState(null);
	const [formData, setFormData] = useState({});

	useEffect(() => {
		if (activeTab === "episodes") {
			fetchEpisodes(episodeSearch);
			fetchSeriesList();
		} else if (activeTab === "production") {
			fetchProductionHouses(productionHouseSearch);
		} else if (activeTab === "producers") {
			fetchProducers(producerSearch);
			if (productionHouses.length === 0) fetchProductionHouses();
		} else if (activeTab === "feedback") {
			fetchFeedback(feedbackSearch);
		} else if (activeTab === "affiliations") {
			fetchAffiliations();
			if (producers.length === 0) fetchProducers();
			if (productionHouses.length === 0) fetchProductionHouses();
		} else if (activeTab === "telecasts") {
			fetchTelecasts();
			if (episodesList.length === 0) fetchEpisodesList();
		} else if (activeTab === "contracts") {
			fetchContracts();
			if (seriesList.length === 0) fetchSeriesList();
		} else if (activeTab === "subtitles") {
			fetchSubtitleLanguages();
			if (seriesList.length === 0) fetchSeriesList();
		} else if (activeTab === "releases") {
			fetchReleases();
			if (seriesList.length === 0) fetchSeriesList();
		}
	}, [activeTab]);

	const fetchSeriesList = async () => {
		try {
			const data = await seriesService.getAllSeries({ per_page: 1000 });
			setSeriesList(data.series);
		} catch (error) {
			console.error("Failed to fetch series:", error);
		}
	};

	const fetchEpisodes = async (search = "") => {
		try {
			setLoading(true);
			const data = await contentService.getAllEpisodes({ per_page: 100, search });
			setEpisodes(data.episodes);
		} catch (error) {
			console.error("Failed to fetch episodes:", error);
			alert("获取集数列表失败");
		} finally {
			setLoading(false);
		}
	};

	const fetchProductionHouses = async (search = "") => {
		try {
			setLoading(true);
			const data = await contentService.getAllProductionHouses({ search });
			setProductionHouses(data.production_houses);
		} catch (error) {
			console.error("Failed to fetch production houses:", error);
			alert("获取制作公司列表失败");
		} finally {
			setLoading(false);
		}
	};

	const fetchProducers = async (search = "") => {
		try {
			setLoading(true);
			const data = await contentService.getAllProducers({ search });
			setProducers(data.producers);
		} catch (error) {
			console.error("Failed to fetch producers:", error);
			alert("获取制片人列表失败");
		} finally {
			setLoading(false);
		}
	};

	const fetchFeedback = async (search = "") => {
		try {
			setLoading(true);
			const data = await contentService.getAllFeedback({ search });
			setFeedback(data.feedback);
		} catch (error) {
			console.error("Failed to fetch feedback:", error);
			alert("获取反馈列表失败");
		} finally {
			setLoading(false);
		}
	};

	const fetchAffiliations = async () => {
		try {
			setLoading(true);
			const data = await contentService.getAllAffiliations();
			setAffiliations(data.affiliations || []);
		} catch (error) {
			console.error("Failed to fetch affiliations:", error);
			alert("获取制片人关联列表失败");
		} finally {
			setLoading(false);
		}
	};

	const fetchTelecasts = async () => {
		try {
			setLoading(true);
			const data = await contentService.getAllTelecasts();
			setTelecasts(data.telecasts || []);
		} catch (error) {
			console.error("Failed to fetch telecasts:", error);
			alert("获取播出记录列表失败");
		} finally {
			setLoading(false);
		}
	};

	const fetchEpisodesList = async () => {
		try {
			const data = await contentService.getAllEpisodes({ per_page: 1000 });
			setEpisodesList(data.episodes || []);
		} catch (error) {
			console.error("Failed to fetch episodes list:", error);
		}
	};

	const fetchContracts = async () => {
		try {
			setLoading(true);
			const data = await contentService.getAllContracts();
			setContracts(data.contracts || []);
		} catch (error) {
			console.error("Failed to fetch contracts:", error);
			alert("获取合同列表失败");
		} finally {
			setLoading(false);
		}
	};

	const fetchSubtitleLanguages = async () => {
		try {
			setLoading(true);
			const data = await contentService.getAllSubtitleLanguages();
			setSubtitleLanguages(data.subtitle_languages || []);
		} catch (error) {
			console.error("Failed to fetch subtitle languages:", error);
			alert("获取字幕语言列表失败");
		} finally {
			setLoading(false);
		}
	};

	const fetchReleases = async () => {
		try {
			setLoading(true);
			const data = await contentService.getAllReleases();
			setReleases(data.releases || []);
		} catch (error) {
			console.error("Failed to fetch releases:", error);
			alert("获取发行记录列表失败");
		} finally {
			setLoading(false);
		}
	};

	// Modal handlers
	const openCreateModal = () => {
		setModalMode("create");
		setCurrentItem(null);
		setFormData({});
		setShowModal(true);
	};

	const openEditModal = (item) => {
		setModalMode("edit");
		setCurrentItem(item);
		setFormData({ ...item });
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setCurrentItem(null);
		setFormData({});
	};

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (activeTab === "episodes") {
				if (modalMode === "create") {
					await contentService.createEpisode(formData);
					alert("集数创建成功");
				} else {
					await contentService.updateEpisode(currentItem.episode_id, formData);
					alert("集数更新成功");
				}
				fetchEpisodes();
			} else if (activeTab === "production") {
				if (modalMode === "create") {
					await contentService.createProductionHouse(formData);
					alert("制作公司创建成功");
				} else {
					await contentService.updateProductionHouse(currentItem.house_id, formData);
					alert("制作公司更新成功");
				}
				fetchProductionHouses();
			} else if (activeTab === "producers") {
				if (modalMode === "create") {
					await contentService.createProducer(formData);
					alert("制片人创建成功");
				} else {
					await contentService.updateProducer(currentItem.producer_id, formData);
					alert("制片人更新成功");
				}
				fetchProducers(producerSearch);
			} else if (activeTab === "affiliations") {
				if (modalMode === "create") {
					await contentService.createAffiliation(formData);
					alert("制片人关联创建成功");
				}
				fetchAffiliations();
			} else if (activeTab === "telecasts") {
				if (modalMode === "create") {
					await contentService.createTelecast(formData);
					alert("播出记录创建成功");
				} else {
					await contentService.updateTelecast(currentItem.telecast_id, formData);
					alert("播出记录更新成功");
				}
				fetchTelecasts();
			} else if (activeTab === "contracts") {
				if (modalMode === "create") {
					await contentService.createContract(formData);
					alert("合同创建成功");
				} else {
					await contentService.updateContract(currentItem.contract_id, formData);
					alert("合同更新成功");
				}
				fetchContracts();
			} else if (activeTab === "subtitles") {
				if (modalMode === "create") {
					await contentService.createSubtitleLanguage(formData);
					alert("字幕语言添加成功");
				}
				fetchSubtitleLanguages();
			} else if (activeTab === "releases") {
				if (modalMode === "create") {
					await contentService.createRelease(formData);
					alert("发行记录创建成功");
				} else {
					await contentService.updateRelease(currentItem.webseries_id, currentItem.country_name, formData);
					alert("发行记录更新成功");
				}
				fetchReleases();
			}
			closeModal();
		} catch (error) {
			console.error("Failed to save:", error);
			alert("操作失败: " + (error.error || error.message || "未知错误"));
		}
	};

	const handleDeleteEpisode = async (episodeId) => {
		if (window.confirm("确定要删除该集数吗？")) {
			try {
				await contentService.deleteEpisode(episodeId);
				alert("删除成功");
				fetchEpisodes();
			} catch (error) {
				console.error("Failed to delete episode:", error);
				alert("删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleDeleteProductionHouse = async (houseId) => {
		if (window.confirm("确定要删除该制作公司吗？这将影响相关的剧集。")) {
			try {
				await contentService.deleteProductionHouse(houseId);
				alert("删除成功");
				fetchProductionHouses();
			} catch (error) {
				console.error("Failed to delete production house:", error);
				alert("删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleDeleteProducer = async (producerId) => {
		if (window.confirm("确定要删除该制片人吗？")) {
			try {
				await contentService.deleteProducer(producerId);
				alert("删除成功");
				fetchProducers(producerSearch);
			} catch (error) {
				console.error("Failed to delete producer:", error);
				alert("删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleDeleteFeedback = async (feedbackId) => {
		if (window.confirm("确定要删除该反馈吗？")) {
			try {
				await contentService.deleteFeedback(feedbackId);
				alert("删除成功");
				fetchFeedback();
			} catch (error) {
				console.error("Failed to delete feedback:", error);
				alert("删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleEpisodeSearchInputChange = (e) => {
		setEpisodeSearch(e.target.value);
	};

	const handleEpisodeSearchClick = () => {
		fetchEpisodes(episodeSearch);
	};

	const handleEpisodeSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchEpisodes(episodeSearch);
		}
	};

	const handleProductionHouseSearchInputChange = (e) => {
		setProductionHouseSearch(e.target.value);
	};

	const handleProductionHouseSearchClick = () => {
		fetchProductionHouses(productionHouseSearch);
	};

	const handleProductionHouseSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchProductionHouses(productionHouseSearch);
		}
	};

	const handleProducerSearchInputChange = (e) => {
		setProducerSearch(e.target.value);
	};

	const handleProducerSearchClick = () => {
		fetchProducers(producerSearch);
	};

	const handleProducerSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchProducers(producerSearch);
		}
	};

	const handleFeedbackSearchInputChange = (e) => {
		setFeedbackSearch(e.target.value);
	};

	const handleFeedbackSearchClick = () => {
		fetchFeedback(feedbackSearch);
	};

	const handleFeedbackSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchFeedback(feedbackSearch);
		}
	};

	const handleDeleteAffiliation = async (item) => {
		if (window.confirm("确定要删除该制片人关联吗？")) {
			try {
				await contentService.deleteAffiliation(item.producer_id, item.house_id);
				alert("删除成功");
				fetchAffiliations();
			} catch (error) {
				console.error("Failed to delete affiliation:", error);
				alert("删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleDeleteTelecast = async (telecastId) => {
		if (window.confirm("确定要删除该播出记录吗？")) {
			try {
				await contentService.deleteTelecast(telecastId);
				alert("删除成功");
				fetchTelecasts();
			} catch (error) {
				console.error("Failed to delete telecast:", error);
				alert("删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleDeleteContract = async (contractId) => {
		if (window.confirm("确定要删除该合同吗？")) {
			try {
				await contentService.deleteContract(contractId);
				alert("删除成功");
				fetchContracts();
			} catch (error) {
				console.error("Failed to delete contract:", error);
				alert("删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleDeleteSubtitleLanguage = async (item) => {
		if (window.confirm("确定要删除该字幕语言吗？")) {
			try {
				await contentService.deleteSubtitleLanguage(item.webseries_id, item.language);
				alert("删除成功");
				fetchSubtitleLanguages();
			} catch (error) {
				console.error("Failed to delete subtitle language:", error);
				alert("删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	const handleDeleteRelease = async (item) => {
		if (window.confirm("确定要删除该发行记录吗？")) {
			try {
				await contentService.deleteRelease(item.webseries_id, item.country_name);
				alert("删除成功");
				fetchReleases();
			} catch (error) {
				console.error("Failed to delete release:", error);
				alert("删除失败: " + (error.error || error.message || "未知错误"));
			}
		}
	};

	if (!permissions.canAccessAdmin) {
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
						<MovieIcon style={{ fontSize: 40 }} />
						<div>
							<h1>内容管理</h1>
							<p>管理集数、制作公司、制片人、反馈和关系数据</p>
						</div>
					</div>
				</div>

				<div className="admin-content">
					<div className="admin-tabs">
						<button className={`tab-button ${activeTab === "episodes" ? "active" : ""}`} onClick={() => setActiveTab("episodes")}>
							<LiveTvIcon /> 集数管理
						</button>
						<button className={`tab-button ${activeTab === "production" ? "active" : ""}`} onClick={() => setActiveTab("production")}>
							<BusinessIcon /> 制作公司
						</button>
						<button className={`tab-button ${activeTab === "producers" ? "active" : ""}`} onClick={() => setActiveTab("producers")}>
							<PersonIcon /> 制片人
						</button>
						<button className={`tab-button ${activeTab === "feedback" ? "active" : ""}`} onClick={() => setActiveTab("feedback")}>
							<FeedbackIcon /> 反馈管理
						</button>
						<button className={`tab-button ${activeTab === "affiliations" ? "active" : ""}`} onClick={() => setActiveTab("affiliations")}>
							<LinkIcon /> 制片人关联
						</button>
						<button className={`tab-button ${activeTab === "telecasts" ? "active" : ""}`} onClick={() => setActiveTab("telecasts")}>
							<TvIcon /> 播出记录
						</button>
						<button className={`tab-button ${activeTab === "contracts" ? "active" : ""}`} onClick={() => setActiveTab("contracts")}>
							<DescriptionIcon /> 合同管理
						</button>
						<button className={`tab-button ${activeTab === "subtitles" ? "active" : ""}`} onClick={() => setActiveTab("subtitles")}>
							<LanguageIcon /> 字幕语言
						</button>
						<button className={`tab-button ${activeTab === "releases" ? "active" : ""}`} onClick={() => setActiveTab("releases")}>
							<PublicIcon /> 发行记录
						</button>
					</div>

					{loading && (
						<div className="loading-state">
							<p>加载中...</p>
						</div>
					)}

					{/* Episodes Tab */}
					{activeTab === "episodes" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>集数列表（共 {episodes.length} 集）</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="搜索集数..." className="search-input" value={episodeSearch} onChange={handleEpisodeSearchInputChange} onKeyPress={handleEpisodeSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleEpisodeSearchClick}>
											<SearchIcon /> 搜索
										</button>
									</div>
									{permissions.canCreateEpisode && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> 新增集数
										</button>
									)}
								</div>
							</div>

							{episodes.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>集数ID</th>
											<th>集数编号</th>
											<th>标题</th>
											<th>剧集ID</th>
											<th>时长（分钟）</th>
											<th>发布日期</th>
											{(permissions.canEditEpisode || permissions.canDeleteEpisode) && <th>操作</th>}
										</tr>
									</thead>
									<tbody>
										{episodes.map((ep) => (
											<tr key={ep.episode_id}>
												<td>{ep.episode_id}</td>
												<td>第 {ep.episode_number} 集</td>
												<td>{ep.title || "-"}</td>
												<td>{ep.webseries_id}</td>
												<td>{ep.duration_minutes || "-"}</td>
												<td>{ep.release_date || "-"}</td>
												{(permissions.canEditEpisode || permissions.canDeleteEpisode) && (
													<td className="action-buttons">
														{permissions.canEditEpisode && (
															<button className="btn-icon" title="编辑" onClick={() => openEditModal(ep)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteEpisode && (
															<button className="btn-icon" title="删除" onClick={() => handleDeleteEpisode(ep.episode_id)} style={{ color: "#f44336" }}>
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
									<LiveTvIcon style={{ fontSize: 64, opacity: 0.3 }} />
									<p>暂无集数数据</p>
								</div>
							)}
						</div>
					)}

					{/* Production Houses Tab */}
					{activeTab === "production" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>制作公司列表（共 {productionHouses.length} 家）</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="搜索制作公司..." className="search-input" value={productionHouseSearch} onChange={handleProductionHouseSearchInputChange} onKeyPress={handleProductionHouseSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleProductionHouseSearchClick}>
											<SearchIcon /> 搜索
										</button>
									</div>
									{permissions.canCreateProductionHouse && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> 新增制作公司
										</button>
									)}
								</div>
							</div>

							{productionHouses.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>公司ID</th>
											<th>公司名称</th>
											<th>成立年份</th>
											<th>地址</th>
											<th>国籍</th>
											{(permissions.canEditProductionHouse || permissions.canDeleteProductionHouse) && <th>操作</th>}
										</tr>
									</thead>
									<tbody>
										{productionHouses.map((house) => (
											<tr key={house.house_id}>
												<td>{house.house_id}</td>
												<td>{house.name}</td>
												<td>{house.year_established}</td>
												<td>
													{house.city}, {house.state}
												</td>
												<td>{house.nationality}</td>
												{(permissions.canEditProductionHouse || permissions.canDeleteProductionHouse) && (
													<td className="action-buttons">
														{permissions.canEditProductionHouse && (
															<button className="btn-icon" title="编辑" onClick={() => openEditModal(house)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteProductionHouse && (
															<button className="btn-icon" title="删除" onClick={() => handleDeleteProductionHouse(house.house_id)} style={{ color: "#f44336" }}>
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
									<BusinessIcon style={{ fontSize: 64, opacity: 0.3 }} />
									<p>暂无制作公司数据</p>
								</div>
							)}
						</div>
					)}

					{/* Producers Tab */}
					{activeTab === "producers" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>制片人列表（共 {producers.length} 人）</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="搜索制片人..." className="search-input" value={producerSearch} onChange={handleProducerSearchInputChange} onKeyPress={handleProducerSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleProducerSearchClick}>
											<SearchIcon /> 搜索
										</button>
									</div>
									{permissions.canCreateProducer && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> 新增制片人
										</button>
									)}
								</div>
							</div>

							{producers.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>制片人ID</th>
											<th>姓名</th>
											<th>邮箱</th>
											<th>电话</th>
											<th>地址</th>
											<th>国籍</th>
											{(permissions.canEditProducer || permissions.canDeleteProducer) && <th>操作</th>}
										</tr>
									</thead>
									<tbody>
										{producers.map((producer) => (
											<tr key={producer.producer_id}>
												<td>{producer.producer_id}</td>
												<td>
													{producer.first_name} {producer.last_name}
												</td>
												<td>{producer.email}</td>
												<td>{producer.phone}</td>
												<td>
													{producer.city}, {producer.state}
												</td>
												<td>{producer.nationality}</td>
												{(permissions.canEditProducer || permissions.canDeleteProducer) && (
													<td className="action-buttons">
														{permissions.canEditProducer && (
															<button className="btn-icon" title="编辑" onClick={() => openEditModal(producer)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteProducer && (
															<button className="btn-icon" title="删除" onClick={() => handleDeleteProducer(producer.producer_id)} style={{ color: "#f44336" }}>
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
									<PersonIcon style={{ fontSize: 64, opacity: 0.3 }} />
									<p>暂无制片人数据</p>
								</div>
							)}
						</div>
					)}

					{/* Feedback Tab */}
					{activeTab === "feedback" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>用户反馈列表（共 {feedback.length} 条）</h2>
								<div className="search-container">
									<input type="text" placeholder="搜索反馈..." className="search-input" value={feedbackSearch} onChange={handleFeedbackSearchInputChange} onKeyPress={handleFeedbackSearchKeyPress} />
									<button className="btn btn-primary" onClick={handleFeedbackSearchClick}>
										<SearchIcon /> 搜索
									</button>
								</div>
							</div>

							{feedback.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>反馈ID</th>
											<th>评分</th>
											<th>反馈内容</th>
											<th>剧集ID</th>
											<th>用户ID</th>
											<th>日期</th>
											{permissions.canDeleteFeedback && <th>操作</th>}
										</tr>
									</thead>
									<tbody>
										{feedback.map((fb) => (
											<tr key={fb.feedback_id}>
												<td>{fb.feedback_id}</td>
												<td>
													<span style={{ color: "#ffd700" }}>{"★".repeat(fb.rating)}</span>
												</td>
												<td style={{ maxWidth: "300px" }}>{fb.feedback_text}</td>
												<td>{fb.webseries_id}</td>
												<td>{fb.account_id}</td>
												<td>{fb.feedback_date}</td>
												{permissions.canDeleteFeedback && (
													<td className="action-buttons">
														<button className="btn-icon" title="删除" onClick={() => handleDeleteFeedback(fb.feedback_id)} style={{ color: "#f44336" }}>
															<DeleteIcon />
														</button>
													</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<div className="empty-admin-state">
									<FeedbackIcon style={{ fontSize: 64, opacity: 0.3 }} />
									<p>暂无反馈数据</p>
								</div>
							)}
						</div>
					)}

					{/* Affiliations Tab */}
					{activeTab === "affiliations" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>制片人关联列表（共 {affiliations.length} 条）</h2>
								{permissions.canCreateProducer && (
									<button className="btn btn-primary" onClick={openCreateModal}>
										<AddIcon /> 新增关联
									</button>
								)}
							</div>

							{affiliations.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>制片人ID</th>
											<th>制片人姓名</th>
											<th>制作公司ID</th>
											<th>制作公司名称</th>
											<th>开始日期</th>
											<th>结束日期</th>
											{permissions.canDeleteProducer && <th>操作</th>}
										</tr>
									</thead>
									<tbody>
										{affiliations.map((item) => (
											<tr key={`${item.producer_id}-${item.house_id}`}>
												<td>{item.producer_id}</td>
												<td>{item.producer_name || "N/A"}</td>
												<td>{item.house_id}</td>
												<td>{item.house_name || "N/A"}</td>
												<td>{item.start_date}</td>
												<td>{item.end_date || "至今"}</td>
												{permissions.canDeleteProducer && (
													<td className="action-buttons">
														<button className="btn-icon" title="删除" onClick={() => handleDeleteAffiliation(item)} style={{ color: "#f44336" }}>
															<DeleteIcon />
														</button>
													</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<div className="empty-admin-state">
									<LinkIcon style={{ fontSize: 64, opacity: 0.3 }} />
									<p>暂无制片人关联数据</p>
								</div>
							)}
						</div>
					)}

					{/* Telecasts Tab */}
					{activeTab === "telecasts" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>播出记录列表（共 {telecasts.length} 条）</h2>
								{permissions.canCreateEpisode && (
									<button className="btn btn-primary" onClick={openCreateModal}>
										<AddIcon /> 新增播出记录
									</button>
								)}
							</div>

							{telecasts.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>播出ID</th>
											<th>集数ID</th>
											<th>剧集标题</th>
											<th>开始日期</th>
											<th>结束日期</th>
											<th>技术中断</th>
											{(permissions.canEditEpisode || permissions.canDeleteEpisode) && <th>操作</th>}
										</tr>
									</thead>
									<tbody>
										{telecasts.map((item) => (
											<tr key={item.telecast_id}>
												<td>{item.telecast_id}</td>
												<td>{item.episode_id}</td>
												<td>{item.series_title || "N/A"}</td>
												<td>{item.start_date}</td>
												<td>{item.end_date}</td>
												<td>{item.technical_interruptions === "Y" ? "是" : "否"}</td>
												{(permissions.canEditEpisode || permissions.canDeleteEpisode) && (
													<td className="action-buttons">
														{permissions.canEditEpisode && (
															<button className="btn-icon" title="编辑" onClick={() => openEditModal(item)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteEpisode && (
															<button className="btn-icon" title="删除" onClick={() => handleDeleteTelecast(item.telecast_id)} style={{ color: "#f44336" }}>
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
									<TvIcon style={{ fontSize: 64, opacity: 0.3 }} />
									<p>暂无播出记录数据</p>
								</div>
							)}
						</div>
					)}

					{/* Contracts Tab */}
					{activeTab === "contracts" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>合同列表（共 {contracts.length} 条）</h2>
								{permissions.canCreateSeries && (
									<button className="btn btn-primary" onClick={openCreateModal}>
										<AddIcon /> 新增合同
									</button>
								)}
							</div>

							{contracts.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>合同ID</th>
											<th>剧集ID</th>
											<th>剧集标题</th>
											<th>开始日期</th>
											<th>结束日期</th>
											<th>金额</th>
											<th>状态</th>
											{(permissions.canEditSeries || permissions.canDeleteSeries) && <th>操作</th>}
										</tr>
									</thead>
									<tbody>
										{contracts.map((item) => (
											<tr key={item.contract_id}>
												<td>{item.contract_id}</td>
												<td>{item.webseries_id}</td>
												<td>{item.series_title || "N/A"}</td>
												<td>{item.start_date}</td>
												<td>{item.end_date}</td>
												<td>${item.contract_amount ? item.contract_amount.toLocaleString() : "N/A"}</td>
												<td>
													<span className={`status-badge ${item.contract_status?.toLowerCase()}`}>{item.contract_status}</span>
												</td>
												{(permissions.canEditSeries || permissions.canDeleteSeries) && (
													<td className="action-buttons">
														{permissions.canEditSeries && (
															<button className="btn-icon" title="编辑" onClick={() => openEditModal(item)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteSeries && (
															<button className="btn-icon" title="删除" onClick={() => handleDeleteContract(item.contract_id)} style={{ color: "#f44336" }}>
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
									<DescriptionIcon style={{ fontSize: 64, opacity: 0.3 }} />
									<p>暂无合同数据</p>
								</div>
							)}
						</div>
					)}

					{/* Subtitle Languages Tab */}
					{activeTab === "subtitles" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>字幕语言列表（共 {subtitleLanguages.length} 条）</h2>
								{permissions.canCreateSeries && (
									<button className="btn btn-primary" onClick={openCreateModal}>
										<AddIcon /> 新增字幕语言
									</button>
								)}
							</div>

							{subtitleLanguages.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>剧集ID</th>
											<th>剧集标题</th>
											<th>语言</th>
											{permissions.canDeleteSeries && <th>操作</th>}
										</tr>
									</thead>
									<tbody>
										{subtitleLanguages.map((item) => (
											<tr key={`${item.webseries_id}-${item.language}`}>
												<td>{item.webseries_id}</td>
												<td>{item.series_title || "N/A"}</td>
												<td>{item.language}</td>
												{permissions.canDeleteSeries && (
													<td className="action-buttons">
														<button className="btn-icon" title="删除" onClick={() => handleDeleteSubtitleLanguage(item)} style={{ color: "#f44336" }}>
															<DeleteIcon />
														</button>
													</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<div className="empty-admin-state">
									<LanguageIcon style={{ fontSize: 64, opacity: 0.3 }} />
									<p>暂无字幕语言数据</p>
								</div>
							)}
						</div>
					)}

					{/* Releases Tab */}
					{activeTab === "releases" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>发行记录列表（共 {releases.length} 条）</h2>
								{permissions.canCreateSeries && (
									<button className="btn btn-primary" onClick={openCreateModal}>
										<AddIcon /> 新增发行记录
									</button>
								)}
							</div>

							{releases.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>剧集ID</th>
											<th>剧集标题</th>
											<th>国家</th>
											<th>发行日期</th>
											{(permissions.canEditSeries || permissions.canDeleteSeries) && <th>操作</th>}
										</tr>
									</thead>
									<tbody>
										{releases.map((item) => (
											<tr key={`${item.webseries_id}-${item.country_name}`}>
												<td>{item.webseries_id}</td>
												<td>{item.series_title || "N/A"}</td>
												<td>{item.country_name}</td>
												<td>{item.release_date}</td>
												{(permissions.canEditSeries || permissions.canDeleteSeries) && (
													<td className="action-buttons">
														{permissions.canEditSeries && (
															<button className="btn-icon" title="编辑" onClick={() => openEditModal(item)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteSeries && (
															<button className="btn-icon" title="删除" onClick={() => handleDeleteRelease(item)} style={{ color: "#f44336" }}>
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
									<PublicIcon style={{ fontSize: 64, opacity: 0.3 }} />
									<p>暂无发行记录数据</p>
								</div>
							)}
						</div>
					)}

					{/* Modal for Create/Edit */}
					{showModal && (
						<div className="modal-overlay" onClick={closeModal}>
							<div className="modal-content" onClick={(e) => e.stopPropagation()}>
								<div className="modal-header">
									<h2>
										{modalMode === "create" ? "新增" : "编辑"}
										{activeTab === "episodes" && "集数"}
										{activeTab === "production" && "制作公司"}
										{activeTab === "producers" && "制片人"}
										{activeTab === "affiliations" && "制片人关联"}
										{activeTab === "telecasts" && "播出记录"}
										{activeTab === "contracts" && "合同"}
										{activeTab === "subtitles" && "字幕语言"}
										{activeTab === "releases" && "发行记录"}
									</h2>
									<button className="btn-icon" onClick={closeModal}>
										<CloseIcon />
									</button>
								</div>

								<form onSubmit={handleSubmit} className="modal-form">
									{/* Episode Form */}
									{activeTab === "episodes" && (
										<>
											<div className="form-group">
												<label>集数编号 *</label>
												<input type="number" name="episode_number" value={formData.episode_number || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>标题</label>
												<input type="text" name="title" value={formData.title || ""} onChange={handleFormChange} />
											</div>
											<div className="form-group">
												<label>剧集 *</label>
												<select name="webseries_id" value={formData.webseries_id || ""} onChange={handleFormChange} required>
													<option value="">请选择剧集</option>
													{seriesList.map((series) => (
														<option key={series.webseries_id} value={series.webseries_id}>
															{series.title}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>时长（分钟）</label>
												<input type="number" name="duration_minutes" value={formData.duration_minutes || ""} onChange={handleFormChange} />
											</div>
											<div className="form-group">
												<label>发布日期</label>
												<input type="date" name="release_date" value={formData.release_date || ""} onChange={handleFormChange} />
											</div>
										</>
									)}

									{/* Production House Form */}
									{activeTab === "production" && (
										<>
											<div className="form-group">
												<label>公司名称 *</label>
												<input type="text" name="name" value={formData.name || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>成立年份 *</label>
												<input type="number" name="year_established" value={formData.year_established || ""} onChange={handleFormChange} required min="1800" max="2100" />
											</div>
											<div className="form-group">
												<label>街道地址 *</label>
												<input type="text" name="street" value={formData.street || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>城市 *</label>
												<input type="text" name="city" value={formData.city || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>州/省 *</label>
												<input type="text" name="state" value={formData.state || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>国籍 *</label>
												<input type="text" name="nationality" value={formData.nationality || ""} onChange={handleFormChange} required />
											</div>
										</>
									)}

									{/* Producer Form */}
									{activeTab === "producers" && (
										<>
											<div className="form-group">
												<label>名 *</label>
												<input type="text" name="first_name" value={formData.first_name || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>中间名</label>
												<input type="text" name="middle_name" value={formData.middle_name || ""} onChange={handleFormChange} />
											</div>
											<div className="form-group">
												<label>姓 *</label>
												<input type="text" name="last_name" value={formData.last_name || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>邮箱 *</label>
												<input type="email" name="email" value={formData.email || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>电话 *</label>
												<input type="tel" name="phone" value={formData.phone || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>街道地址 *</label>
												<input type="text" name="street" value={formData.street || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>城市 *</label>
												<input type="text" name="city" value={formData.city || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>州/省 *</label>
												<input type="text" name="state" value={formData.state || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>国籍 *</label>
												<input type="text" name="nationality" value={formData.nationality || ""} onChange={handleFormChange} required />
											</div>
										</>
									)}

									{/* Affiliation Form */}
									{activeTab === "affiliations" && (
										<>
											<div className="form-group">
												<label>制片人 *</label>
												<select name="producer_id" value={formData.producer_id || ""} onChange={handleFormChange} required>
													<option value="">请选择制片人</option>
													{producers.map((p) => (
														<option key={p.producer_id} value={p.producer_id}>
															{p.first_name} {p.last_name}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>制作公司 *</label>
												<select name="house_id" value={formData.house_id || ""} onChange={handleFormChange} required>
													<option value="">请选择制作公司</option>
													{productionHouses.map((h) => (
														<option key={h.house_id} value={h.house_id}>
															{h.name}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>开始日期 *</label>
												<input type="date" name="start_date" value={formData.start_date || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>结束日期</label>
												<input type="date" name="end_date" value={formData.end_date || ""} onChange={handleFormChange} />
											</div>
										</>
									)}

									{/* Telecast Form */}
									{activeTab === "telecasts" && (
										<>
											<div className="form-group">
												<label>集数 *</label>
												<select name="episode_id" value={formData.episode_id || ""} onChange={handleFormChange} required>
													<option value="">请选择集数</option>
													{episodesList.map((e) => (
														<option key={e.episode_id} value={e.episode_id}>
															{e.episode_id} - {e.title}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>开始日期 *</label>
												<input type="datetime-local" name="start_date" value={formData.start_date || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>结束日期 *</label>
												<input type="datetime-local" name="end_date" value={formData.end_date || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>技术中断</label>
												<select name="technical_interruptions" value={formData.technical_interruptions || "N"} onChange={handleFormChange}>
													<option value="N">否</option>
													<option value="Y">是</option>
												</select>
											</div>
										</>
									)}

									{/* Contract Form */}
									{activeTab === "contracts" && (
										<>
											<div className="form-group">
												<label>剧集 *</label>
												<select name="webseries_id" value={formData.webseries_id || ""} onChange={handleFormChange} required disabled={modalMode === "edit"}>
													<option value="">请选择剧集</option>
													{seriesList.map((s) => (
														<option key={s.webseries_id} value={s.webseries_id}>
															{s.title}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>开始日期 *</label>
												<input type="date" name="start_date" value={formData.start_date || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>结束日期 *</label>
												<input type="date" name="end_date" value={formData.end_date || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>金额 *</label>
												<input type="number" name="contract_amount" value={formData.contract_amount || ""} onChange={handleFormChange} min="0" step="0.01" required />
											</div>
											<div className="form-group">
												<label>状态 *</label>
												<select name="contract_status" value={formData.contract_status || ""} onChange={handleFormChange} required>
													<option value="">请选择状态</option>
													<option value="Active">Active</option>
													<option value="Expired">Expired</option>
													<option value="Terminated">Terminated</option>
													<option value="Pending">Pending</option>
												</select>
											</div>
										</>
									)}

									{/* Subtitle Language Form */}
									{activeTab === "subtitles" && (
										<>
											<div className="form-group">
												<label>剧集 *</label>
												<select name="webseries_id" value={formData.webseries_id || ""} onChange={handleFormChange} required>
													<option value="">请选择剧集</option>
													{seriesList.map((s) => (
														<option key={s.webseries_id} value={s.webseries_id}>
															{s.title}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>语言 *</label>
												<input type="text" name="language" value={formData.language || ""} onChange={handleFormChange} required placeholder="例如: English, 中文, Español" />
											</div>
										</>
									)}

									{/* Release Form */}
									{activeTab === "releases" && (
										<>
											<div className="form-group">
												<label>剧集 *</label>
												<select name="webseries_id" value={formData.webseries_id || ""} onChange={handleFormChange} required disabled={modalMode === "edit"}>
													<option value="">请选择剧集</option>
													{seriesList.map((s) => (
														<option key={s.webseries_id} value={s.webseries_id}>
															{s.title}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>国家 *</label>
												<input type="text" name="country_name" value={formData.country_name || ""} onChange={handleFormChange} required placeholder="国家名称" disabled={modalMode === "edit"} />
											</div>
											<div className="form-group">
												<label>发行日期 *</label>
												<input type="date" name="release_date" value={formData.release_date || ""} onChange={handleFormChange} required />
											</div>
										</>
									)}

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

export default AdminContentPage;
