const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('globetrotter_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = { message: await res.text() };
  }

  if (!res.ok) {
    const error = new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  signup: (body) =>
    fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handleResponse),

  login: (body) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handleResponse),

  forgotPassword: (email) =>
    fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).then(handleResponse),

  // Users
  getMe: () =>
    fetch(`${API_BASE}/users/me`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  updateMe: (body) =>
    fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  deleteMe: () =>
    fetch(`${API_BASE}/users/me`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Trips
  getTrips: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/trips${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse);
  },

  createTrip: (body) =>
    fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  getTrip: (id) =>
    fetch(`${API_BASE}/trips/${id}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  updateTrip: (id, body) =>
    fetch(`${API_BASE}/trips/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  deleteTrip: (id) =>
    fetch(`${API_BASE}/trips/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  toggleShare: (id, is_public) =>
    fetch(`${API_BASE}/trips/${id}/share`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_public })
    }).then(handleResponse),

  copyTrip: (id) =>
    fetch(`${API_BASE}/trips/${id}/copy`, {
      method: 'POST',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Stops
  addStop: (tripId, body) =>
    fetch(`${API_BASE}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  updateStop: (stopId, body) =>
    fetch(`${API_BASE}/stops/${stopId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  deleteStop: (stopId) =>
    fetch(`${API_BASE}/stops/${stopId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  reorderStops: (tripId, orderedStopIds) =>
    fetch(`${API_BASE}/trips/${tripId}/stops/reorder`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderedStopIds })
    }).then(handleResponse),

  // Cities & Activities Catalog
  getCities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/cities${query ? `?${query}` : ''}`).then(handleResponse);
  },

  getCity: (cityId) =>
    fetch(`${API_BASE}/cities/${cityId}`).then(handleResponse),

  getCityActivities: (cityId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/cities/${cityId}/activities${query ? `?${query}` : ''}`).then(handleResponse);
  },

  // Trip Scheduled Activities
  addTripActivity: (stopId, body) =>
    fetch(`${API_BASE}/stops/${stopId}/activities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  updateTripActivity: (id, body) =>
    fetch(`${API_BASE}/trip-activities/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  deleteTripActivity: (id) =>
    fetch(`${API_BASE}/trip-activities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Budget
  getTripBudget: (tripId) =>
    fetch(`${API_BASE}/trips/${tripId}/budget`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  addBudgetEntry: (tripId, body) =>
    fetch(`${API_BASE}/trips/${tripId}/budget-entries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  deleteBudgetEntry: (id) =>
    fetch(`${API_BASE}/budget-entries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Public Share
  getPublicTrip: (slug) =>
    fetch(`${API_BASE}/share/${slug}`).then(handleResponse),

  // Admin
  getAdminStats: () =>
    fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getAdminUsers: () =>
    fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  toggleDisableUser: (userId) =>
    fetch(`${API_BASE}/admin/users/${userId}/disable`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    }).then(handleResponse)
};
