import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import seriesReducer from "./slices/seriesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    series: seriesReducer,
  },
});

export default store;
