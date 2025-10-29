// api.js - API service for making requests to the backend

import axios from 'axios';

// Function to get the API base URL and ensure it ends with '/api'
const getBaseURL = () => {
  // Prefer explicit VITE_API_URL
  let base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // If user provided a URL without the '/api' suffix, add it.
  try {
    const u = new URL(base);
    // Normalize trailing slash and ensure '/api' path
    if (!u.pathname.endsWith('/api')) {
      // Remove trailing slash(s) then append /api
      u.pathname = u.pathname.replace(/\/+$/, '') + '/api';
      base = u.toString().replace(/\/$/, '');
    } else {
      base = u.toString().replace(/\/$/, '');
    }
  } catch (e) {
    // If it's not a full URL (unlikely), fallback to ensuring suffix
    if (!base.endsWith('/api')) base = base.replace(/\/+$/, '') + '/api';
  }

  return base;
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Only check the local server port when running locally
if (window.location.hostname === 'localhost') {
  (async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/server-info');
      if (response.data.port && response.data.port !== 5000) {
        api.defaults.baseURL = `http://localhost:${response.data.port}/api`;
      }
    } catch (err) {
      console.warn('Could not check server port:', err.message);
    }
  })();
}

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data?.message || error.message);
  }
);

// Post API services
export const postService = {
  // Get all posts with optional pagination and filters
  getAllPosts: async (page = 1, limit = 10, category = null) => {
    let url = `/posts?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Get a single post by ID or slug
  getPost: async (idOrSlug) => {
    const response = await api.get(`/posts/${idOrSlug}`);
    return response.data;
  },

  // Create a new post
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Update an existing post
  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  // Delete a post
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Add a comment to a post
  addComment: async (postId, commentData) => {
    const response = await api.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  },

  // Search posts
  searchPosts: async (query) => {
    const response = await api.get(`/posts/search?q=${query}`);
    return response.data;
  },
};

// Category API services
export const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Create a new category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
};

// Auth API services
export const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default api; 