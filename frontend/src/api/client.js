import axios from 'axios';

// Get custom API URL from localStorage or fallback to environment-appropriate default
const getBaseURL = () => {
  // Android emulator can't reach the host machine via 127.0.0.1 — it must use
  // the special alias 10.0.2.2. Web/dev builds keep using 127.0.0.1.
  if (import.meta.env.MODE === 'mobile') {
    return 'http://10.0.2.2:8000';
  }

  const saved = localStorage.getItem('biew_api_url');
  if (saved) return saved;

  return 'http://127.0.0.1:8000';
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