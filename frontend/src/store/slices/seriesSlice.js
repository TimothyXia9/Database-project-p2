import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import seriesService from "../../services/seriesService";

// 异步Thunks
export const fetchAllSeries = createAsyncThunk(
  "series/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const data = await seriesService.getAllSeries(params);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchSeriesById = createAsyncThunk(
  "series/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await seriesService.getSeriesById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchSeriesByType = createAsyncThunk(
  "series/fetchByType",
  async ({ type, params }, { rejectWithValue }) => {
    try {
      const data = await seriesService.getSeriesByType(type, params);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const searchSeries = createAsyncThunk(
  "series/search",
  async (query, { rejectWithValue }) => {
    try {
      const data = await seriesService.searchSeries(query);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  allSeries: [],
  seriesByType: {},
  currentSeries: null,
  searchResults: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
  },
};

const seriesSlice = createSlice({
  name: "series",
  initialState,
  reducers: {
    clearCurrentSeries: (state) => {
      state.currentSeries = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Series
    builder.addCase(fetchAllSeries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllSeries.fulfilled, (state, action) => {
      state.loading = false;
      state.allSeries = action.payload.series;
      state.pagination = {
        total: action.payload.total,
        pages: action.payload.pages,
        currentPage: action.payload.current_page,
      };
    });
    builder.addCase(fetchAllSeries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || "获取剧集失败";
    });

    // Fetch Series By ID
    builder.addCase(fetchSeriesById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSeriesById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSeries = action.payload.series;
    });
    builder.addCase(fetchSeriesById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || "获取剧集详情失败";
    });

    // Fetch Series By Type
    builder.addCase(fetchSeriesByType.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSeriesByType.fulfilled, (state, action) => {
      state.loading = false;
      const type = action.meta.arg.type;
      state.seriesByType[type] = action.payload.series;
    });
    builder.addCase(fetchSeriesByType.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || "获取分类剧集失败";
    });

    // Search Series
    builder.addCase(searchSeries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(searchSeries.fulfilled, (state, action) => {
      state.loading = false;
      state.searchResults = action.payload.series;
    });
    builder.addCase(searchSeries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.error || "搜索失败";
    });
  },
});

export const { clearCurrentSeries, clearSearchResults, clearError } =
  seriesSlice.actions;
export default seriesSlice.reducer;
