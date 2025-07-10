import axios from "axios";

const getApiUrl = () => {
  const baseUrl = "https://backend-app-djuy.onrender.com/api/v1";
  console.log("API Base URL:", baseUrl);
  return baseUrl;
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach Authorization token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token attached to request:", token.substring(0, 20) + "...");
    } else {
      console.warn("No access token found in localStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/admin/login", credentials);
    return response.data;
  }
};

// Dashboard services
export const overviewService = {
  getAllUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },
};

// Post services
export const postService = {
  // Test API connection
  testConnection: async () => {
    try {
      const response = await api.get("/admin/posts");
      console.log("API connection test successful");
      return response.data;
    } catch (error: any) {
      console.error("API connection test failed:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
      throw error;
    }
  },

  // Test minimal post creation
  testMinimalPost: async () => {
    try {
      const formData = new FormData();
      formData.append("title", "Test Post");
      formData.append("content", "Test content");
      formData.append("postArea", "Technology");
      formData.append("tags", "");
      formData.append("layout", "default");
      formData.append("adsEnabled", "false");
      
      console.log("Testing minimal post creation...");
      const response = await api.post("/admin/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Minimal post test successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Minimal post test failed:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  // Test with different field names
  testAlternativeFields: async () => {
    try {
      const formData = new FormData();
      formData.append("title", "Test Post");
      formData.append("description", "Test content"); // Try 'description' instead of 'content'
      formData.append("category", "Technology"); // Try 'category' instead of 'postArea'
      formData.append("tags", "");
      formData.append("layout", "default");
      formData.append("adsEnabled", "false");
      
      console.log("Testing with alternative field names...");
      const response = await api.post("/admin/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Alternative fields test successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Alternative fields test failed:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  // Test with exact form data structure
  testExactFormData: async () => {
    try {
      const formData = new FormData();
      formData.append("title", "Test Post");
      formData.append("content", "Test content");
      formData.append("tags", JSON.stringify(["test", "tag"]));
      formData.append("layout", "default");
      formData.append("postArea", "Technology");
      formData.append("adsEnabled", "false");
      
      console.log("Testing with exact form data structure...");
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await api.post("/admin/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Exact form data test successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Exact form data test failed:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  getAllPosts: async () => {
    const response = await api.get("/admin/posts");
    return response.data;
  },

  createPost: async (formData: FormData) => {
    try {
      console.log("Sending request to /admin/posts");
      console.log("Request URL:", getApiUrl() + "/admin/posts");
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Log headers being sent
      const token = localStorage.getItem("accessToken");
      console.log("Authorization header:", token ? `Bearer ${token.substring(0, 20)}...` : "None");
      console.log("Content-Type header: multipart/form-data");
      
      const response = await api.post("/admin/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      console.error("Create post error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
        
        // Log the full error response for debugging
        if (error.response.data) {
          console.error("Full error response:", JSON.stringify(error.response.data, null, 2));
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  },

  deletePost: async (postId: string) => {
    const response = await api.delete(`/admin/posts/${postId}`);
    return response.data;
  },

  makeBlockedPost: async (postId: string) => {
    const response = await api.patch(`/admin/posts/${postId}/block/`, {
      isActive: false,
    });
    return response.data;
  },
};

export const fastRService = {
  createFastR: async (formData: FormData) => {
    const response = await api.post("/fastr", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getAllFastRs: async () => {
    const response = await api.get("/fastr");
    return response.data.data;
  },

  deleteFastR: async (fastRId: string) => {
    const response = await api.delete(`/fastr/${fastRId}`);
    return response.data;
  },

  makeBlockedFastR: async (fastRId: string) => {
    const response = await api.patch(`/fastr/${fastRId}/block`, {
      isActive: false,
    });
    return response.data;
  },
};

// User services

export const userService = {
  getAllUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  getSearchedUsers: async (searchTerm: string) => {
    const response = await api.get(
      `/admin/users/search?q=${encodeURIComponent(searchTerm)}`
    );
    return response.data.data;
  },
};

export default api;
