import api from "./api";

// ==================== Episodes ====================

export const getAllEpisodes = async (params = {}) => {
	const { page = 1, per_page = 20, webseries_id = "", search = "" } = params;
	const response = await api.get("/episodes", {
		params: { page, per_page, webseries_id, search },
	});
	return response.data;
};

export const getEpisode = async (episodeId) => {
	const response = await api.get(`/episodes/${episodeId}`);
	return response.data;
};

export const createEpisode = async (episodeData) => {
	const response = await api.post("/episodes", episodeData);
	return response.data;
};

export const updateEpisode = async (episodeId, episodeData) => {
	const response = await api.put(`/episodes/${episodeId}`, episodeData);
	return response.data;
};

export const deleteEpisode = async (episodeId) => {
	const response = await api.delete(`/episodes/${episodeId}`);
	return response.data;
};

// ==================== Production Houses ====================

export const getAllProductionHouses = async (params = {}) => {
	const { page = 1, per_page = 100, search = "" } = params;
	const response = await api.get("/production-houses", {
		params: { page, per_page, search },
	});
	return response.data;
};

export const getProductionHouse = async (houseId) => {
	const response = await api.get(`/production-houses/${houseId}`);
	return response.data;
};

export const createProductionHouse = async (houseData) => {
	const response = await api.post("/production-houses", houseData);
	return response.data;
};

export const updateProductionHouse = async (houseId, houseData) => {
	const response = await api.put(`/production-houses/${houseId}`, houseData);
	return response.data;
};

export const deleteProductionHouse = async (houseId) => {
	const response = await api.delete(`/production-houses/${houseId}`);
	return response.data;
};

// ==================== Producers ====================

export const getAllProducers = async (params = {}) => {
	const { page = 1, per_page = 100, search = "" } = params;
	const response = await api.get("/producers", {
		params: { page, per_page, search },
	});
	return response.data;
};

export const getProducer = async (producerId) => {
	const response = await api.get(`/producers/${producerId}`);
	return response.data;
};

export const createProducer = async (producerData) => {
	const response = await api.post("/producers", producerData);
	return response.data;
};

export const updateProducer = async (producerId, producerData) => {
	const response = await api.put(`/producers/${producerId}`, producerData);
	return response.data;
};

export const deleteProducer = async (producerId) => {
	const response = await api.delete(`/producers/${producerId}`);
	return response.data;
};

// ==================== Feedback ====================

export const getAllFeedback = async (params = {}) => {
	const { page = 1, per_page = 100, webseries_id = "", search = "" } = params;
	const response = await api.get("/feedback", {
		params: { page, per_page, webseries_id, search },
	});
	return response.data;
};

export const getFeedback = async (feedbackId) => {
	const response = await api.get(`/feedback/${feedbackId}`);
	return response.data;
};

export const deleteFeedback = async (feedbackId) => {
	const response = await api.delete(`/feedback/${feedbackId}`);
	return response.data;
};

// ==================== Producer Affiliation ====================

export const getAllAffiliations = async (params = {}) => {
	const { page = 1, per_page = 100, producer_id = "", house_id = "", search = "" } = params;
	const response = await api.get("/relations/producer-affiliations", {
		params: { page, per_page, producer_id, house_id, search },
	});
	return response.data;
};

export const createAffiliation = async (data) => {
	const response = await api.post("/relations/producer-affiliations", data);
	return response.data;
};

export const deleteAffiliation = async (producerId, houseId) => {
	const response = await api.delete(`/relations/producer-affiliations/${producerId}/${houseId}`);
	return response.data;
};

// ==================== Telecast ====================

export const getAllTelecasts = async (params = {}) => {
	const { page = 1, per_page = 100, episode_id = "", search = "" } = params;
	const response = await api.get("/relations/telecasts", {
		params: { page, per_page, episode_id, search },
	});
	return response.data;
};

export const createTelecast = async (data) => {
	const response = await api.post("/relations/telecasts", data);
	return response.data;
};

export const updateTelecast = async (telecastId, data) => {
	const response = await api.put(`/relations/telecasts/${telecastId}`, data);
	return response.data;
};

export const deleteTelecast = async (telecastId) => {
	const response = await api.delete(`/relations/telecasts/${telecastId}`);
	return response.data;
};

// ==================== Series Contract ====================

export const getAllContracts = async (params = {}) => {
	const { page = 1, per_page = 100, webseries_id = "", status = "", search = "" } = params;
	const response = await api.get("/relations/contracts", {
		params: { page, per_page, webseries_id, status, search },
	});
	return response.data;
};

export const createContract = async (data) => {
	const response = await api.post("/relations/contracts", data);
	return response.data;
};

export const updateContract = async (contractId, data) => {
	const response = await api.put(`/relations/contracts/${contractId}`, data);
	return response.data;
};

export const deleteContract = async (contractId) => {
	const response = await api.delete(`/relations/contracts/${contractId}`);
	return response.data;
};

// ==================== Subtitle Language ====================

export const getAllSubtitleLanguages = async (params = {}) => {
	const { page = 1, per_page = 100, webseries_id = "", search = "" } = params;
	const response = await api.get("/relations/subtitle-languages", {
		params: { page, per_page, webseries_id, search },
	});
	return response.data;
};

export const createSubtitleLanguage = async (data) => {
	const response = await api.post("/relations/subtitle-languages", data);
	return response.data;
};

export const deleteSubtitleLanguage = async (webseriesId, language) => {
	const response = await api.delete(`/relations/subtitle-languages/${webseriesId}/${language}`);
	return response.data;
};

// ==================== Web Series Release ====================

export const getAllReleases = async (params = {}) => {
	const { page = 1, per_page = 100, webseries_id = "", country_name = "", search = "" } = params;
	const response = await api.get("/relations/releases", {
		params: { page, per_page, webseries_id, country_name, search },
	});
	return response.data;
};

export const createRelease = async (data) => {
	const response = await api.post("/relations/releases", data);
	return response.data;
};

export const updateRelease = async (webseriesId, countryName, data) => {
	const response = await api.put(`/relations/releases/${webseriesId}/${countryName}`, data);
	return response.data;
};

export const deleteRelease = async (webseriesId, countryName) => {
	const response = await api.delete(`/relations/releases/${webseriesId}/${countryName}`);
	return response.data;
};
