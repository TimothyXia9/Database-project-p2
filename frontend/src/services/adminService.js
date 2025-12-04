import api from "./api";

// ==================== User Management ====================

export const getAllUsers = async (params = {}) => {
	const { page = 1, per_page = 20, search = "", account_type = "", is_active = "" } = params;

	const response = await api.get("/admin/users", {
		params: { page, per_page, search, account_type, is_active },
	});
	return response.data;
};

export const getUser = async (accountId) => {
	const response = await api.get(`/admin/users/${accountId}`);
	return response.data;
};

export const changeUserRole = async (accountId, accountType) => {
	const response = await api.put(`/admin/users/${accountId}/role`, {
		account_type: accountType,
	});
	return response.data;
};

export const toggleUserStatus = async (accountId, isActive) => {
	const response = await api.put(`/admin/users/${accountId}/status`, {
		is_active: isActive,
	});
	return response.data;
};

export const deleteUser = async (accountId) => {
	const response = await api.delete(`/admin/users/${accountId}`);
	return response.data;
};

export const resetUserPassword = async (accountId, newPassword) => {
	const response = await api.post(`/admin/users/${accountId}/reset-password`, {
		new_password: newPassword,
	});
	return response.data;
};

// ==================== System Statistics ====================

export const getSystemStats = async () => {
	const response = await api.get("/admin/stats");
	return response.data;
};

// ==================== Country Management ====================

export const getAllCountries = async () => {
	const response = await api.get("/admin/countries");
	return response.data;
};

export const createCountry = async (countryName) => {
	const response = await api.post("/admin/countries", {
		country_name: countryName,
	});
	return response.data;
};

export const deleteCountry = async (countryName) => {
	const response = await api.delete(`/admin/countries/${countryName}`);
	return response.data;
};

// ==================== System Logs ====================

export const getSystemLogs = async () => {
	const response = await api.get("/admin/logs");
	return response.data;
};

// ==================== Database Maintenance ====================

export const vacuumDatabase = async () => {
	const response = await api.post("/admin/maintenance/vacuum");
	return response.data;
};

export const backupDatabase = async () => {
	const response = await api.post("/admin/maintenance/backup");
	return response.data;
};

// ==================== Entity Deletion (Admin only) ====================

export const deleteSeries = async (seriesId) => {
	const response = await api.delete(`/series/${seriesId}`);
	return response.data;
};

export const deleteEpisode = async (episodeId) => {
	const response = await api.delete(`/episodes/${episodeId}`);
	return response.data;
};

export const deleteProductionHouse = async (houseId) => {
	const response = await api.delete(`/production-houses/${houseId}`);
	return response.data;
};

export const deleteProducer = async (producerId) => {
	const response = await api.delete(`/producers/${producerId}`);
	return response.data;
};

export const deleteFeedback = async (feedbackId) => {
	const response = await api.delete(`/feedback/${feedbackId}`);
	return response.data;
};
