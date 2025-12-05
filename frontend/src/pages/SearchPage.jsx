import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import seriesService from "../services/seriesService";
import StarIcon from "@mui/icons-material/Star";
import SearchIcon from "@mui/icons-material/Search";
import "./SearchPage.css";

const SearchPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const query = searchParams.get("q") || "";

	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		total: 0,
		pages: 0,
		current_page: 1,
	});
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		const searchSeries = async () => {
			if (!query.trim()) {
				setResults([]);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const params = {
					search: query,
					page: currentPage,
					per_page: 24,
				};

				const response = await seriesService.getAllSeries(params);

				setResults(response.series || []);
				setPagination({
					total: response.total || 0,
					pages: response.pages || 0,
					current_page: response.current_page || 1,
				});
			} catch (err) {
				setError("Failed to search series. Please try again.");
				console.error("Search error:", err);
			} finally {
				setLoading(false);
			}
		};

		searchSeries();
	}, [query, currentPage]);

	const handleSeriesClick = (seriesId) => {
		navigate(`/series/${seriesId}`);
	};

	return (
		<div className="search-page">
			<Navbar />

			<div className="search-container">
				<div className="search-header">
					<div className="search-title-row">
						<SearchIcon className="search-icon-large" />
						<h1 className="search-title">Search Results</h1>
					</div>

					{query && (
						<p className="search-query">
							Showing results for: <span className="search-query-text">"{query}"</span>
						</p>
					)}

					{!loading && results.length > 0 && (
						<p className="search-count">
							Found {pagination.total} result{pagination.total !== 1 ? "s" : ""}
						</p>
					)}
				</div>

				{!query.trim() ? (
					<div className="search-empty-state">
						<SearchIcon className="search-empty-icon" />
						<h2>Search for Web Series</h2>
						<p>Use the search bar above to find your favorite web series</p>
					</div>
				) : loading ? (
					<div className="search-loading">
						<div className="spinner"></div>
					</div>
				) : error ? (
					<div className="search-error">
						<p>{error}</p>
					</div>
				) : results.length === 0 ? (
					<div className="search-no-results">
						<SearchIcon className="search-empty-icon" />
						<h2>No results found</h2>
						<p>
							We couldn't find any series matching "<strong>{query}</strong>"
						</p>
						<p className="search-no-results-hint">Try different keywords or check your spelling</p>
					</div>
				) : (
					<>
						<div className="search-grid">
							{results.map((series) => (
								<div key={series.webseries_id} className="search-card" onClick={() => handleSeriesClick(series.webseries_id)}>
									<div className="search-card-content">
										<div className="search-card-header">
											<h3 className="search-card-title">{series.title}</h3>
											<div className="search-card-type-badge">{series.type}</div>
										</div>
										<div className="search-card-meta">
											<div className="search-card-rating">
												<StarIcon fontSize="small" />
												<span>{series.rating || "No Rating"}</span>
											</div>
											<span className="search-card-episodes">{series.num_episodes} Episodes</span>
										</div>
										<p className="search-card-id">ID: {series.webseries_id}</p>
									</div>
								</div>
							))}
						</div>

						{pagination.pages > 1 && (
							<div className="search-pagination">
								<button className="pagination-btn" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
									Previous
								</button>
								<span className="pagination-info">
									Page {currentPage} of {pagination.pages}
								</span>
								<button className="pagination-btn" onClick={() => setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))} disabled={currentPage === pagination.pages}>
									Next
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default SearchPage;
