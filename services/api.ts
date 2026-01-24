import { API_URL } from '../constants';
import { Bean, Brew, CafeLog, Preset } from '../types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

const fetchData = async <T>(action: string, params: Record<string, string> = {}): Promise<T> => {
  const query = new URLSearchParams({ action, ...params }).toString();
  let response;
  
  try {
    response = await fetch(`${API_URL}?${query}`);
  } catch (e) {
    throw new Error('Network error: Check your internet connection and API URL.');
  }
  
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Expected JSON but got:', text.substring(0, 200));
    throw new Error('API returned an invalid response (likely an error page). Ensure your script is deployed for "Anyone".');
  }

  const json: ApiResponse<T> = await response.json();
  
  if (json.status === 'error') {
    throw new Error(json.message || 'API Internal Error');
  }
  return json.data as T;
};

const postData = async <T>(action: string, payload: any): Promise<T> => {
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action, ...payload }),
      headers: {
        'Content-Type': 'text/plain', 
      },
      credentials: 'omit',
    });
  } catch (e) {
    throw new Error('Network error during save: Check your API URL.');
  }

  if (!response.ok) {
     throw new Error(`HTTP Error: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Save failed: API returned an invalid response.');
  }

  let json: ApiResponse<T>;
  try {
      json = await response.json();
  } catch (e) {
      throw new Error('Response parsing failed.');
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
  addBrew: (brew: Omit<Brew, 'id'>) => postData<Brew>('addBrew', brew),
  deleteBrew: (id: string) => postData<any>('deleteBrew', { id }),
  addPreset: (preset: Omit<Preset, 'id'>) => postData<Preset>('addPreset', preset),
  deletePreset: (id: string) => postData<any>('deletePreset', { id }),
  addCafeLog: (log: Omit<CafeLog, 'id'>) => postData<CafeLog>('addCafe', log),
};
