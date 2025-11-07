const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Gestion du token JWT
export const tokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }
}

// Headers avec token JWT
const getAuthHeaders = () => {
  const token = tokenManager.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

export interface SignupData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  token: string
}

export const authAPI = {
  signup: async (data: SignupData) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur lors de l\'inscription')
    }

    return response.json()
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur lors de la connexion')
    }

    const result: LoginResponse = await response.json()
    
    // Stocker le token JWT
    if (result.token) {
      tokenManager.setToken(result.token)
    }
    
    return result
  },

  logout: () => {
    tokenManager.removeToken()
  }
}
