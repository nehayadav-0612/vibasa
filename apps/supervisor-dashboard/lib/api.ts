import axios from 'axios';
import { getAuthToken, removeAuthToken } from './utils';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string | undefined = error.config?.url;

    // Do not auto-redirect for auth/bootstrap endpoints so login errors
    // (invalid credentials) can be handled and shown by the UI.
    const isAuthEndpoint = url?.includes('/auth/login') || url?.includes('/supervisor/bootstrap');

    if (status === 401 && !isAuthEndpoint) {
      removeAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export async function loginSupervisor(email: string, password: string) {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}

export async function bootstrapSupervisor(email: string, password: string) {
  const response = await apiClient.post('/supervisor/bootstrap', { email, password });
  return response.data;
}

export async function getKPIDashboard() {
  const response = await apiClient.get('/supervisor/kpi');
  return response.data;
}

export async function getCollectors() {
  const response = await apiClient.get('/supervisor/collectors');
  return response.data;
}

export async function createCollector(email: string, password: string, name: string, phone: string) {
  const response = await apiClient.post('/supervisor/collectors', {
    email,
    password,
    name,
    phone,
    assigned_wards: [],
  });
  return response.data;
}

export async function assignWards(collectorId: string, assigned_wards: string[]) {
  const response = await apiClient.patch(`/supervisor/collectors/${collectorId}/assign-wards`, {
    assigned_wards,
  });
  return response.data;
}

export async function uploadCSVPreview(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/supervisor/residents/import-preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function confirmCSVImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/supervisor/residents/import-confirm', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getIssues(resolved?: boolean) {
  const params = resolved !== undefined ? { resolved: resolved ? 'true' : 'false' } : {};
  const response = await apiClient.get('/supervisor/issues', { params });
  return response.data;
}

export async function resolveIssue(issueId: string) {
  const response = await apiClient.patch(`/supervisor/issues/${issueId}/resolve`);
  return response.data;
}

export async function generateMonthlyCharges(month: string) {
  const response = await apiClient.post('/supervisor/generate-monthly-charges', { month });
  return response.data;
}

export async function getBillingOverview(month: string) {
  const response = await apiClient.get(`/supervisor/billing/${month}`);
  return response.data;
}

export async function getResidents() {
  const response = await apiClient.get('/supervisor/residents');
  return response.data;
}

/*export async function getWards() {
  const response = await apiClient.get('/supervisor/residents');
  return response.data;
}
*/
export async function createResident({ residentData }: {
  residentData: {
    prop_uid: string;
    owner_name: string;
    zone_no: string;
    ward_no: string;
    ward_name: string;
    address: string;
    mobile: string;
    lat: string | null;
    lng: string | null;
  };
}): Promise<any> {
  const response = await apiClient.post('/supervisor/residents', residentData);
  return response.data;
}

export async function updateResident(
{ prop_uid, residentData }: {
  prop_uid: string; residentData: {
    owner_name?: string;
    zone_no?: string;
    ward_no?: string;
    ward_name?: string;
    address?: string;
    mobile?: string;
    lat?: number | null;
    lng?: number | null;
  };
}): Promise<any> {
  const response = await apiClient.patch(`/supervisor/residents/${prop_uid}`, residentData);
  return response.data;
}

export async function deleteResident(prop_uid: string) {
  const response = await apiClient.delete(`/supervisor/residents/${prop_uid}`);
  return response.data;
}

// Health check and debugging functions
export async function checkAPIHealth() {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    return { status: 'ok', data: response.data };
  } catch (error: any) {
    return { 
      status: 'error', 
      message: error.message,
      code: error.response?.status 
    };
  }
}

export async function listAvailableEndpoints() {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error: any) {
    console.warn('Could not list endpoints:', error.message);
    return null;
  }
}

// Debug helper to check if residents endpoints exist
export async function checkResidentsEndpoint() {
  try {
    const response = await apiClient.options('/supervisor/residents');
    return { available: true, data: response.data };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { 
        available: false, 
        error: 'Endpoint not found (404)',
        endpoint: '/supervisor/residents',
        fullURL: `${API_URL}/supervisor/residents`
      };
    }
    return { 
      available: false, 
      error: error.message,
      code: error.response?.status 
    };
  }
}

export default apiClient;
