import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authAPI } from '@/services/auth'
import { getToken, setToken, clearToken } from '@/utils/token'

interface User {
  id: number
  username: string
  role: 'member' | 'admin'
  qq: string
  phone: string
  avatar: string | null
  title: string | null
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: AuthState = {
  user: null,
  token: getToken(),
  loading: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { user: action.payload.user, token: action.payload.token, loading: false }
    case 'LOGOUT':
      return { user: null, token: null, loading: false }
    case 'UPDATE_USER':
      return state.user ? { ...state, user: { ...state.user, ...action.payload } } : state
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>
  register: (data: { username: string; password: string; confirmPassword: string; qq: string; phone: string }) => Promise<void>
  resetPassword: (data: { username: string; phone: string; qq: string; newPassword: string }) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }
    authAPI.getMe()
      .then((data: any) => {
        if (data.user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token } })
        } else {
          clearToken()
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      })
      .catch(() => {
        clearToken()
        dispatch({ type: 'SET_LOADING', payload: false })
      })
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const data: any = await authAPI.login({ username, password })
    if (data.error) throw new Error(data.error)
    setToken(data.token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: data.token } })
  }, [])

  const register = useCallback(async (regData: { username: string; password: string; confirmPassword: string; qq: string; phone: string }) => {
    const data: any = await authAPI.register(regData)
    if (data.error) throw new Error(data.error)
  }, [])

  const resetPassword = useCallback(async (resetData: { username: string; phone: string; qq: string; newPassword: string }) => {
    const data: any = await authAPI.resetPassword(resetData)
    if (data.error) throw new Error(data.error)
  }, [])

  const logout = useCallback(() => {
    authAPI.logout().catch(() => {})
    clearToken()
    dispatch({ type: 'LOGOUT' })
  }, [])

  const updateProfile = useCallback((userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, resetPassword, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within AuthProvider')
  return context
}
