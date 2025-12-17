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
  
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const json: ApiResponse<T> = await response.json();
  
  if (json.status === 'error') {
    throw new Error(json.message || 'API Error');
  }
  return json.data as T;
};

const postData = async <T>(action: string, payload: any): Promise<T> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action, ...payload }),
    headers: {
      'Content-Type': 'text/plain', 
    },
    credentials: 'omit',
  });

  if (!response.ok) {
     throw new Error(`HTTP Error: ${response.status}`);
  }

  let json: ApiResponse<T>;
  try {
      json = await response.json();
  } catch (e) {
      throw new Error('Invalid JSON response.');
  }

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
  updateBeanStatus: (id: string, status: 'Active' | 'Finished') => postData<any>('updateBeanStatus', { id, status }),
  addBrew: (brew: Brew) => postData<Brew>('addBrew', brew),
  addPreset: (preset: Preset) => postData<any>('addPreset', preset),
  addCafeLog: (log: CafeLog) => postData<CafeLog>('addCafe', log),
};
