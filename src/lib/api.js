const BASE_URL = process.env.NEXT_PUBLIC_DEP_LINK;

/**
 * Helper to get item from local storage safely
 */
export const getStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

/**
 * Helper to set item in local storage safely
 */
export const setStorageItem = (key, value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

/**
 * Helper to remove item from local storage safely
 */
export const removeStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

/**
 * Core API caller with automatic token refresh mechanism
 */
export const apiCall = async (endpoint, options = {}) => {
  let token = getStorageItem('accessToken');
  
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  
  const fetchOptions = {
    ...options,
    headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    fetchOptions.body = JSON.stringify(options.body);
  }
  
  let response = await fetch(url, fetchOptions);

  // If unauthorized, attempt to refresh the token
  if (response.status === 401 && token) {
    const refreshToken = getStorageItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setStorageItem('accessToken', refreshData.accessToken);
          if (refreshData.refreshToken) {
             setStorageItem('refreshToken', refreshData.refreshToken);
          }
          
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh token is invalid/expired
          logoutUser();
          throw new Error('Session expired');
        }
      } catch (error) {
        logoutUser();
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      logoutUser();
      throw new Error('Unauthorized');
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || response.statusText || 'API Error';
    throw new Error(errorMessage);
  }

  return data;
};

/**
 * Perform logout logic: clear storage and redirect
 */
export const logoutUser = () => {
  removeStorageItem('accessToken');
  removeStorageItem('refreshToken');
  removeStorageItem('email');
  removeStorageItem('name');
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/login';
  }
};

/**
 * Authentication Endpoints
 */
export const logout = async () => {
  try {
     await apiCall('/auth/logout', { method: 'POST' });
  } catch (error) {
     console.error('Logout error:', error);
  } finally {
     logoutUser();
  }
};

/**
 * News Endpoints
 */
export const getAllNews = async () => apiCall('/news', { method: 'GET' });
export const createNews = async (formData) => apiCall('/news', { method: 'POST', body: formData });
export const updateNews = async (id, formData) => apiCall(`/news/${id}`, { method: 'PUT', body: formData });
export const deleteNews = async (id) => apiCall(`/news/${id}`, { method: 'DELETE' });

/**
 * Team Endpoints
 */
export const getTeamMembers = async () => apiCall('/team', { method: 'GET' });
export const createTeamMember = async (formData) => apiCall('/team', { method: 'POST', body: formData });
export const updateTeamMember = async (id, formData) => apiCall(`/team/${id}`, { method: 'PUT', body: formData });
export const deleteTeamMember = async (id) => apiCall(`/team/${id}`, { method: 'DELETE' });

/**
 * Recent Activities Endpoints
 */
export const getRecentActivities = async () => apiCall('/recent', { method: 'GET' });

/**
 * Contact Endpoints
 */
export const contactDevelopers = async (contactData) => apiCall('/contact/contact-developers', { method: 'POST', body: contactData });

/**
 * Model Performance Endpoints
 * These hit the standalone potato disease detection model API directly
 * (separate service from NEXT_PUBLIC_DEP_LINK, no auth required).
 */
const MODEL_API_URL = process.env.NEXT_PUBLIC_MODEL_API_URL;

export const getModelMetrics = async () => {
  const response = await fetch(`${MODEL_API_URL}/metrics`);
  if (!response.ok) throw new Error('Failed to fetch model metrics');
  return response.json();
};

export const getConfusionMatrixUrl = () => `${MODEL_API_URL}/metrics/confusion-matrix`;
export const getTrainingHistoryUrl = () => `${MODEL_API_URL}/metrics/training-history`;

const AGRI_API = "https://agriwatch-backenf.onrender.com";

const agriCall = async (endpoint, options = {}) => {
  const rawToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  // Guard against accidentally stored "undefined" string
  const token = rawToken && rawToken !== "undefined" && rawToken !== "null" ? rawToken : null;
  const isFormData = options.body instanceof FormData;
  const headers = {
    Accept: "application/json",
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${AGRI_API}${endpoint}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const getAllUsers = async (token) => {
  const response = await fetch(`${AGRI_API}/user/allUsers`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch users");
  }

  return response.json();
};

export const deleteUser = async (id, token) => {
  const response = await fetch(`${AGRI_API}/user/deleteUser/${id}`, {
    method: "DELETE",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete user");
  }

  return response.json();
};

// User — profile & password
export const getMe = () => agriCall("/user/getMe");
export const changeUserPassword = (currentPassword, newPassword) =>
  agriCall("/user/changePassword", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
export const updateUserInfo = (data) =>
  agriCall("/user/updateInfo", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Contacts
export const getAgriContacts = () => agriCall("/contact");
