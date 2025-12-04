import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSeriesById } from "../store/slices/seriesSlice";
import Navbar from "../components/common/Navbar";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import StarIcon from "@mui/icons-material/Star";
import "./SeriesDetailPage.css";

const SeriesDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentSeries, loading } = useSelector((state) => state.series);
  const [selectedTab, setSelectedTab] = useState("episodes");

  useEffect(() => {
    dispatch(fetchSeriesById(id));
  }, [dispatch, id]);

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

      <div
        className="detail-hero"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(20,20,20,1)),
                           url("https://source.unsplash.com/1600x900/?${encodeURIComponent(
                             currentSeries.title
                           )},drama")`,
        }}
      >
        <div className="detail-hero-content">
          <h1 className="detail-title">{currentSeries.title}</h1>
          <div className="detail-meta">
            <span className="detail-type">{currentSeries.type}</span>
            <span className="detail-episodes">
              {currentSeries.num_episodes} 集
            </span>
            <div className="detail-rating">
              <StarIcon />
              <span>{currentSeries.rating || "暂无评分"}</span>
            </div>
          </div>
          <p className="detail-description">
            {currentSeries.description ||
              "精彩的剧情，引人入胜的故事，为您带来前所未有的观看体验。"}
          </p>
          <div className="detail-actions">
            <button className="btn btn-primary detail-btn">
              <PlayArrowIcon /> 播放
            </button>
            <button className="btn-icon detail-btn-icon">
              <AddIcon />
            </button>
            <button className="btn-icon detail-btn-icon">
              <ThumbUpIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-tabs">
          <button
            className={`tab-btn ${selectedTab === "episodes" ? "active" : ""}`}
            onClick={() => setSelectedTab("episodes")}
          >
            剧集列表
          </button>
          <button
            className={`tab-btn ${selectedTab === "details" ? "active" : ""}`}
            onClick={() => setSelectedTab("details")}
          >
            详细信息
          </button>
          <button
            className={`tab-btn ${selectedTab === "reviews" ? "active" : ""}`}
            onClick={() => setSelectedTab("reviews")}
          >
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
                    <div className="episode-thumbnail">
                      <img
                        src={`https://source.unsplash.com/300x169/?${encodeURIComponent(
                          currentSeries.title
                        )},episode${index}`}
                        alt={episode.title}
                      />
                      <div className="episode-play">
                        <PlayArrowIcon />
                      </div>
                    </div>
                    <div className="episode-info">
                      <h4 className="episode-title">
                        {episode.title || `第 ${index + 1} 集`}
                      </h4>
                      <p className="episode-duration">
                        {episode.duration_minutes || 45} 分钟
                      </p>
                      <p className="episode-description">
                        {episode.description || "暂无简介"}
                      </p>
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
                    <span className="info-value">
                      {currentSeries.house_id || "未知"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">类型:</span>
                    <span className="info-value">{currentSeries.type}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">总集数:</span>
                    <span className="info-value">
                      {currentSeries.num_episodes}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">剧集ID:</span>
                    <span className="info-value">
                      {currentSeries.webseries_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === "reviews" && (
            <div className="reviews-section">
              <div className="empty-state">
                <p>暂无评论</p>
                <button className="btn btn-primary">写评论</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetailPage;
