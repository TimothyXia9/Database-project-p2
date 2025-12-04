import api from "./api";

const feedbackService = {
	// Get all feedback for a series
	getFeedbackBySeries: async (webseriesId, params = {}) => {
		try {
			const response = await api.get("/feedback", {
				params: { webseries_id: webseriesId, ...params },
			});
			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},

	// Get single feedback
	getFeedbackById: async (feedbackId) => {
		try {
			const response = await api.get(`/feedback/${feedbackId}`);
			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},

	// Create new feedback
	createFeedback: async (feedbackData) => {
		try {
			console.log("Sending feedback to API:", feedbackData);
			const response = await api.post("/feedback", feedbackData);
			console.log("API response:", response.data);
			return response.data;
		} catch (error) {
			console.error("API error:", error.response?.data || error.message);
			throw error.response?.data || error;
		}
	},

	// Update feedback
	updateFeedback: async (feedbackId, feedbackData) => {
		try {
			const response = await api.put(`/feedback/${feedbackId}`, feedbackData);
			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},

	// Delete feedback
	deleteFeedback: async (feedbackId) => {
		try {
			const response = await api.delete(`/feedback/${feedbackId}`);
			return response.data;
		} catch (error) {
			throw error.response?.data || error;
		}
	},
};

export default feedbackService;
