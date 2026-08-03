import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const fallbackAuthValue = {
  auth: null,
  login: async () => {
    throw new Error('Auth provider is unavailable')
  },
  logout: () => {},
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  return ctx ?? fallbackAuthValue
}
