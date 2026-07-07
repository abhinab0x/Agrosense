const API = 'http://127.0.0.1:8000';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem('accessToken', data.access);
    return true;
  } catch {
    return false;
  }
}

/**
 * Drop-in replacement for fetch() that adds the auth header automatically,
 * and if the server says the token is expired/invalid, silently refreshes
 * it once and retries the original request before giving up.
 */
export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API}${path}`;

  const doFetch = () =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...authHeaders(),
      },
    });

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch(); // retry once with the new token
    } else {
      // Refresh failed too — force a real re-login instead of looping 401s forever
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      window.location.href = '/login';
      return res;
    }
  }

  return res;
}