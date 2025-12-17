import { API_URL } from '../constants';
import { Bean, Brew, CafeLog, Preset } from '../types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

const fetchData = async <T>(action: string, params: Record<string, string> = {}): Promise<T> => {
  const query = new URLSearchParams({ action, ...params }).toString();
  const response = await fetch(`${API_URL}?${query}`);
  const json: ApiResponse<T> = await response.json();
  
  if (json.status === 'error') {
    throw new Error(json.message || 'API Error');
  }
  return json.data as T;
};

const postData = async <T>(action: string, payload: any): Promise<T> => {
  // Google Apps Script Web App POST requests need specific handling.
  // We use no-cors usually if we don't need response, but GAS can return JSON with proper setup.
  // Using 'text/plain' ensures no preflight OPTIONS request which GAS doesn't handle natively easily.
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action, ...payload }),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', 
    },
  });
  const json: ApiResponse<T> = await response.json();
  if (json.status === 'error') {
    throw new Error(json.message || 'API Error');
  }
  return json.data as T;
};

export const api = {
  getBeans: () => fetchData<Bean[]>('getBeans'),
  getPresets: () => fetchData<Preset[]>('getPresets'),
  getHistory: () => fetchData<Brew[]>('getHistory'),
  getCafeLogs: () => fetchData<CafeLog[]>('getCafeLogs'),
  
  addBean: (bean: Omit<Bean, 'id'>) => postData<Bean>('addBean', bean),
  addBrew: (brew: Brew) => postData<Brew>('addBrew', brew),
  addCafeLog: (log: CafeLog) => postData<CafeLog>('addCafe', log),
};