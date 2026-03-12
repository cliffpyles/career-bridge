import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { apiClient, setAuthToken } from '../lib/api-client'
import { queryClient } from '../lib/query-client'

export interface AuthUser {
  id: string
  email: string
  name: string
  is_active: boolean
  created_at: string
}

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'career-bridge-auth-token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }
    setAuthToken(token)
    apiClient
      .get<AuthUser>('/auth/me')
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setAuthToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<TokenResponse>('/auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setAuthToken(res.access_token)
    const u = await apiClient.get<AuthUser>('/auth/me')
    setUser(u)
  }, [])

  const register = useCallback(async (email: string, password: string, name = '') => {
    const res = await apiClient.post<TokenResponse>('/auth/register', { email, password, name })
    localStorage.setItem(TOKEN_KEY, res.access_token)
    setAuthToken(res.access_token)
    const u = await apiClient.get<AuthUser>('/auth/me')
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setUser(null)
    queryClient.clear()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
