// Central API configuration
// In development: uses localhost
// In production: set VITE_API_URL environment variable on Render

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const config = {
    API_URL: `${API_BASE}/api/v1`,
    WS_URL: API_BASE.replace('http', 'ws') + '/api/v1/ws',
    BASE_URL: API_BASE,
}

export default config
