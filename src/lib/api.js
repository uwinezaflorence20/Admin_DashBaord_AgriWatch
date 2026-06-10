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
  console.log("Current BASE_URL:", BASE_URL);
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
export const login = async (credentials) => {
  const data = await apiCall('/auth/login', {
    method: 'POST',
    body: credentials,
  });
  
  if (data?.accessToken) {
    setStorageItem('accessToken', data.accessToken);
    setStorageItem('refreshToken', data.refreshToken);
    if (data.user) {
      setStorageItem('email', data.user.email);
      setStorageItem('name', data.user.name || data.user.username || '');
    }
  }
  return data;
};

export const logout = async () => {
  try {
     await apiCall('/auth/logout', { method: 'POST' });
  } catch (error) {
     console.error('Logout error:', error);
  } finally {
     logoutUser();
  }
};

export const forgotPassword = async (email) => {
  return await apiCall('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
};

export const resetPassword = async (token, password) => {
  return await apiCall(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: { password },
  });
};

export const getMyProfile = async () => {
  return await apiCall('/auth/me', { method: 'GET' });
};

export const updateProfile = async (profileData) => {
  return await apiCall('/auth/update-profile', {
    method: 'PUT',
    body: profileData,
  });
};

export const updatePassword = async (passwordData) => {
  return await apiCall('/auth/update-password', {
    method: 'PUT',
    body: passwordData,
  });
};

/**
 * Activities Endpoints
 */
export const getActivities = async () => apiCall('/activities', { method: 'GET' });
export const getActivityById = async (id) => apiCall(`/activities/${id}`, { method: 'GET' });
export const createActivity = async (formData) => apiCall('/activities', { method: 'POST', body: formData });
export const updateActivity = async (id, formData) => apiCall(`/activities/${id}`, { method: 'PUT', body: formData });
export const deleteActivity = async (id) => apiCall(`/activities/${id}`, { method: 'DELETE' });

/**
 * Articles Endpoints
 */
export const getArticles = async () => apiCall('/articles', { method: 'GET' });
export const getArticleById = async (id) => apiCall(`/articles/${id}`, { method: 'GET' });
export const createArticle = async (formData) => apiCall('/articles', { method: 'POST', body: formData });
export const updateArticle = async (id, formData) => apiCall(`/articles/${id}`, { method: 'PUT', body: formData });
export const deleteArticle = async (id) => apiCall(`/articles/${id}`, { method: 'DELETE' });

/**
 * News Endpoints
 */
export const getAllNews = async () => apiCall('/news', { method: 'GET' });
export const getNewsById = async (id) => apiCall(`/news/${id}`, { method: 'GET' });
export const createNews = async (formData) => apiCall('/news', { method: 'POST', body: formData });
export const updateNews = async (id, formData) => apiCall(`/news/${id}`, { method: 'PUT', body: formData });
export const deleteNews = async (id) => apiCall(`/news/${id}`, { method: 'DELETE' });

/**
 * Team Endpoints
 */
export const getTeamMembers = async () => apiCall('/team', { method: 'GET' });
export const getTeamMemberById = async (id) => apiCall(`/team/${id}`, { method: 'GET' });
export const createTeamMember = async (formData) => apiCall('/team', { method: 'POST', body: formData });
export const updateTeamMember = async (id, formData) => apiCall(`/team/${id}`, { method: 'PUT', body: formData });
export const deleteTeamMember = async (id) => apiCall(`/team/${id}`, { method: 'DELETE' });

/**
 * Recent Activities Endpoints
 */
export const getRecentActivities = async () => apiCall('/recent', { method: 'GET' });
export const deleteRecentActivity = async (id) => apiCall(`/recent/${id}`, { method: 'DELETE' });


/**
 * Contact Endpoints
 */
export const getContacts = async () => apiCall('/contact', { method: 'GET' });
export const submitContact = async (contactData) => apiCall('/contact', { method: 'POST', body: contactData });
export const deleteContact = async (id) => apiCall(`/contact/${id}`, { method: 'DELETE' });
export const contactDevelopers = async (contactData) => apiCall('/contact/contact-developers', { method: 'POST', body: contactData });
/**
 * Job Postings Endpoints
 */
export const getJobPostings = async () => apiCall('/job-postings', { method: 'GET' });
export const getJobPostingById = async (id) => apiCall(`/job-postings/${id}`, { method: 'GET' });
export const createJobPosting = async (data) => apiCall('/job-postings', { method: 'POST', body: data });
export const updateJobPosting = async (id, data) => apiCall(`/job-postings/${id}`, { method: 'PUT', body: data });
export const deleteJobPosting = async (id) => apiCall(`/job-postings/${id}`, { method: 'DELETE' });

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
