import axios from 'axios';

// Get custom API URL from localStorage or fallback to the live Render backend
const getBaseURL = () => {
  const saved = localStorage.getItem('biew_api_url');
  if (saved) return saved;

  // Render Live URL (Works everywhere: PC, Web, Android, physical phones)
  return 'https://student-blrk.onrender.com';
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseURL dynamically if user changes it in settings
export const setApiBaseURL = (newUrl) => {
  apiClient.defaults.baseURL = newUrl;
  localStorage.setItem('biew_api_url', newUrl);
};

// Request interceptor: Attach JWT token if stored
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('biew_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle unauthenticated responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Emit a global event so AuthContext can clear session
      const isAuthRoute =
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/register');
      if (!isAuthRoute) {
        // Fire a custom DOM event to trigger logout in AuthContext
        window.dispatchEvent(new CustomEvent('biew:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// Helper to check if backend server is currently reachable
export const checkBackendHealth = async () => {
  try {
    const res = await axios.get(`${getBaseURL()}/`, { timeout: 2500 });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};