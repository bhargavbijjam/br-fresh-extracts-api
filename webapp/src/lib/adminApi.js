// Shared utility for admin API calls.
// Uses the admin JWT token from localStorage (set during admin login).
// Falls back to VITE_UPLOAD_SECRET if no token is available.

const _raw = import.meta.env.VITE_API_URL || '/api/';
export const ADMIN_API_URL = _raw.endsWith('/') ? _raw : _raw + '/';

const UPLOAD_SECRET = import.meta.env.VITE_UPLOAD_SECRET || '';

function getAdminToken() {
  try {
    const user = JSON.parse(localStorage.getItem('so_user') || 'null');
    return user?.adminToken || null;
  } catch { return null; }
}

/**
 * Returns headers for admin API requests.
 * Prefers the admin JWT token; falls back to VITE_UPLOAD_SECRET.
 * @param {boolean} json - whether to include Content-Type: application/json
 */
export function adminHeaders(json = true) {
  const h = {};
  const token = getAdminToken();
  if (token) {
    h['Authorization'] = `Bearer ${token}`;
  } else if (UPLOAD_SECRET) {
    h['X-Upload-Secret'] = UPLOAD_SECRET;
  }
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

/**
 * Safe JSON fetch that always returns an array.
 * Returns [] if the response is not ok or not an array.
 */
export async function fetchAdminArray(url) {
  try {
    const res = await fetch(url, { headers: adminHeaders(false) });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
