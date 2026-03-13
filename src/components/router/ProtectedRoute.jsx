import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { auth } = useAuth()
  const location = useLocation()

  if (!auth?.token) {
    // Preserve intended destination so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
