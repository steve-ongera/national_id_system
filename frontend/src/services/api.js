import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000/api'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
            toast.error('Session expired. Please login again.')
        }
        return Promise.reject(error)
    }
)

export const authService = {
    login: async (id_number, password) => {
        const response = await api.post('/auth/login/', { id_number, password })
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access)
            localStorage.setItem('refresh_token', response.data.refresh)
            localStorage.setItem('user', JSON.stringify(response.data.user))
        }
        return response.data
    },
    
    register: async (userData) => {
        const response = await api.post('/auth/register/', userData)
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access)
            localStorage.setItem('refresh_token', response.data.refresh)
            localStorage.setItem('user', JSON.stringify(response.data.user))
        }
        return response.data
    },
    
    logout: async () => {
        const refresh_token = localStorage.getItem('refresh_token')
        if (refresh_token) {
            await api.post('/auth/logout/', { refresh_token })
        }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
    },
    
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            return JSON.parse(userStr)
        }
        return null
    }
}

export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile/')
        return response.data
    },
    
    updateProfile: async (data) => {
        const response = await api.put('/users/update_profile/', data)
        return response.data
    },
    
    getApplicationStatus: async () => {
        const response = await api.get('/users/application_status/')
        return response.data
    }
}

export const applicationService = {
    submitApplication: async (data) => {
        const response = await api.post('/applications/submit_application/', data)
        return response.data
    },
    
    getMyApplication: async () => {
        const response = await api.get('/applications/')
        return response.data
    },
    
    getApplicationHistory: async (id) => {
        const response = await api.get(`/applications/${id}/history/`)
        return response.data
    }
}

export default api