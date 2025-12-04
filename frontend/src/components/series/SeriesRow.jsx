import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarIcon from "@mui/icons-material/Star";
import "./SeriesRow.css";

const SeriesRow = ({ title, series, isLargeRow = false }) => {
	const navigate = useNavigate();
	const rowRef = useRef(null);
	const [scrollX, setScrollX] = useState(0);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(true);

	const handleScroll = (direction) => {
		const container = rowRef.current;
		if (!container) return;

		const scrollAmount = container.offsetWidth * 0.8;
		const newScrollX = direction === "left" ? Math.max(scrollX - scrollAmount, 0) : scrollX + scrollAmount;

		container.scrollTo({
			left: newScrollX,
			behavior: "smooth",
		});

		setScrollX(newScrollX);
		setShowLeftArrow(newScrollX > 0);
		setShowRightArrow(newScrollX < container.scrollWidth - container.offsetWidth);
	};

	const handleClick = (seriesId) => {
		navigate(`/series/${seriesId}`);
	};

	if (!series || series.length === 0) {
		return null;
	}

	return (
		<div className="series-row">
			<h2 className="series-row-title">{title}</h2>
			<div className="series-row-container">
				{showLeftArrow && (
					<button className="series-row-arrow series-row-arrow-left" onClick={() => handleScroll("left")}>
						<ChevronLeftIcon />
					</button>
				)}

				<div className="series-row-posters" ref={rowRef}>
					{series.map((item) => (
						<div key={item.webseries_id} className={`series-row-poster ${isLargeRow ? "series-row-poster-large" : ""}`} onClick={() => handleClick(item.webseries_id)}>
							<div className="series-row-poster-info">
								<h3 className="poster-title">{item.title}</h3>
								<span className="poster-type-badge">{item.type}</span>
								<div className="poster-meta">
									<div className="poster-rating">
										<StarIcon fontSize="small" />
										<span>{item.rating || "No Rating"}</span>
									</div>
									<p className="poster-episodes">{item.num_episodes} Episodes</p>
								</div>
							</div>
						</div>
					))}
				</div>

				{showRightArrow && (
					<button className="series-row-arrow series-row-arrow-right" onClick={() => handleScroll("right")}>
						<ChevronRightIcon />
					</button>
				)}
			</div>
		</div>
	);
};

export default SeriesRow;
