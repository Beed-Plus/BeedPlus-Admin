import { createContext, useState, useCallback, useMemo, useEffect } from 'react'
import { apiFetch } from '../utils/api'

const AuthContext = createContext(null)
export { AuthContext }

const ADMIN_ROLES = ['admin', 'superadmin']
const STORAGE_KEY = 'beedplus_admin_auth'

function loadStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStored) // { token, user } | null

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/api/auth/login/admin', { body: { email, password } })
    console.log("data", data)
    const { token, user } = data

    if (!ADMIN_ROLES.includes(user.role?.toLowerCase())) {
      throw new Error('Access denied. Admin or Super Admin privileges required.')
    }

    const session = { token, user }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setAuth(session)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }, [])

  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout)
    return () => window.removeEventListener('auth:unauthorized', logout)
  }, [logout])

  const value = useMemo(
    () => ({ auth, login, logout }),
    [auth, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
