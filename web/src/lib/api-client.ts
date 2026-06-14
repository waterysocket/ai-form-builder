// Basic API client for FormCraft
const API_URL = '/api' // Assuming a proxy or same-domain for now

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // In a real app we might pass tokens, for now we assume auth is handled via cookies
  // or we need to pass a token. For the sake of this prototype, we will just use basic fetch
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      // If we had a token: 'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  })
  
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`)
  }
  
  return res.json()
}

export const api = {
  surveys: {
    list: () => fetchWithAuth('/surveys'),
    get: (id: string) => fetchWithAuth(`/surveys/${id}`),
    create: (data: any) => fetchWithAuth('/surveys', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchWithAuth(`/surveys/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchWithAuth(`/surveys/${id}`, { method: 'DELETE' }),
    publish: (id: string) => fetchWithAuth(`/surveys/${id}/publish`, { method: 'PUT' }),
    unpublish: (id: string) => fetchWithAuth(`/surveys/${id}/unpublish`, { method: 'PUT' }),
    analytics: (id: string) => fetchWithAuth(`/responses/${id}`),
  },
  dashboard: {
    metrics: () => fetchWithAuth('/dashboard'),
  },
  public: {
    getSurvey: (id: string) => fetch(`${API_URL}/public/surveys/${id}`).then(r => r.json()),
    submitResponse: (surveyId: string, answers: any) => 
      fetch(`${API_URL}/public/responses/${surveyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      }).then(r => r.json())
  }
}
