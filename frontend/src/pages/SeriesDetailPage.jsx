import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSeriesById } from "../store/slices/seriesSlice";
import { fetchFeedbackBySeries, createFeedback, clearSubmitSuccess, clearError } from "../store/slices/feedbackSlice";
import feedbackService from "../services/feedbackService";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StarIcon from "@mui/icons-material/Star";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import "./SeriesDetailPage.css";

const SeriesDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { currentSeries, loading } = useSelector((state) => state.series);
	const { feedbackList, loading: feedbackLoading, error: feedbackError, submitSuccess } = useSelector((state) => state.feedback);
	const { user } = useSelector((state) => state.auth);
	const { permissions, isLoggedIn } = usePermissions();
	const [selectedTab, setSelectedTab] = useState("episodes");
	const [showFeedbackForm, setShowFeedbackForm] = useState(false);
	const [feedbackData, setFeedbackData] = useState({
		rating: 5,
		comments: "",
	});

	useEffect(() => {
		dispatch(fetchSeriesById(id));
		dispatch(fetchFeedbackBySeries(id));
	}, [dispatch, id]);

	useEffect(() => {
		if (submitSuccess) {
			setShowFeedbackForm(false);
			setFeedbackData({ rating: 5, comments: "" });
			dispatch(clearSubmitSuccess());
			dispatch(fetchFeedbackBySeries(id));
		}
	}, [submitSuccess, dispatch, id]);

	useEffect(() => {
		if (feedbackError) {
			console.error("Feedback error:", feedbackError);
			const errorMessage = typeof feedbackError === "string" ? feedbackError : feedbackError.message || JSON.stringify(feedbackError);
			alert(`Fail to submit feedback: ${errorMessage}`);
			dispatch(clearError());
		}
	}, [feedbackError, dispatch]);

	const handleEditSeries = () => {
		navigate(`/admin/series/edit/${id}`);
	};

	const handleDeleteSeries = () => {
		if (window.confirm("Are you sure you want to delete this series? This action cannot be undone.")) {
			// TODO: Implement delete series API call
			console.log("Delete series:", id);
		}
	};

	const handleSubmitFeedback = (e) => {
		e.preventDefault();
		if (!isLoggedIn) {
			navigate("/login");
			return;
		}

		// Validate data before submission
		if (!feedbackData.comments.trim()) {
			alert("Please enter comments");
			return;
		}

		if (!id) {
			alert("Invalid series ID");
			return;
		}

		const submissionData = {
			webseries_id: id,
			rating: parseInt(feedbackData.rating),
			feedback_text: feedbackData.comments.trim(),
		};

		console.log("Submitting feedback:", submissionData);
		console.log("Current user:", user);
		console.log("JWT token exists:", !!localStorage.getItem("access_token"));

		dispatch(createFeedback(submissionData));
	};

	const handleFeedbackChange = (e) => {
		setFeedbackData({
			...feedbackData,
			[e.target.name]: e.target.value,
		});
	};

	const handleEditFeedback = (feedback) => {
		setFeedbackData({
			rating: feedback.rating,
			comments: feedback.feedback_text,
		});
		setShowFeedbackForm(true);
	};

	const handleDeleteFeedback = async (feedbackId) => {
		if (window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
			try {
				await feedbackService.deleteFeedback(feedbackId);
				alert("Review deleted successfully");
				dispatch(fetchFeedbackBySeries(id));
			} catch (error) {
				console.error("Failed to delete feedback:", error);
				const errorMessage = error.error || error.message || "Unknown error";
				alert(`Failed to delete review: ${errorMessage}`);
			}
		}
	};

	if (loading) {
		return (
			<div className="detail-loading">
				<Navbar />
				<div className="spinner"></div>
			</div>
		);
	}

	if (!currentSeries) {
		return (
			<div className="detail-error">
				<Navbar />
				<div className="error-content">
					<h1>Series Not Found</h1>
					<button className="btn btn-primary" onClick={() => navigate("/browse")}>
						Back to Browse
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="detail-page">
			<Navbar />

			<div className="detail-hero">
				<div className="detail-hero-content">
					<h1 className="detail-title">{currentSeries.title}</h1>
					<div className="detail-meta">
						<span className="detail-type">{currentSeries.type}</span>
						<span className="detail-episodes">{currentSeries.num_episodes} Episodes </span>
						<div className="detail-rating">
							<StarIcon />
							<span>{currentSeries.rating || "No Rating"}</span>
						</div>
					</div>
					<p className="detail-description">{currentSeries.description || "Great plot, exciting story, captivating narrative, bringing you an unprecedented viewing experience."}</p>
					<div className="detail-actions">
						<button className="btn btn-primary detail-btn">
							<PlayArrowIcon /> Play
						</button>

						{permissions.canEditSeries && (
							<button className="btn-icon detail-btn-icon" title="Edit Series" onClick={handleEditSeries}>
								<EditIcon />
							</button>
						)}
						{permissions.canDeleteSeries && (
							<button className="btn-icon detail-btn-icon" title="Delete Series" onClick={handleDeleteSeries} style={{ color: "#f44336" }}>
								<DeleteIcon />
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="detail-content">
				<div className="detail-tabs">
					<button className={`tab-btn ${selectedTab === "episodes" ? "active" : ""}`} onClick={() => setSelectedTab("episodes")}>
						Episodes
					</button>
					<button className={`tab-btn ${selectedTab === "details" ? "active" : ""}`} onClick={() => setSelectedTab("details")}>
						Details
					</button>
					<button className={`tab-btn ${selectedTab === "reviews" ? "active" : ""}`} onClick={() => setSelectedTab("reviews")}>
						Reviews
					</button>
				</div>

				<div className="detail-tab-content">
					{selectedTab === "episodes" && (
						<div className="episodes-list">
							{currentSeries.episodes && currentSeries.episodes.length > 0 ? (
								currentSeries.episodes.map((episode, index) => (
									<div key={episode.episode_id} className="episode-item">
										<div className="episode-number">{index + 1}</div>
										<div className="episode-info">
											<h4 className="episode-title">{episode.title || `Episode ${index + 1}`}</h4>
											<div className="episode-meta">
												<span className="episode-duration">{episode.duration_minutes || 45} minutes</span>
												<span className="episode-id">ID: {episode.episode_id}</span>
											</div>
											<p className="episode-description">{episode.description || "No description available"}</p>
										</div>
									</div>
								))
							) : (
								<div className="empty-state">
									<p>No episodes available</p>
								</div>
							)}
						</div>
					)}

					{selectedTab === "details" && (
						<div className="details-info">
							<div className="info-section">
								<h3>Production Information</h3>
								<div className="info-grid">
									<div className="info-item">
										<span className="info-label">Production Company:</span>
										<span className="info-value">{currentSeries.house_id || "Unknown"}</span>
									</div>
									<div className="info-item">
										<span className="info-label">Type:</span>
										<span className="info-value">{currentSeries.type}</span>
									</div>
									<div className="info-item">
										<span className="info-label">Total Episodes:</span>
										<span className="info-value">{currentSeries.num_episodes}</span>
									</div>
									<div className="info-item">
										<span className="info-label">Series ID:</span>
										<span className="info-value">{currentSeries.webseries_id}</span>
									</div>
								</div>
							</div>
						</div>
					)}

					{selectedTab === "reviews" && (
						<div className="reviews-section">
							{permissions.canSubmitFeedback && (
								<div className="feedback-submit-section">
									{!showFeedbackForm ? (
										<button className="btn btn-primary" onClick={() => setShowFeedbackForm(true)}>
											Write Review
										</button>
									) : (
										<form onSubmit={handleSubmitFeedback} className="feedback-form">
											<h3>Rate this Series</h3>
											<div className="rating-input">
												<label>评分 (1-5):</label>
												<div className="star-rating">
													{[1, 2, 3, 4, 5].map((star) => (
														<StarIcon
															key={star}
															className={`star ${star <= feedbackData.rating ? "active" : ""}`}
															onClick={() => !feedbackLoading && setFeedbackData({ ...feedbackData, rating: star })}
															style={{ cursor: feedbackLoading ? "not-allowed" : "pointer", fontSize: 32 }}
														/>
													))}
												</div>
											</div>
											<div className="comment-input">
												<label>Comments (max 128 characters):</label>
												<textarea name="comments" value={feedbackData.comments} onChange={handleFeedbackChange} maxLength={128} placeholder="Share your thoughts..." rows={4} required disabled={feedbackLoading} />
												<div className="character-count">{feedbackData.comments.length}/128</div>
											</div>
											<div className="form-actions">
												<button type="submit" className="btn btn-primary" disabled={feedbackLoading}>
													{feedbackLoading ? "Submitting..." : "Submit Review"}
												</button>
												<button type="button" className="btn btn-secondary" onClick={() => setShowFeedbackForm(false)} disabled={feedbackLoading}>
													Cancel
												</button>
											</div>
										</form>
									)}
								</div>
							)}
							{!isLoggedIn && (
								<div className="login-prompt">
									<p>Please log in to submit a review</p>
									<button className="btn btn-primary" onClick={() => navigate("/login")}>
										Log In
									</button>
								</div>
							)}
							<div className="reviews-list">
								{feedbackLoading ? (
									<div className="empty-state">
										<p>Loading...</p>
									</div>
								) : feedbackList && feedbackList.length > 0 ? (
									feedbackList.map((feedback) => (
										<div key={feedback.feedback_id} className="review-card">
											<div className="review-header">
												<div className="review-user">
													<div className="review-avatar">
														<AccountCircleIcon style={{ fontSize: 32 }} />
													</div>
													<div className="review-user-info">
														<h4>
															{feedback.viewer_account?.first_name} {feedback.viewer_account?.last_name}
														</h4>
														<p className="review-date">{new Date(feedback.feedback_date).toLocaleDateString("zh-CN")}</p>
													</div>
												</div>
												<div className="review-rating">
													{[...Array(5)].map((_, index) => (
														<StarIcon key={index} style={{ color: index < feedback.rating ? "#ffd700" : "#555" }} />
													))}
												</div>
											</div>
											<div className="review-content">
												<p className="review-comment">{feedback.feedback_text}</p>
											</div>
											{user && feedback.account_id === user.account_id && (
												<div className="review-actions">
													<button className="review-action-btn" onClick={() => handleEditFeedback(feedback)}>
														<EditIcon />
														Edit
													</button>
													<button className="review-action-btn review-action-delete" onClick={() => handleDeleteFeedback(feedback.feedback_id)}>
														<DeleteIcon />
														Delete
													</button>
												</div>
											)}
										</div>
									))
								) : (
									<div className="empty-state">
										<p>No Reviews Yet</p>
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

export default SeriesDetailPage;
