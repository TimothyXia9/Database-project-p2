import api from "./api";

const authService = {
  // 用户注册
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { access_token, refresh_token, user } = response.data;

      // 存储Token
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 用户登录
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 用户登出
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },

  // 获取当前用户
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // 检查是否登录
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },

  // 检查用户角色
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.account_type === role;
  },
};

export default authService;
