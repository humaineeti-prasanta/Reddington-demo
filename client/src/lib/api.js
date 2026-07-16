import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Returns the purposeId when a response is a 403 consent_required error, else null.
export const isConsentError = (err) => {
  const data = err?.response?.data;
  if (err?.response?.status === 403 && data?.error === 'consent_required') {
    return data.purposeId;
  }
  return null;
};

export default api;
