import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllSeries } from "../store/slices/seriesSlice";
import Navbar from "../components/common/Navbar";
import Hero from "../components/common/Hero";
import SeriesRow from "../components/series/SeriesRow";
import "./HomePage.css";

const HomePage = () => {
	const dispatch = useDispatch();
	const { allSeries, loading } = useSelector((state) => state.series);

	useEffect(() => {
		dispatch(fetchAllSeries({ per_page: 20 }));
	}, [dispatch]);

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
						<SeriesRow title="Popular Series" series={allSeries} isLargeRow />
						{dramaSeriesList.length > 0 && <SeriesRow title="Drama" series={dramaSeriesList} />}
						{comedySeriesList.length > 0 && <SeriesRow title="Comedy" series={comedySeriesList} />}
						{actionSeriesList.length > 0 && <SeriesRow title="Action" series={actionSeriesList} />}
						{thrillerSeriesList.length > 0 && <SeriesRow title="Thriller" series={thrillerSeriesList} />}
					</div>
				</>
			)}

			<footer className="home-footer"></footer>
		</div>
	);
};

export default HomePage;
