import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllSeries } from "../store/slices/seriesSlice";
import Navbar from "../components/common/Navbar";
import Hero from "../components/common/Hero";
import SeriesRow from "../components/series/SeriesRow";
import "./HomePage.css";

const HomePage = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { allSeries, loading } = useSelector((state) => state.series);

	useEffect(() => {
		dispatch(fetchAllSeries({ per_page: 20 }));
	}, [dispatch]);

	// 模拟数据分类（实际应该从后端获取分类数据）
	const featuredSeries = allSeries.slice(0, 1)[0];
	const dramaSeriesList = allSeries.filter((s) => s.type === "Drama");
	const comedySeriesList = allSeries.filter((s) => s.type === "Comedy");
	const actionSeriesList = allSeries.filter((s) => s.type === "Action");
	const thrillerSeriesList = allSeries.filter((s) => s.type === "Thriller");

	return (
		<div className="home-page">
			<Navbar />

			{loading ? (
				<div className="loading-container">
					<div className="spinner"></div>
				</div>
			) : (
				<>
					<Hero series={featuredSeries} />

					<div className="home-content">
						<SeriesRow title="热门剧集" series={allSeries} isLargeRow />
						{dramaSeriesList.length > 0 && <SeriesRow title="剧情类" series={dramaSeriesList} />}
						{comedySeriesList.length > 0 && <SeriesRow title="喜剧类" series={comedySeriesList} />}
						{actionSeriesList.length > 0 && <SeriesRow title="动作类" series={actionSeriesList} />}
						{thrillerSeriesList.length > 0 && <SeriesRow title="惊悚类" series={thrillerSeriesList} />}
					</div>
				</>
			)}

			<footer className="home-footer"></footer>
		</div>
	);
};

export default HomePage;
