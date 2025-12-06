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
	const [affiliationSearch, setAffiliationSearch] = useState("");
	// Relations - Telecasts
	const [telecasts, setTelecasts] = useState([]);
	const [telecastSearch, setTelecastSearch] = useState("");
	const [episodesList, setEpisodesList] = useState([]);
	// Relations - Contracts
	const [contracts, setContracts] = useState([]);
	const [contractSearch, setContractSearch] = useState("");
	// Relations - Subtitle Languages
	const [subtitleLanguages, setSubtitleLanguages] = useState([]);
	const [subtitleSearch, setSubtitleSearch] = useState("");
	// Relations - Releases
	const [releases, setReleases] = useState([]);
	const [releaseSearch, setReleaseSearch] = useState("");

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
			if (productionHouses.length === 0) fetchProductionHouses("");
		} else if (activeTab === "feedback") {
			fetchFeedback(feedbackSearch);
		} else if (activeTab === "affiliations") {
			fetchAffiliations();
			if (producers.length === 0) fetchProducers("");
			if (productionHouses.length === 0) fetchProductionHouses("");
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
			alert("Failed to fetch episodes");
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
			alert("Failed to fetch production houses");
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
			alert("Failed to fetch producers");
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
			alert("Failed to fetch feedback");
		} finally {
			setLoading(false);
		}
	};

	const fetchAffiliations = async (search = "") => {
		try {
			setLoading(true);
			const data = await contentService.getAllAffiliations({ search });
			setAffiliations(data.affiliations || []);
		} catch (error) {
			console.error("Failed to fetch affiliations:", error);
			alert("Failed to fetch affiliations");
		} finally {
			setLoading(false);
		}
	};

	const fetchTelecasts = async (search = "") => {
		try {
			setLoading(true);
			const data = await contentService.getAllTelecasts({ search });
			setTelecasts(data.telecasts || []);
		} catch (error) {
			console.error("Failed to fetch telecasts:", error);
			alert("Failed to fetch telecasts");
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

	const fetchContracts = async (search = "") => {
		try {
			setLoading(true);
			const data = await contentService.getAllContracts({ search });
			setContracts(data.contracts || []);
		} catch (error) {
			console.error("Failed to fetch contracts:", error);
			alert("Failed to fetch contracts");
		} finally {
			setLoading(false);
		}
	};

	const fetchSubtitleLanguages = async (search = "") => {
		try {
			setLoading(true);
			const data = await contentService.getAllSubtitleLanguages({ search });
			setSubtitleLanguages(data.subtitle_languages || []);
		} catch (error) {
			console.error("Failed to fetch subtitle languages:", error);
			alert("Failed to fetch subtitle languages");
		} finally {
			setLoading(false);
		}
	};

	const fetchReleases = async (search = "") => {
		try {
			setLoading(true);
			const data = await contentService.getAllReleases({ search });
			setReleases(data.releases || []);
		} catch (error) {
			console.error("Failed to fetch releases:", error);
			alert("Failed to fetch releases");
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
					alert("Episode created successfully");
				} else {
					await contentService.updateEpisode(currentItem.episode_id, formData);
					alert("Episode updated successfully");
				}
				fetchEpisodes(episodeSearch);
			} else if (activeTab === "production") {
				if (modalMode === "create") {
					await contentService.createProductionHouse(formData);
					alert("Production house created successfully");
				} else {
					await contentService.updateProductionHouse(currentItem.house_id, formData);
					alert("Production house updated successfully");
				}
				fetchProductionHouses(productionHouseSearch);
			} else if (activeTab === "producers") {
				if (modalMode === "create") {
					await contentService.createProducer(formData);
					alert("Producer created successfully");
				} else {
					await contentService.updateProducer(currentItem.producer_id, formData);
					alert("Producer updated successfully");
				}
				fetchProducers(producerSearch);
			} else if (activeTab === "affiliations") {
				if (modalMode === "create") {
					await contentService.createAffiliation(formData);
					alert("Affiliation created successfully");
				}
				fetchAffiliations();
			} else if (activeTab === "telecasts") {
				if (modalMode === "create") {
					await contentService.createTelecast(formData);
					alert("Telecast created successfully");
				} else {
					await contentService.updateTelecast(currentItem.telecast_id, formData);
					alert("Telecast updated successfully");
				}
				fetchTelecasts();
			} else if (activeTab === "contracts") {
				if (modalMode === "create") {
					await contentService.createContract(formData);
					alert("Contract created successfully");
				} else {
					await contentService.updateContract(currentItem.contract_id, formData);
					alert("Contract updated successfully");
				}
				fetchContracts();
			} else if (activeTab === "subtitles") {
				if (modalMode === "create") {
					await contentService.createSubtitleLanguage(formData);
					alert("Subtitle language added successfully");
				}
				fetchSubtitleLanguages();
			} else if (activeTab === "releases") {
				if (modalMode === "create") {
					await contentService.createRelease(formData);
					alert("Release created successfully");
				} else {
					await contentService.updateRelease(currentItem.webseries_id, currentItem.country_name, formData);
					alert("Release updated successfully");
				}
				fetchReleases();
			}
			closeModal();
		} catch (error) {
			console.error("Failed to save:", error);
			alert("Operation failed: " + (error.error || error.message || "Unknown error"));
		}
	};

	const handleDeleteEpisode = async (episodeId) => {
		if (window.confirm("Are you sure you want to delete this episode?")) {
			try {
				await contentService.deleteEpisode(episodeId);
				alert("Delete Successful.");
				fetchEpisodes(episodeSearch);
			} catch (error) {
				console.error("Failed to delete episode:", error);
				alert("Delete failed: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleDeleteProductionHouse = async (houseId) => {
		if (window.confirm("Are you sure you want to delete this production house? This will affect related series.")) {
			try {
				await contentService.deleteProductionHouse(houseId);
				alert("Delete Successful.");
				fetchProductionHouses(productionHouseSearch);
			} catch (error) {
				console.error("Failed to delete production house:", error);
				alert("Delete failed: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleDeleteProducer = async (producerId) => {
		if (window.confirm("Are you sure you want to delete this producer?")) {
			try {
				await contentService.deleteProducer(producerId);
				alert("Delete Successful.");
				fetchProducers(producerSearch);
			} catch (error) {
				console.error("Failed to delete producer:", error);
				alert("Delete failed: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleDeleteFeedback = async (feedbackId) => {
		if (window.confirm("Are you sure you want to delete this feedback?")) {
			try {
				await contentService.deleteFeedback(feedbackId);
				alert("Delete Successful.");
				fetchFeedback(feedbackSearch);
			} catch (error) {
				console.error("Failed to delete feedback:", error);
				alert("Delete failed: " + (error.error || error.message || "Unknown error"));
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
		if (window.confirm("Are you sure you want to delete this producer affiliation?")) {
			try {
				await contentService.deleteAffiliation(item.producer_id, item.house_id);
				alert("Delete Successful.");
				fetchAffiliations();
			} catch (error) {
				console.error("Failed to delete affiliation:", error);
				alert("Delete failed: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleDeleteTelecast = async (telecastId) => {
		if (window.confirm("Are you sure you want to delete this telecast record?")) {
			try {
				await contentService.deleteTelecast(telecastId);
				alert("Delete Successful.");
				fetchTelecasts();
			} catch (error) {
				console.error("Failed to delete telecast:", error);
				alert("Delete failed: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleDeleteContract = async (contractId) => {
		if (window.confirm("Are you sure you want to delete this contract?")) {
			try {
				await contentService.deleteContract(contractId);
				alert("Delete Successful.");
				fetchContracts();
			} catch (error) {
				console.error("Failed to delete contract:", error);
				alert("Delete failed: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleDeleteSubtitleLanguage = async (item) => {
		if (window.confirm("Are you sure you want to delete this subtitle language?")) {
			try {
				await contentService.deleteSubtitleLanguage(item.webseries_id, item.language);
				alert("Delete Successful.");
				fetchSubtitleLanguages();
			} catch (error) {
				console.error("Failed to delete subtitle language:", error);
				alert("Delete failed: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	const handleContractSearchInputChange = (e) => {
		setContractSearch(e.target.value);
	};

	const handleContractSearchClick = () => {
		fetchContracts(contractSearch);
	};

	const handleContractSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchContracts(contractSearch);
		}
	};

	const handleAffiliationSearchInputChange = (e) => {
		setAffiliationSearch(e.target.value);
	};

	const handleAffiliationSearchClick = () => {
		fetchAffiliations(affiliationSearch);
	};

	const handleAffiliationSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchAffiliations(affiliationSearch);
		}
	};

	const handleTelecastSearchInputChange = (e) => {
		setTelecastSearch(e.target.value);
	};

	const handleTelecastSearchClick = () => {
		fetchTelecasts(telecastSearch);
	};

	const handleTelecastSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchTelecasts(telecastSearch);
		}
	};

	const handleSubtitleSearchInputChange = (e) => {
		setSubtitleSearch(e.target.value);
	};

	const handleSubtitleSearchClick = () => {
		fetchSubtitleLanguages(subtitleSearch);
	};

	const handleSubtitleSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchSubtitleLanguages(subtitleSearch);
		}
	};

	const handleReleaseSearchInputChange = (e) => {
		setReleaseSearch(e.target.value);
	};

	const handleReleaseSearchClick = () => {
		fetchReleases(releaseSearch);
	};

	const handleReleaseSearchKeyPress = (e) => {
		if (e.key === "Enter") {
			fetchReleases(releaseSearch);
		}
	};

	const handleDeleteRelease = async (item) => {
		if (window.confirm("Are you sure you want to delete this release record?")) {
			try {
				await contentService.deleteRelease(item.webseries_id, item.country_name);
				alert("Delete successful");
				fetchReleases();
			} catch (error) {
				console.error("Failed to delete release:", error);
				alert("Delete failed: " + (error.error || error.message || "Unknown error"));
			}
		}
	};

	if (!permissions.canAccessAdmin) {
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
						<MovieIcon style={{ fontSize: 40 }} />
						<div>
							<h1>Content Management</h1>
							<p>Manage episodes, production houses, producers, feedback, and affiliations</p>
						</div>
					</div>
				</div>

				<div className="admin-content">
					<div className="admin-tabs">
						<button className={`tab-button ${activeTab === "episodes" ? "active" : ""}`} onClick={() => setActiveTab("episodes")}>
							<LiveTvIcon /> Episodes
						</button>
						<button className={`tab-button ${activeTab === "production" ? "active" : ""}`} onClick={() => setActiveTab("production")}>
							<BusinessIcon /> Production Houses
						</button>
						<button className={`tab-button ${activeTab === "producers" ? "active" : ""}`} onClick={() => setActiveTab("producers")}>
							<PersonIcon /> Producers
						</button>
						<button className={`tab-button ${activeTab === "feedback" ? "active" : ""}`} onClick={() => setActiveTab("feedback")}>
							<FeedbackIcon /> Feedback
						</button>
						<button className={`tab-button ${activeTab === "affiliations" ? "active" : ""}`} onClick={() => setActiveTab("affiliations")}>
							<LinkIcon /> Producer-Production House Affiliations
						</button>
						<button className={`tab-button ${activeTab === "telecasts" ? "active" : ""}`} onClick={() => setActiveTab("telecasts")}>
							<TvIcon /> Telecast Records
						</button>
						<button className={`tab-button ${activeTab === "contracts" ? "active" : ""}`} onClick={() => setActiveTab("contracts")}>
							<DescriptionIcon /> Contract
						</button>
						<button className={`tab-button ${activeTab === "subtitles" ? "active" : ""}`} onClick={() => setActiveTab("subtitles")}>
							<LanguageIcon /> Subtitle Languages
						</button>
						<button className={`tab-button ${activeTab === "releases" ? "active" : ""}`} onClick={() => setActiveTab("releases")}>
							<PublicIcon /> Release Records
						</button>
					</div>

					{loading && (
						<div className="loading-state">
							<p>Loading...</p>
						</div>
					)}

					{/* Episodes Tab */}
					{activeTab === "episodes" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>Episode List (Total {episodes.length})</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="Search Episodes..." className="search-input" value={episodeSearch} onChange={handleEpisodeSearchInputChange} onKeyPress={handleEpisodeSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleEpisodeSearchClick}>
											<SearchIcon /> Search
										</button>
									</div>
									{permissions.canCreateEpisode && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> Add Episode
										</button>
									)}
								</div>
							</div>

							{episodes.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>Episode ID</th>
											<th>Episode Number</th>
											<th>Title</th>
											<th>Webseries ID</th>
											<th>Duration (minutes)</th>
											<th>Release Date</th>
											{(permissions.canEditEpisode || permissions.canDeleteEpisode) && <th>Actions</th>}
										</tr>
									</thead>
									<tbody>
										{episodes.map((ep) => (
											<tr key={ep.episode_id}>
												<td>{ep.episode_id}</td>
												<td>Episode {ep.episode_number}</td>
												<td>{ep.title || "-"}</td>
												<td>{ep.webseries_id}</td>
												<td>{ep.duration_minutes || "-"}</td>
												<td>{ep.release_date || "-"}</td>
												{(permissions.canEditEpisode || permissions.canDeleteEpisode) && (
													<td className="action-buttons">
														{permissions.canEditEpisode && (
															<button className="btn-icon" title="Edit" onClick={() => openEditModal(ep)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteEpisode && (
															<button className="btn-icon" title="Delete" onClick={() => handleDeleteEpisode(ep.episode_id)} style={{ color: "#f44336" }}>
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
									<p>No Episode Data</p>
								</div>
							)}
						</div>
					)}

					{/* Production Houses Tab */}
					{activeTab === "production" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>Production House List (Total {productionHouses.length})</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="Search Production Houses..." className="search-input" value={productionHouseSearch} onChange={handleProductionHouseSearchInputChange} onKeyPress={handleProductionHouseSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleProductionHouseSearchClick}>
											<SearchIcon /> Search
										</button>
									</div>
									{permissions.canCreateProductionHouse && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> Add Production House
										</button>
									)}
								</div>
							</div>

							{productionHouses.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>Company ID</th>
											<th>Company Name</th>
											<th>Year Established</th>
											<th>Address</th>
											<th>Nationality</th>
											{(permissions.canEditProductionHouse || permissions.canDeleteProductionHouse) && <th>Actions</th>}
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
															<button className="btn-icon" title="Edit" onClick={() => openEditModal(house)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteProductionHouse && (
															<button className="btn-icon" title="Delete" onClick={() => handleDeleteProductionHouse(house.house_id)} style={{ color: "#f44336" }}>
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
									<p>No Production House Data</p>
								</div>
							)}
						</div>
					)}

					{/* Producers Tab */}
					{activeTab === "producers" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>Producer List (Total {producers.length})</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="Search Producers..." className="search-input" value={producerSearch} onChange={handleProducerSearchInputChange} onKeyPress={handleProducerSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleProducerSearchClick}>
											<SearchIcon /> Search
										</button>
									</div>
									{permissions.canCreateProducer && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> Add Producer
										</button>
									)}
								</div>
							</div>

							{producers.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>Producer ID</th>
											<th>Name</th>
											<th>Email</th>
											<th>Phone</th>
											<th>Address</th>
											<th>Nationality</th>
											{(permissions.canEditProducer || permissions.canDeleteProducer) && <th>Actions</th>}
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
															<button className="btn-icon" title="Edit" onClick={() => openEditModal(producer)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteProducer && (
															<button className="btn-icon" title="Delete" onClick={() => handleDeleteProducer(producer.producer_id)} style={{ color: "#f44336" }}>
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
									<p>No producer data available</p>
								</div>
							)}
						</div>
					)}

					{/* Feedback Tab */}
					{activeTab === "feedback" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>Total Feedback (Total {feedback.length})</h2>
								<div className="search-container">
									<input type="text" placeholder="Search Feedback..." className="search-input" value={feedbackSearch} onChange={handleFeedbackSearchInputChange} onKeyPress={handleFeedbackSearchKeyPress} />
									<button className="btn btn-primary" onClick={handleFeedbackSearchClick}>
										<SearchIcon /> Search
									</button>
								</div>
							</div>

							{feedback.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>Feedback ID</th>
											<th>Rating</th>
											<th>Feedback Text</th>
											<th>Webseries ID</th>
											<th>User ID</th>
											<th>Date</th>
											{permissions.canDeleteFeedback && <th>Actions</th>}
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
														<button className="btn-icon" title="Delete" onClick={() => handleDeleteFeedback(fb.feedback_id)} style={{ color: "#f44336" }}>
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
									<p>No feedback data available</p>
								</div>
							)}
						</div>
					)}

					{/* Affiliations Tab */}
					{activeTab === "affiliations" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>Producer Affiliations (Total {affiliations.length})</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="Search Affiliations..." className="search-input" value={affiliationSearch} onChange={handleAffiliationSearchInputChange} onKeyPress={handleAffiliationSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleAffiliationSearchClick}>
											<SearchIcon /> Search
										</button>
									</div>
									{permissions.canCreateProducer && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> Add Affiliation
										</button>
									)}
								</div>
							</div>

							{affiliations.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>Producer ID</th>
											<th>Producer Name</th>
											<th>Production House ID</th>
											<th>Production House Name</th>
											<th>Start Date</th>
											<th>End Date</th>
											{permissions.canDeleteProducer && <th>Actions</th>}
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
												<td>{item.end_date || "Present"}</td>
												{permissions.canDeleteProducer && (
													<td className="action-buttons">
														<button className="btn-icon" title="Delete" onClick={() => handleDeleteAffiliation(item)} style={{ color: "#f44336" }}>
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
									<p>No producer affiliation data available</p>
								</div>
							)}
						</div>
					)}

					{/* Telecasts Tab */}
					{activeTab === "telecasts" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>Telecast Records (Total {telecasts.length})</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="Search Telecast Records..." className="search-input" value={telecastSearch} onChange={handleTelecastSearchInputChange} onKeyPress={handleTelecastSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleTelecastSearchClick}>
											<SearchIcon /> Search
										</button>
									</div>
									{permissions.canCreateEpisode && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> Add Telecast Record
										</button>
									)}
								</div>
							</div>

							{telecasts.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>Telecast ID</th>
											<th>Episode ID</th>
											<th>Series Title</th>
											<th>Start Date</th>
											<th>End Date</th>
											<th>Technical Interruptions</th>
											{(permissions.canEditEpisode || permissions.canDeleteEpisode) && <th>Actions</th>}
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
												<td>{item.technical_interruptions === "Y" ? "Yes" : "No"}</td>
												{(permissions.canEditEpisode || permissions.canDeleteEpisode) && (
													<td className="action-buttons">
														{permissions.canEditEpisode && (
															<button className="btn-icon" title="Edit" onClick={() => openEditModal(item)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteEpisode && (
															<button className="btn-icon" title="Delete" onClick={() => handleDeleteTelecast(item.telecast_id)} style={{ color: "#f44336" }}>
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
									<p>No telecast record data available</p>
								</div>
							)}
						</div>
					)}

					{/* Contracts Tab */}
					{activeTab === "contracts" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>Contract List (Total {contracts.length})</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="Search Contracts..." className="search-input" value={contractSearch} onChange={handleContractSearchInputChange} onKeyPress={handleContractSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleContractSearchClick}>
											<SearchIcon /> Search
										</button>
									</div>
									{permissions.canCreateSeries && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> Add Contract
										</button>
									)}
								</div>
							</div>

							{contracts.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>Contract ID</th>
											<th>Episode ID</th>
											<th>Series Title</th>
											<th>Start Date</th>
											<th>End Date</th>
											<th>Amount</th>
											<th>Status</th>
											{(permissions.canEditSeries || permissions.canDeleteSeries) && <th>Actions</th>}
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
															<button className="btn-icon" title="Edit" onClick={() => openEditModal(item)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteSeries && (
															<button className="btn-icon" title="Delete" onClick={() => handleDeleteContract(item.contract_id)} style={{ color: "#f44336" }}>
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
									<p>No contract data available</p>
								</div>
							)}
						</div>
					)}

					{/* Subtitle Languages Tab */}
					{activeTab === "subtitles" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>Subtitle Language List (Total {subtitleLanguages.length})</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="Search Subtitle Languages..." className="search-input" value={subtitleSearch} onChange={handleSubtitleSearchInputChange} onKeyPress={handleSubtitleSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleSubtitleSearchClick}>
											<SearchIcon /> Search
										</button>
									</div>
									{permissions.canCreateSeries && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> Add Subtitle Language
										</button>
									)}
								</div>
							</div>

							{subtitleLanguages.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>Episode ID</th>
											<th>Series Title</th>
											<th>Language</th>
											{permissions.canDeleteSeries && <th>Actions</th>}
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
														<button className="btn-icon" title="Delete" onClick={() => handleDeleteSubtitleLanguage(item)} style={{ color: "#f44336" }}>
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
									<p>No subtitle language data available</p>
								</div>
							)}
						</div>
					)}

					{/* Releases Tab */}
					{activeTab === "releases" && !loading && (
						<div className="admin-table-container">
							<div className="table-header">
								<h2>Release List (Total {releases.length})</h2>
								<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
									<div className="search-container">
										<input type="text" placeholder="Search Releases..." className="search-input" value={releaseSearch} onChange={handleReleaseSearchInputChange} onKeyPress={handleReleaseSearchKeyPress} />
										<button className="btn btn-primary" onClick={handleReleaseSearchClick}>
											<SearchIcon /> Search
										</button>
									</div>
									{permissions.canCreateSeries && (
										<button className="btn btn-primary" onClick={openCreateModal}>
											<AddIcon /> Add Release
										</button>
									)}
								</div>
							</div>

							{releases.length > 0 ? (
								<table className="admin-table">
									<thead>
										<tr>
											<th>Episode ID</th>
											<th>Series Title</th>
											<th>Country</th>
											<th>Release Date</th>
											{(permissions.canEditSeries || permissions.canDeleteSeries) && <th>Actions</th>}
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
															<button className="btn-icon" title="Edit" onClick={() => openEditModal(item)}>
																<EditIcon />
															</button>
														)}
														{permissions.canDeleteSeries && (
															<button className="btn-icon" title="Delete" onClick={() => handleDeleteRelease(item)} style={{ color: "#f44336" }}>
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
									<p>No release data available</p>
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
										{modalMode === "create" ? "Add" : "Edit"}
										{activeTab === "episodes" && " Episode"}
										{activeTab === "production" && " Production House"}
										{activeTab === "producers" && " Producer"}
										{activeTab === "affiliations" && " Producer Affiliation"}
										{activeTab === "telecasts" && " Telecast"}
										{activeTab === "contracts" && " Contract"}
										{activeTab === "subtitles" && " Subtitle Language"}
										{activeTab === "releases" && " Release"}
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
												<label>Episode Number *</label>
												<input type="number" name="episode_number" value={formData.episode_number || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>Title</label>
												<input type="text" name="title" value={formData.title || ""} onChange={handleFormChange} />
											</div>
											<div className="form-group">
												<label>Series *</label>
												<select name="webseries_id" value={formData.webseries_id || ""} onChange={handleFormChange} required>
													<option value="">Please select a series</option>
													{seriesList.map((series) => (
														<option key={series.webseries_id} value={series.webseries_id}>
															{series.title}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>Duration (minutes)</label>
												<input type="number" name="duration_minutes" value={formData.duration_minutes || ""} onChange={handleFormChange} />
											</div>
											<div className="form-group">
												<label>Release Date</label>
												<input type="date" name="release_date" value={formData.release_date || ""} onChange={handleFormChange} />
											</div>
										</>
									)}

									{/* Production House Form */}
									{activeTab === "production" && (
										<>
											<div className="form-group">
												<label>Company Name *</label>
												<input type="text" name="name" value={formData.name || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>Year Established *</label>
												<input type="number" name="year_established" value={formData.year_established || ""} onChange={handleFormChange} required min="1800" max="2100" />
											</div>
											<div className="form-group">
												<label>Street Address *</label>
												<input type="text" name="street" value={formData.street || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>City *</label>
												<input type="text" name="city" value={formData.city || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>State/Province *</label>
												<input type="text" name="state" value={formData.state || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>Nationality *</label>
												<input type="text" name="nationality" value={formData.nationality || ""} onChange={handleFormChange} required />
											</div>
										</>
									)}

									{/* Producer Form */}
									{activeTab === "producers" && (
										<>
											<div className="form-group">
												<label>First Name *</label>
												<input type="text" name="first_name" value={formData.first_name || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>Middle Name</label>
												<input type="text" name="middle_name" value={formData.middle_name || ""} onChange={handleFormChange} />
											</div>
											<div className="form-group">
												<label>Last Name *</label>
												<input type="text" name="last_name" value={formData.last_name || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>Email *</label>
												<input type="email" name="email" value={formData.email || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>Phone *</label>
												<input type="tel" name="phone" value={formData.phone || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>Street Address *</label>
												<input type="text" name="street" value={formData.street || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>City *</label>
												<input type="text" name="city" value={formData.city || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>State/Province *</label>
												<input type="text" name="state" value={formData.state || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>Nationality *</label>
												<input type="text" name="nationality" value={formData.nationality || ""} onChange={handleFormChange} required />
											</div>
										</>
									)}

									{/* Affiliation Form */}
									{activeTab === "affiliations" && (
										<>
											<div className="form-group">
												<label>Producer *</label>
												<select name="producer_id" value={formData.producer_id || ""} onChange={handleFormChange} required>
													<option value="">Please select a producer</option>
													{producers.map((p) => (
														<option key={p.producer_id} value={p.producer_id}>
															{p.first_name} {p.last_name}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>Production House *</label>
												<select name="house_id" value={formData.house_id || ""} onChange={handleFormChange} required>
													<option value="">Please select a production house</option>
													{productionHouses.map((h) => (
														<option key={h.house_id} value={h.house_id}>
															{h.name}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>Start Date *</label>
												<input type="date" name="start_date" value={formData.start_date || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>End Date</label>
												<input type="date" name="end_date" value={formData.end_date || ""} onChange={handleFormChange} />
											</div>
										</>
									)}

									{/* Telecast Form */}
									{activeTab === "telecasts" && (
										<>
											<div className="form-group">
												<label>Episode Number *</label>
												<select name="episode_id" value={formData.episode_id || ""} onChange={handleFormChange} required>
													<option value="">Please select an episode</option>
													{episodesList.map((e) => (
														<option key={e.episode_id} value={e.episode_id}>
															{e.episode_id} - {e.title}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>Start Date *</label>
												<input type="datetime-local" name="start_date" value={formData.start_date || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>End Date *</label>
												<input type="datetime-local" name="end_date" value={formData.end_date || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>Technical Interruptions</label>
												<select name="technical_interruptions" value={formData.technical_interruptions || "N"} onChange={handleFormChange}>
													<option value="N">No</option>
													<option value="Y">Yes</option>
												</select>
											</div>
										</>
									)}

									{/* Contract Form */}
									{activeTab === "contracts" && (
										<>
											<div className="form-group">
												<label>Web Series *</label>
												<select name="webseries_id" value={formData.webseries_id || ""} onChange={handleFormChange} required disabled={modalMode === "edit"}>
													<option value="">Please select a web series</option>
													{seriesList.map((s) => (
														<option key={s.webseries_id} value={s.webseries_id}>
															{s.title}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>Start Date *</label>
												<input type="date" name="start_date" value={formData.start_date || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>End Date *</label>
												<input type="date" name="end_date" value={formData.end_date || ""} onChange={handleFormChange} required />
											</div>
											<div className="form-group">
												<label>Contract Amount *</label>
												<input type="number" name="contract_amount" value={formData.contract_amount || ""} onChange={handleFormChange} min="0" step="0.01" required />
											</div>
											<div className="form-group">
												<label>Status *</label>
												<select name="contract_status" value={formData.contract_status || ""} onChange={handleFormChange} required>
													<option value="">Please select a status</option>
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
												<label>Web Series *</label>
												<select name="webseries_id" value={formData.webseries_id || ""} onChange={handleFormChange} required>
													<option value="">Please select a web series</option>
													{seriesList.map((s) => (
														<option key={s.webseries_id} value={s.webseries_id}>
															{s.title}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>Language *</label>
												<input type="text" name="language" value={formData.language || ""} onChange={handleFormChange} required placeholder="e.g., English, 中文, Español" />
											</div>
										</>
									)}

									{/* Release Form */}
									{activeTab === "releases" && (
										<>
											<div className="form-group">
												<label>Web Series *</label>
												<select name="webseries_id" value={formData.webseries_id || ""} onChange={handleFormChange} required disabled={modalMode === "edit"}>
													<option value="">Please select a web series</option>
													{seriesList.map((s) => (
														<option key={s.webseries_id} value={s.webseries_id}>
															{s.title}
														</option>
													))}
												</select>
											</div>
											<div className="form-group">
												<label>Country *</label>
												<input type="text" name="country_name" value={formData.country_name || ""} onChange={handleFormChange} required placeholder="Country Name" disabled={modalMode === "edit"} />
											</div>
											<div className="form-group">
												<label>Release Date *</label>
												<input type="date" name="release_date" value={formData.release_date || ""} onChange={handleFormChange} required />
											</div>
										</>
									)}

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

export default AdminContentPage;
