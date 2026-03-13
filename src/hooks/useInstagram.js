import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { useApiCall } from './useApiCall'
import { instagramApi } from '../utils/instagramApi'

export function useInstagram() {
  const { auth } = useAuth()
  const token = auth?.token

  // Auth-required calls — re-created when token changes
  const getProfile      = useApiCall(useCallback(()         => instagramApi.getProfile(token),                    [token]))
  const submitMedia     = useApiCall(useCallback((data)     => instagramApi.submitMedia(data, token),             [token]))
  const getSubmittedMedia = useApiCall(useCallback((id)     => instagramApi.getSubmittedMedia(id, token),         [token]))
  const disconnect      = useApiCall(useCallback(()         => instagramApi.disconnect(token),                    [token]))
  const approveConnect  = useApiCall(useCallback((userId)   => instagramApi.approveInstagramConnect?.(userId, token), [token]))

  // Public calls — stable references (no token needed)
  const getDailyTop100           = useApiCall(instagramApi.getDailyTop100)
  const getDailyTop10            = useApiCall(instagramApi.getDailyTop10)
  const getDailyTop100ByCategory = useApiCall(instagramApi.getDailyTop100ByCategory)
  const getDailyTop10ByCategory  = useApiCall(instagramApi.getDailyTop10ByCategory)
  const getCreatorRankings       = useApiCall(instagramApi.getCreatorRankings)
  const getCreatorMonthlyTop100  = useApiCall(instagramApi.getCreatorMonthlyTop100)
  const getCreatorMonthlyTop10   = useApiCall(instagramApi.getCreatorMonthlyTop10)
  const getTopHits               = useApiCall(instagramApi.getTopHits)
  const recordClick              = useApiCall(instagramApi.recordClick)

  return {
    // Auth-required
    getProfile,
    submitMedia,
    getSubmittedMedia,
    disconnect,
    approveConnect,
    // Public / rankings
    getDailyTop100,
    getDailyTop10,
    getDailyTop100ByCategory,
    getDailyTop10ByCategory,
    getCreatorRankings,
    getCreatorMonthlyTop100,
    getCreatorMonthlyTop10,
    getTopHits,
    recordClick,
  }
}
