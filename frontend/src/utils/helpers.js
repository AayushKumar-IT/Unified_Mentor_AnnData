export const getErrorMessage = (error) => {
  if (error.code === 'ERR_NETWORK' || (!error.response && error.request)) {
    return 'Could not reach the AnnDaata API. Start the backend and configure backend/.env with a running PostgreSQL DATABASE_URL and JWT_SECRET.';
  }
  return error.response?.data?.message || error.message || 'Something went wrong';
};
export const currency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
export const imageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const apiRoot = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
  return `${apiRoot}${path.startsWith('/') ? path : `/${path}`}`;
};
export const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
