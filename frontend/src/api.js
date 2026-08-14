import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Add a request interceptor to append the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/profile'),
  toggleOnline: () => api.post('/auth/toggle-online')
};

export const doctorAPI = {
  getAll: () => api.get('/doctors'),
};

export const consultationAPI = {
  create: (doctorId, scheduledAt, paymentStatus, fee) => api.post('/consultations', { doctorId, scheduledAt, paymentStatus, fee }),
  getAll: () => api.get('/consultations'),
  getById: (id) => api.get(`/consultations/${id}`),
  updateStatus: (id, status) => api.patch(`/consultations/${id}/status`, { status }),
  updateNotes: (id, notes) => api.patch(`/consultations/${id}/notes`, { notes }),
  finalize: (id, data) => api.post(`/consultations/${id}/finalize`, data),
  escalate: (id) => api.post(`/consultations/${id}/escalate`),
  sendMessage: (id, message) => api.post(`/consultations/${id}/messages`, { message }),
  getMessages: (id) => api.get(`/consultations/${id}/messages`),
  payPatientInvoice: (id, payload) => api.post(`/consultations/${id}/pay`, payload)
};

export const appointmentAPI = {
  create: (doctorId, scheduledAt, paymentStatus, fee, familyMemberId, urgencyLevel) => 
    api.post('/appointments/book', { doctorId, scheduledAt, paymentStatus, fee, familyMemberId, urgencyLevel }),
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  cancel: (id) => api.patch(`/appointments/${id}/status`, { status: 'CANCELLED' })
};

export const productAPI = {
  search: (query) => api.get(`/api/products/search?query=${encodeURIComponent(query)}`),
};

export const availabilityAPI = {
  getSlots: (doctorId, date) => api.get(`/availability/${doctorId}/slots?date=${date}`),
  getMyAvailability: () => api.get('/availability'),
  setAvailability: (availabilities) => api.post('/availability', { availabilities }),
};

export const posAPI = {
  lookup: (patientId, consultationId) => {
    let url = '/api/pos/lookup?';
    if (patientId) url += `patientId=${patientId}&`;
    if (consultationId) url += `consultationId=${consultationId}&`;
    return api.get(url);
  },
  generate: (data) => api.post('/api/pos/generate', data),
  pay: (id, data) => api.put(`/api/pos/${id}/pay`, data),
  getInvoices: () => api.get('/api/pos'),
  getShift: () => api.get('/api/pos/shift'),
  openShift: (data) => api.post('/api/pos/shift/open', data),
  closeShift: (data) => api.post('/api/pos/shift/close', data),
  searchPatients: (query) => api.get(`/api/pos/patients/search?query=${query}`)
};

export const familyAPI = {
  getAll: () => api.get('/api/family'),
  create: (data) => api.post('/api/family', data),
  update: (id, data) => api.put(`/api/family/${id}`, data),
  delete: (id) => api.delete(`/api/family/${id}`)
};

export const prescriptionsAPI = {
  getMyPrescriptions: () => api.get('/prescriptions/my'),
};

export const clinicAdminAPI = {
  getDashboard: () => api.get('/api/clinic-admin/dashboard'),
  getStaff: () => api.get('/api/clinic-admin/staff'),
  updateStaff: (id, data) => api.put(`/api/clinic-admin/staff/${id}`, data),
  getSubscription: () => api.get('/api/clinic-admin/subscription'),
  getRevenueReport: (params) => api.get('/api/clinic-admin/revenue', { params }),
  getDoctors: () => api.get('/api/clinic-admin/doctors'),
};

export const superAdminAPI = {
  getStats: () => api.get('/api/super-admin/stats'),
  listTenants: (params) => api.get('/api/super-admin/tenants', { params }),
  getTenantDetail: (id) => api.get(`/api/super-admin/tenants/${id}`),
  updateTenantLicense: (id, data) => api.put(`/api/super-admin/tenants/${id}/license`, data),
  getFeatures: () => api.get('/api/super-admin/features'),
  upsertFeature: (data) => api.post('/api/super-admin/features', data),
  updateFeature: (id, data) => api.put(`/api/super-admin/features/${id}`, data),
};

export default api;
