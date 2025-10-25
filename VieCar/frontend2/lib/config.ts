// API Configuration
export const API_CONFIG = {
  // Backend Java Spring Boot API
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:6969',
  
  // API Endpoints
  ENDPOINTS: {
    CHAT: '/chat',
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`
}
