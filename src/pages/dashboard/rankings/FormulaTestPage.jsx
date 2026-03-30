import { useState, useEffect, useMemo } from 'react'
import { instagramApi } from '../../../utils/instagramApi'

const DEFAULT_FORMULA = '(views * (comments + likes) * (shares + saves + 1)) / Math.pow(reach, 1.5)'

const TH = 'px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap'
const TD = 'px-3 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap'

function evalFormula(formula, metrics) {
  try {
    const fn = new Function(
      'views', 'likes', 'comments', 'shares', 'saves', 'reach', 'interactions',
      `"use strict"; return (${formula})`
    )
    const result = fn(
      metrics.views,
      metrics.likes,
      metrics.comments,
      metrics.shares,
      metrics.saves,
      metrics.reach,
      metrics.interactions,
    )
    return isFinite(result) ? result : 0
  } catch {
    return null
  }
}

function RankDelta({ original, test }) {
  if (original == null || test == null) return <span className="text-gray-400">—</span>
  const delta = original - test // lower test rank = improved
  if (delta === 0) return <span className="text-gray-400 text-xs">—</span>
  if (delta > 0) return <span className="text-green-500 text-xs font-semibold">▲{delta}</span>
  return <span className="text-red-400 text-xs font-semibold">▼{Math.abs(delta)}</span>
}

export default function FormulaTestPage() {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [formula, setFormula] = useState(DEFAULT_FORMULA)
  const [appliedFormula, setAppliedFormula] = useState(DEFAULT_FORMULA)
  const [formulaError, setFormulaError] = useState(null)

  useEffect(() => {
    setLoading(true)
    instagramApi.getDailyTop100()
      .then((res) => setRankings(res.rankings ?? []))
      .catch((err) => setError(err.message ?? 'Failed to load rankings'))
      .finally(() => setLoading(false))
  }, [])

  // Rows enriched with metrics extracted from insights
  const rows = useMemo(() => rankings.map((r, i) => ({
    originalRank: i + 1,
    instagramMediaId: r.instagramMediaId,
    username: r.userData?.username || r.media?.username || '—',
    thumbnail: r.media?.thumbnailUrl || '',
    category: Array.isArray(r.category) ? r.category.join(', ') : (r.category || '—'),
    currentScore: r.beedPlusScore ?? 0,
    metrics: {
      views:        r.insights?.daily_views          ?? 0,
      likes:        r.insights?.daily_likes          ?? 0,
      comments:     r.insights?.daily_comments       ?? 0,
      shares:       r.insights?.daily_shares         ?? 0,
      saves:        r.insights?.daily_saved          ?? 0,
      reach:        r.insights?.daily_reach          ?? 0,
      interactions: r.insights?.daily_totalInteractions ?? 0,
    },
  })), [rankings])

  // Apply formula and re-rank
  const tested = useMemo(() => {
    if (!appliedFormula.trim()) return null

    const withTestScore = rows.map((r) => ({
      ...r,
      testScore: evalFormula(appliedFormula, r.metrics),
    }))

    const hasError = withTestScore.some((r) => r.testScore === null)
    if (hasError) return { error: true, rows: withTestScore }

    const sorted = [...withTestScore].sort((a, b) => b.testScore - a.testScore)
    sorted.forEach((r, i) => { r.testRank = i + 1 })

    // map testRank back to original order for display (sorted by testRank)
    return { error: false, rows: sorted }
  }, [rows, appliedFormula])

  function apply() {
    const sample = { views: 1000, likes: 50, comments: 10, shares: 5, saves: 20, reach: 800, interactions: 80 }
    const result = evalFormula(formula, sample)
    if (result === null) {
      setFormulaError('Invalid formula — check syntax')
      return
    }
    setFormulaError(null)
    setAppliedFormula(formula)
  }

  const displayRows = tested?.error === false ? tested.rows : rows

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Formula Tester</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Test a scoring formula against the latest ranking data and see how the rankings shift.
        </p>
      </div>

      {/* Formula panel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Formula</p>
          <p className="text-xs text-gray-400">
            Variables: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">views</code>{' '}
            <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">likes</code>{' '}
            <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">comments</code>{' '}
            <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">shares</code>{' '}
            <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">saves</code>{' '}
            <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">reach</code>{' '}
            <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">interactions</code>
          </p>
        </div>

        <textarea
          rows={3}
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full font-mono text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
          placeholder="e.g. (views * (comments + likes) * (shares + saves + 1)) / Math.pow(reach, 1.5)"
        />

        {formulaError && (
          <p className="text-xs text-red-500">{formulaError}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={apply}
            className="px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
          >
            Apply Formula
          </button>
          <button
            onClick={() => { setFormula(DEFAULT_FORMULA); setAppliedFormula(DEFAULT_FORMULA); setFormulaError(null) }}
            className="px-5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Status */}
      {loading && <p className="text-sm text-gray-500">Loading rankings…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {tested?.error && (
        <p className="text-sm text-red-500">Formula produced an error on one or more rows — check your syntax.</p>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className={TH}>#</th>
                <th className={TH}>Original Rank</th>
                <th className={TH}>Shift</th>
                <th className={TH}>Creator</th>
                <th className={TH}>Category</th>
                <th className={TH}>Views</th>
                <th className={TH}>Likes</th>
                <th className={TH}>Comments</th>
                <th className={TH}>Shares</th>
                <th className={TH}>Saves</th>
                <th className={TH}>Reach</th>
                <th className={TH}>Current Score</th>
                <th className={TH}>Test Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {displayRows.map((row) => (
                <tr key={row.instagramMediaId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className={TD}>
                    <span className="font-semibold text-orange-500">{row.testRank ?? row.originalRank}</span>
                  </td>
                  <td className={TD}>{row.originalRank}</td>
                  <td className={TD}>
                    <RankDelta original={row.originalRank} test={row.testRank} />
                  </td>
                  <td className={TD}>
                    <div className="flex items-center gap-2">
                      {row.thumbnail && (
                        <img src={row.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <span className="font-medium truncate max-w-[120px]">@{row.username}</span>
                    </div>
                  </td>
                  <td className={TD}>{row.category}</td>
                  <td className={TD}>{row.metrics.views.toLocaleString()}</td>
                  <td className={TD}>{row.metrics.likes.toLocaleString()}</td>
                  <td className={TD}>{row.metrics.comments.toLocaleString()}</td>
                  <td className={TD}>{row.metrics.shares.toLocaleString()}</td>
                  <td className={TD}>{row.metrics.saves.toLocaleString()}</td>
                  <td className={TD}>{row.metrics.reach.toLocaleString()}</td>
                  <td className={TD}>
                    <span className="text-gray-500 text-xs">{row.currentScore.toFixed(4)}</span>
                  </td>
                  <td className={TD}>
                    {row.testScore != null
                      ? <span className="font-semibold text-orange-500">{row.testScore.toFixed(4)}</span>
                      : <span className="text-gray-400">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
