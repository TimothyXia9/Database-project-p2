import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import feedbackService from "../../services/feedbackService";

// Async Thunks
export const fetchFeedbackBySeries = createAsyncThunk("feedback/fetchBySeries", async (webseriesId, { rejectWithValue }) => {
	try {
		const data = await feedbackService.getFeedbackBySeries(webseriesId);
		return data;
	} catch (error) {
		return rejectWithValue(error);
	}
});

export const createFeedback = createAsyncThunk("feedback/create", async (feedbackData, { rejectWithValue }) => {
	try {
		console.log("Creating feedback with data:", feedbackData);
		const data = await feedbackService.createFeedback(feedbackData);
		console.log("Feedback created successfully:", data);
		return data;
	} catch (error) {
		console.error("Failed to create feedback:", error);
		return rejectWithValue(error);
	}
});

export const updateFeedback = createAsyncThunk("feedback/update", async ({ feedbackId, feedbackData }, { rejectWithValue }) => {
	try {
		const data = await feedbackService.updateFeedback(feedbackId, feedbackData);
		return data;
	} catch (error) {
		return rejectWithValue(error);
	}
});

export const deleteFeedback = createAsyncThunk("feedback/delete", async (feedbackId, { rejectWithValue }) => {
	try {
		const data = await feedbackService.deleteFeedback(feedbackId);
		return { feedbackId, ...data };
	} catch (error) {
		return rejectWithValue(error);
	}
});

const initialState = {
	feedbackList: [],
	currentFeedback: null,
	loading: false,
	error: null,
	total: 0,
	pages: 0,
	currentPage: 1,
	submitSuccess: false,
};

const feedbackSlice = createSlice({
	name: "feedback",
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		clearSubmitSuccess: (state) => {
			state.submitSuccess = false;
		},
		resetFeedback: (state) => {
			state.feedbackList = [];
			state.currentFeedback = null;
			state.error = null;
			state.submitSuccess = false;
		},
	},
	extraReducers: (builder) => {
		// Fetch feedback by series
		builder.addCase(fetchFeedbackBySeries.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchFeedbackBySeries.fulfilled, (state, action) => {
			state.loading = false;
			state.feedbackList = action.payload.feedback || [];
			state.total = action.payload.total || 0;
			state.pages = action.payload.pages || 0;
			state.currentPage = action.payload.current_page || 1;
		});
		builder.addCase(fetchFeedbackBySeries.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.error || "Failed to fetch feedback";
		});

		// Create feedback
		builder.addCase(createFeedback.pending, (state) => {
			state.loading = true;
			state.error = null;
			state.submitSuccess = false;
		});
		builder.addCase(createFeedback.fulfilled, (state, action) => {
			state.loading = false;
			state.submitSuccess = true;
			if (action.payload.feedback) {
				state.feedbackList.unshift(action.payload.feedback);
				state.total += 1;
			}
		});
		builder.addCase(createFeedback.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.error || "Failed to create feedback";
			state.submitSuccess = false;
		});

		// Update feedback
		builder.addCase(updateFeedback.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(updateFeedback.fulfilled, (state, action) => {
			state.loading = false;
			const index = state.feedbackList.findIndex((f) => f.feedback_id === action.payload.feedback.feedback_id);
			if (index !== -1) {
				state.feedbackList[index] = action.payload.feedback;
			}
		});
		builder.addCase(updateFeedback.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.error || "Failed to update feedback";
		});

		// Delete feedback
		builder.addCase(deleteFeedback.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(deleteFeedback.fulfilled, (state, action) => {
			state.loading = false;
			state.feedbackList = state.feedbackList.filter((f) => f.feedback_id !== action.payload.feedbackId);
			state.total -= 1;
		});
		builder.addCase(deleteFeedback.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload?.error || "Failed to delete feedback";
		});
	},
});

export const { clearError, clearSubmitSuccess, resetFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
