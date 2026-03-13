import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { useApiCall } from './useApiCall'
import { usersApi } from '../utils/usersApi'

export function useUsers() {
  const { auth } = useAuth()
  const token = auth?.token

  const getUsers        = useApiCall(useCallback((params)         => usersApi.getUsers(params, token),              [token]))
  const getUserById     = useApiCall(useCallback((id)             => usersApi.getUserById(id, token),               [token]))
  const updateUserRole  = useApiCall(useCallback((id, role)       => usersApi.updateUserRole(id, role, token),      [token]))
  const deleteUser      = useApiCall(useCallback((id)             => usersApi.deleteUser(id, token),                [token]))
  const getMe           = useApiCall(useCallback(()               => usersApi.getMe(token),                         [token]))
  const updateMe        = useApiCall(useCallback((data)           => usersApi.updateMe(data, token),                [token]))
  const changePassword  = useApiCall(useCallback((cur, next)      => usersApi.changePassword(cur, next, token),     [token]))

  return {
    getUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getMe,
    updateMe,
    changePassword,
  }
}
