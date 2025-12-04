import React from "react";
import { useNavigate } from "react-router-dom";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import "./Hero.css";

const Hero = ({ series }) => {
  const navigate = useNavigate();

  if (!series) {
    return (
      <div className="hero-skeleton">
        <div className="spinner"></div>
      </div>
    );
  }

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
  };

  return (
    <header
      className="hero"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(20,20,20,1)),
                         url("https://source.unsplash.com/1600x900/?${encodeURIComponent(
                           series.title
                         )},drama")`,
      }}
    >
      <div className="hero-content">
        <h1 className="hero-title">{series.title}</h1>
        <div className="hero-info">
          <span className="hero-type">{series.type}</span>
          <span className="hero-episodes">{series.num_episodes} 集</span>
        </div>
        <p className="hero-description">
          {truncate(
            series.description ||
              "精彩的剧情，引人入胜的故事，为您带来前所未有的观看体验。立即开始观看这部备受好评的网络剧集。",
            200
          )}
        </p>
        <div className="hero-buttons">
          <button
            className="btn btn-primary hero-btn"
            onClick={() => navigate(`/series/${series.webseries_id}`)}
          >
            <PlayArrowIcon /> 播放
          </button>
          <button
            className="btn btn-secondary hero-btn"
            onClick={() => navigate(`/series/${series.webseries_id}`)}
          >
            <InfoOutlinedIcon /> 更多信息
          </button>
        </div>
      </div>
      <div className="hero-fade"></div>
    </header>
  );
};

export default Hero;
