import api from "./api";

const seriesService = {
  // 获取所有剧集
  getAllSeries: async (params = {}) => {
    try {
      const response = await api.get("/series", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 获取单个剧集
  getSeriesById: async (id) => {
    try {
      const response = await api.get(`/series/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 创建剧集
  createSeries: async (seriesData) => {
    try {
      const response = await api.post("/series", seriesData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 更新剧集
  updateSeries: async (id, seriesData) => {
    try {
      const response = await api.put(`/series/${id}`, seriesData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 删除剧集
  deleteSeries: async (id) => {
    try {
      const response = await api.delete(`/series/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 搜索剧集
  searchSeries: async (query) => {
    try {
      const response = await api.get("/series", {
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 按类型获取剧集
  getSeriesByType: async (type, params = {}) => {
    try {
      const response = await api.get("/series", {
        params: { type, ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default seriesService;
