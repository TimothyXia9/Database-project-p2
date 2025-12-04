import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSeries } from "../store/slices/seriesSlice";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import "./BrowsePage.css";

const BrowsePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allSeries, loading, pagination } = useSelector(
    (state) => state.series
  );

  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: 24,
    };

    if (filterType !== "all") {
      params.type = filterType;
    }

    dispatch(fetchAllSeries(params));
  }, [dispatch, filterType, currentPage]);

  const types = [
    { value: "all", label: "全部" },
    { value: "Drama", label: "剧情" },
    { value: "Comedy", label: "喜剧" },
    { value: "Action", label: "动作" },
    { value: "Thriller", label: "惊悚" },
    { value: "Sci-Fi", label: "科幻" },
    { value: "Romance", label: "爱情" },
  ];

  const handleSeriesClick = (seriesId) => {
    navigate(`/series/${seriesId}`);
  };

  return (
    <div className="browse-page">
      <Navbar />

      <div className="browse-container">
        <div className="browse-header">
          <h1 className="browse-title">浏览剧集</h1>
          <div className="browse-filters">
            {types.map((type) => (
              <button
                key={type.value}
                className={`filter-btn ${
                  filterType === type.value ? "active" : ""
                }`}
                onClick={() => {
                  setFilterType(type.value);
                  setCurrentPage(1);
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="browse-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="browse-grid">
              {allSeries.map((series) => (
                <div
                  key={series.webseries_id}
                  className="browse-card"
                  onClick={() => handleSeriesClick(series.webseries_id)}
                >
                  <div className="browse-card-content">
                    <div className="browse-card-header">
                      <h3 className="browse-card-title">{series.title}</h3>
                      <div className="browse-card-type-badge">{series.type}</div>
                    </div>
                    <div className="browse-card-meta">
                      <div className="browse-card-rating">
                        <StarIcon fontSize="small" />
                        <span>{series.rating || "暂无评分"}</span>
                      </div>
                      <span className="browse-card-episodes">{series.num_episodes} 集</span>
                    </div>
                    <p className="browse-card-id">ID: {series.webseries_id}</p>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="browse-pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </button>
                <span className="pagination-info">
                  第 {currentPage} 页，共 {pagination.pages} 页
                </span>
                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.pages, prev + 1)
                    )
                  }
                  disabled={currentPage === pagination.pages}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
