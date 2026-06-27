const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function getSession() {
  const raw = localStorage.getItem('store-rating-session');
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(session) {
  localStorage.setItem('store-rating-session', JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem('store-rating-session');
}

export async function api(path, options = {}) {
  const session = getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export function qs(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}
