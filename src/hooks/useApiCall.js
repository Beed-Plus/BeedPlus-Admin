import { useState, useCallback } from 'react'

/**
 * Wraps any async API function with loading / error / data state.
 *
 * Usage:
 *   const { run, data, loading, error } = useApiCall(someApiFn)
 *   await run(arg1, arg2)
 */
export function useApiCall(fn) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const run = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message ?? 'Something went wrong')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fn])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { run, data, loading, error, reset }
}
