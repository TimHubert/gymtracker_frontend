// API-Konfiguration für alle Umgebungen
const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
  console.log('🔧 API Config - Environment:', import.meta.env.MODE)
  console.log('🔧 API Config - Base URL from env:', baseUrl)
  
  // Fallback zur Production-URL wenn keine Umgebungsvariable gesetzt
  if (!baseUrl) {
    const productionUrl = 'https://gymtracker-backend-kf8x.onrender.com'
    console.log('🔧 API Config - Using production fallback:', productionUrl)
    return productionUrl
  }
  
  console.log('🔧 API Config - Using configured URL:', baseUrl)
  return baseUrl
}

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  
  // API-Endpunkte
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    PROFILE: '/api/auth/profile'
  },
  
  WORKOUTS: {
    ALL: '/workouts',
    WITH_WEIGHTS: '/workoutsWithWeights',
    ONE_WORKOUT: '/OneWorkout',
    BY_ID: (id: string | number) => `/workout/${id}`,
    WITH_WEIGHTS_BY_ID: (id: string | number) => `/workoutWithWeights/${id}`
  },
  
  STATS: {
    BASE: '/api/stats',
    SUMMARY: '/api/stats/summary'
  }
}

// Helper-Funktion zum Erstellen vollständiger URLs
export const createApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
