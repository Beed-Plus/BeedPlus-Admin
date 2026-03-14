import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function GuestRoute({ children }) {
  const { auth } = useAuth()

  if (auth?.token) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
