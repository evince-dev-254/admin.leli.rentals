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
      const errorData = error.response.data as { message?: string; error?: string } | undefined
      const errorMessage = errorData?.message || errorData?.error || 'Request failed'
      console.error('[API Error]', {
        status: error.response.status,
        url: error.config?.url,
        message: errorMessage,
        data: errorData,
      })
      // Enhance the error with the server message
      const enhancedError = new Error(errorMessage) as Error & { 
        status?: number
        response?: typeof error.response
      }
      enhancedError.status = error.response.status
      enhancedError.response = error.response
      return Promise.reject(enhancedError)
    } else if (error.request) {
      // Request made but no response received
      console.error('[API Network Error]', error.request)
      return Promise.reject(new Error('Network error: Could not connect to server'))
    } else {
      // Something else happened
      console.error('[API Error]', error.message)
      return Promise.reject(error)
    }
  }
)

export default apiClient

