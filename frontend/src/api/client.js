import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the saved token to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ledger_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Pass the user's local date to the backend to prevent timezone bugs
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  config.headers['x-local-date'] = `${year}-${month}-${day}`;

  return config;
});

// If the session has expired or token is invalid, bounce to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('ledger_token');
      localStorage.removeItem('ledger_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const AuthAPI = {
  signup: (data) => client.post('/auth/signup', data).then((r) => r.data),
  login: (data) => client.post('/auth/login', data).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data),
  updateBudget: (amount) => client.put('/auth/budget', { amount }).then((r) => r.data),
};

export const ExpensesAPI = {
  list: (params) => client.get('/expenses', { params }).then((r) => r.data),
  get: (id) => client.get(`/expenses/${id}`).then((r) => r.data),
  create: (data) => client.post('/expenses', data).then((r) => r.data),
  update: (id, data) => client.put(`/expenses/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/expenses/${id}`),
};

export const CategoriesAPI = {
  list: () => client.get('/categories').then((r) => r.data),
  create: (data) => client.post('/categories', data).then((r) => r.data),
  update: (id, data) => client.put(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/categories/${id}`),
};

export const SummaryAPI = {
  get: () => client.get('/summary').then((r) => r.data),
};

export default client;
