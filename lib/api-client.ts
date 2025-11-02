import axios, { AxiosInstance, AxiosError } from 'axios'

// Determine API URL based on environment
const getApiUrl = () => {
  // Production: connect to main app at www.leli.rentals
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_MAIN_API_URL || 'https://www.leli.rentals/api'
  }
  // Development: use localhost or custom URL
  return process.env.NEXT_PUBLIC_MAIN_API_URL || 'http://localhost:3000/api'
}

// Create axios instance pointing to main site API
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Important for Clerk cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    const baseURL = config.baseURL || getApiUrl()
    const fullURL = `${baseURL}${config.url}`
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullURL}`)
    if (process.env.NODE_ENV === 'production') {
      console.log(`[Production API] Connecting from admin.leli.rentals to www.leli.rentals`)
    }
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('[API Error]', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
      })
    } else if (error.request) {
      // Request made but no response received
      console.error('[API Network Error]', error.request)
    } else {
      // Something else happened
      console.error('[API Error]', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient

