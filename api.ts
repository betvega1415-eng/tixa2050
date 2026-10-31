import { auth } from '../lib/firebase';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.warn('Failed to retrieve Firebase ID token for API request:', err);
    }
  }

  return headers;
}

export const apiService = {
  async get(endpoint: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(endpoint, {
      method: 'GET',
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `API GET request failed with status ${res.status}`);
    }
    return data;
  },

  async post(endpoint: string, body: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `API POST request failed with status ${res.status}`);
    }
    return data;
  }
};
