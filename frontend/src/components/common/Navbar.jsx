import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import "./Navbar.css";

const Navbar = () => {
	const [show, setShow] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [showProfile, setShowProfile] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { isAuthenticated, user } = useSelector((state) => state.auth);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 100) {
				setShow(true);
			} else {
				setShow(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleLogout = () => {
		dispatch(logout());
		navigate("/");
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/search?q=${searchQuery}`);
			setShowSearch(false);
			setSearchQuery("");
		}
	};

	return (
		<nav className={`navbar ${show && "navbar-black"}`}>
			<div className="navbar-container">
				<div className="navbar-left">
					<Link to="/" className="navbar-logo">
						NEWS
					</Link>
					<ul className="navbar-menu">
						<li>
							<Link to="/">Main</Link>
						</li>
						<li>
							<Link to="/browse">Web Series</Link>
						</li>
						{isAuthenticated && (
							<>
								{(user?.account_type === "Employee" || user?.account_type === "Admin") && (
									<li>
										<Link to="/admin/content">Admin</Link>
									</li>
								)}
							</>
						)}
					</ul>
				</div>

				<div className="navbar-right">
					<div className="navbar-search">
						<SearchIcon className="navbar-icon" onClick={() => setShowSearch(!showSearch)} />
						{showSearch && (
							<form onSubmit={handleSearch} className="search-form">
								<input type="text" placeholder="Search Web Series..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
							</form>
						)}
					</div>

					{isAuthenticated ? (
						<>
							<NotificationsIcon className="navbar-icon" />
							<div className="navbar-profile" onMouseEnter={() => setShowProfile(true)} onMouseLeave={() => setShowProfile(false)}>
								<AccountCircleIcon className="navbar-icon" />
								<ArrowDropDownIcon className="navbar-icon-small" />
								{showProfile && (
									<div className="profile-dropdown">
										<div className="profile-info">
											<p className="profile-name">
												{user?.first_name} {user?.last_name}
											</p>
											<p className="profile-email">{user?.email}</p>
										</div>
										<div className="profile-links">
											<Link to="/dashboard">Dashboard</Link>
											<button onClick={handleLogout}>Logout</button>
										</div>
									</div>
								)}
							</div>
						</>
					) : (
						<Link to="/login" className="btn btn-primary navbar-login">
							Login
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
