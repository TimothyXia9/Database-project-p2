import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import seriesReducer from "./slices/seriesSlice";
import feedbackReducer from "./slices/feedbackSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		series: seriesReducer,
		feedback: feedbackReducer,
	},
});

export default store;
