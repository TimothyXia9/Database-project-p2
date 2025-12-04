import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSeriesById } from "../store/slices/seriesSlice";
import { fetchFeedbackBySeries, createFeedback, clearSubmitSuccess, clearError } from "../store/slices/feedbackSlice";
import Navbar from "../components/common/Navbar";
import usePermissions from "../hooks/usePermissions";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
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
			const errorMessage = typeof feedbackError === 'string'
				? feedbackError
				: feedbackError.message || JSON.stringify(feedbackError);
			alert(`提交失败: ${errorMessage}`);
			dispatch(clearError());
		}
	}, [feedbackError, dispatch]);

	const handleEditSeries = () => {
		navigate(`/admin/series/edit/${id}`);
	};

	const handleDeleteSeries = () => {
		if (window.confirm("确定要删除这部剧集吗？此操作无法撤销。")) {
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
			alert("请输入评论内容");
			return;
		}

		if (!id) {
			alert("剧集ID无效");
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
					<h1>未找到该剧集</h1>
					<button className="btn btn-primary" onClick={() => navigate("/browse")}>
						返回浏览
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
						<span className="detail-episodes">{currentSeries.num_episodes} 集</span>
						<div className="detail-rating">
							<StarIcon />
							<span>{currentSeries.rating || "暂无评分"}</span>
						</div>
					</div>
					<p className="detail-description">{currentSeries.description || "精彩的剧情，引人入胜的故事,为您带来前所未有的观看体验。"}</p>
					<div className="detail-actions">
						<button className="btn btn-primary detail-btn">
							<PlayArrowIcon /> 播放
						</button>
						<button className="btn-icon detail-btn-icon" title="添加到我的列表">
							<AddIcon />
						</button>
						{isLoggedIn && (
							<button className="btn-icon detail-btn-icon" title="点赞" onClick={() => setShowFeedbackForm(true)}>
								<ThumbUpIcon />
							</button>
						)}
						{permissions.canEditSeries && (
							<button className="btn-icon detail-btn-icon" title="编辑剧集" onClick={handleEditSeries}>
								<EditIcon />
							</button>
						)}
						{permissions.canDeleteSeries && (
							<button className="btn-icon detail-btn-icon" title="删除剧集" onClick={handleDeleteSeries} style={{ color: "#f44336" }}>
								<DeleteIcon />
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="detail-content">
				<div className="detail-tabs">
					<button className={`tab-btn ${selectedTab === "episodes" ? "active" : ""}`} onClick={() => setSelectedTab("episodes")}>
						剧集列表
					</button>
					<button className={`tab-btn ${selectedTab === "details" ? "active" : ""}`} onClick={() => setSelectedTab("details")}>
						详细信息
					</button>
					<button className={`tab-btn ${selectedTab === "reviews" ? "active" : ""}`} onClick={() => setSelectedTab("reviews")}>
						评论
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
											<h4 className="episode-title">{episode.title || `第 ${index + 1} 集`}</h4>
											<div className="episode-meta">
												<span className="episode-duration">{episode.duration_minutes || 45} 分钟</span>
												<span className="episode-id">ID: {episode.episode_id}</span>
											</div>
											<p className="episode-description">{episode.description || "暂无简介"}</p>
										</div>
									</div>
								))
							) : (
								<div className="empty-state">
									<p>暂无剧集信息</p>
								</div>
							)}
						</div>
					)}

					{selectedTab === "details" && (
						<div className="details-info">
							<div className="info-section">
								<h3>制作信息</h3>
								<div className="info-grid">
									<div className="info-item">
										<span className="info-label">制作公司:</span>
										<span className="info-value">{currentSeries.house_id || "未知"}</span>
									</div>
									<div className="info-item">
										<span className="info-label">类型:</span>
										<span className="info-value">{currentSeries.type}</span>
									</div>
									<div className="info-item">
										<span className="info-label">总集数:</span>
										<span className="info-value">{currentSeries.num_episodes}</span>
									</div>
									<div className="info-item">
										<span className="info-label">剧集ID:</span>
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
											写评论
										</button>
									) : (
										<form onSubmit={handleSubmitFeedback} className="feedback-form">
											<h3>为这部剧集评分</h3>
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
												<label>评论 (最多128字):</label>
												<textarea name="comments" value={feedbackData.comments} onChange={handleFeedbackChange} maxLength={128} placeholder="分享您的观看感受..." rows={4} required disabled={feedbackLoading} />
												<div className="character-count">{feedbackData.comments.length}/128</div>
											</div>
											<div className="form-actions">
												<button type="submit" className="btn btn-primary" disabled={feedbackLoading}>
													{feedbackLoading ? "提交中..." : "提交评论"}
												</button>
												<button type="button" className="btn btn-secondary" onClick={() => setShowFeedbackForm(false)} disabled={feedbackLoading}>
													取消
												</button>
											</div>
										</form>
									)}
								</div>
							)}
							{!isLoggedIn && (
								<div className="login-prompt">
									<p>请登录后提交评论</p>
									<button className="btn btn-primary" onClick={() => navigate("/login")}>
										登录
									</button>
								</div>
							)}
							<div className="reviews-list">
								{feedbackLoading ? (
									<div className="empty-state">
										<p>加载中...</p>
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
														编辑
													</button>
												</div>
											)}
										</div>
									))
								) : (
									<div className="empty-state">
										<p>暂无评论</p>
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
