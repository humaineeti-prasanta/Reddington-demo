import axios from 'axios';

export const ri541g = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const cd17hh = (x5k8po) => {
  const o5ximu = x5k8po?.response?.data;
  if (x5k8po?.response?.status === 403 && o5ximu?.error === 'consent_required') {
    return o5ximu.purposeId;
  }
  return null;
};

export default ri541g;
