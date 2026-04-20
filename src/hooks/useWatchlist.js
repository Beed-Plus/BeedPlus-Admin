import { useState, useEffect, useMemo, useCallback } from 'react'
import { watchlistApi } from '../utils/watchlistApi'

export function useWatchlist(token) {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    watchlistApi.getWatchlist(token)
      .then((res) => setItems(res.watchlist ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  // mediaId is the Media._id stored in the top-level `mediaId` field
  const watchlistedIds = useMemo(
    () => new Set(items.map((i) => String(i.mediaId)).filter(Boolean)),
    [items],
  )

  const add = useCallback(async (mediaId) => {
    const tempId = `temp-${mediaId}`
    setItems((prev) => [...prev, { _id: tempId, mediaId }])
    try {
      const res = await watchlistApi.addToWatchlist(mediaId, token)
      setItems((prev) => prev.map((i) => i._id === tempId ? res.item : i))
    } catch (err) {
      setItems((prev) => prev.filter((i) => i._id !== tempId))
      throw err
    }
  }, [token])

  const remove = useCallback(async (mediaId) => {
    const snapshot = items.slice()
    setItems((prev) => prev.filter((i) => String(i.mediaId) !== String(mediaId)))
    try {
      await watchlistApi.removeFromWatchlist(mediaId, token)
    } catch (err) {
      setItems(snapshot)
      throw err
    }
  }, [token, items])

  return { watchlistedIds, items, loading, add, remove }
}
