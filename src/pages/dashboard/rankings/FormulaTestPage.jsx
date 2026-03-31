import { useState, useEffect, useMemo } from 'react'
import { instagramApi } from '../../../utils/instagramApi'

const DEFAULT_A = '(views * (comments + likes) * (shares + saves + 1)) / Math.pow(reach, 1.5)'
const DEFAULT_B = '(views * (comments + likes) * (shares + saves + 1)) / Math.pow(reach, 2)'

const TH = 'px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap'
const TD = 'px-3 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap'

const VARS = ['views', 'likes', 'comments', 'shares', 'saves', 'reach', 'interactions']

function evalFormula(formula, metrics) {
  try {
    const fn = new Function(...VARS, `"use strict"; return (${formula})`)
    const result = fn(
      metrics.views, metrics.likes, metrics.comments,
      metrics.shares, metrics.saves, metrics.reach, metrics.interactions,
    )
    return isFinite(result) ? result : 0
  } catch {
    return null
  }
}

function RankDelta({ original, test, color }) {
  if (original == null || test == null) return <span className="text-gray-400">—</span>
  const delta = original - test
  if (delta === 0) return <span className="text-gray-400 text-xs">—</span>
  if (delta > 0) return <span className={`text-xs font-semibold ${color === 'A' ? 'text-blue-500' : 'text-orange-500'}`}>▲{delta}</span>
  return <span className="text-red-400 text-xs font-semibold">▼{Math.abs(delta)}</span>
}

function FormulaPanel({ label, color, formula, onChange, onApply, onReset, error }) {
  const ring   = color === 'A' ? 'focus:border-blue-400 focus:ring-blue-100' : 'focus:border-orange-400 focus:ring-orange-100'
  const badge  = color === 'A' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
  const btn    = color === 'A' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3 flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>Formula {label}</span>
      </div>

      <textarea
        rows={3}
        value={formula}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full font-mono text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-3 outline-none focus:ring-2 resize-none transition ${ring}`}
        placeholder="Enter formula…"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onApply} className={`px-4 py-1.5 rounded-xl text-white text-sm font-semibold transition ${btn}`}>
          Apply
        </button>
        <button onClick={onReset} className="px-4 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          Reset
        </button>
      </div>
    </div>
  )
}

export default function FormulaTestPage() {
  const [rankings, setRankings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const [formulaA, setFormulaA]   = useState(DEFAULT_A)
  const [formulaB, setFormulaB]   = useState(DEFAULT_B)
  const [appliedA, setAppliedA]   = useState(DEFAULT_A)
  const [appliedB, setAppliedB]   = useState(DEFAULT_B)
  const [errorA, setErrorA]       = useState(null)
  const [errorB, setErrorB]       = useState(null)

  const [sortBy, setSortBy]       = useState('A') // 'original' | 'A' | 'B'
  const [activeTab, setActiveTab] = useState(0)   // 0 = All, 1+ = category index

  useEffect(() => {
    setLoading(true)
    instagramApi.getDailyTop100()
      .then((res) => setRankings(res.rankings ?? []))
      .catch((err) => setError(err.message ?? 'Failed to load rankings'))
      .finally(() => setLoading(false))
  }, [])

  const rows = useMemo(() => rankings.map((r, i) => ({
    originalRank: i + 1,
    instagramMediaId: r.instagramMediaId,
    username: r.userData?.username || r.media?.username || '—',
    caption: r.media?.caption || '',
    thumbnail: r.media?.thumbnailUrl || '',
    categoryRaw: Array.isArray(r.category) ? r.category : [r.category].filter(Boolean),
    category: Array.isArray(r.category) ? r.category.join(', ') : (r.category || '—'),
    currentScore: r.beedPlusScore ?? 0,
    metrics: {
      views:        r.insights?.daily_views             ?? 0,
      likes:        r.insights?.daily_likes             ?? 0,
      comments:     r.insights?.daily_comments          ?? 0,
      shares:       r.insights?.daily_shares            ?? 0,
      saves:        r.insights?.daily_saved             ?? 0,
      reach:        r.insights?.daily_reach             ?? 0,
      interactions: r.insights?.daily_totalInteractions ?? 0,
    },
  })), [rankings])

  // Unique categories from all rows
  const categories = useMemo(() => {
    const seen = new Set()
    rows.forEach((r) => r.categoryRaw.forEach((c) => c && seen.add(c)))
    return [...seen].sort()
  }, [rows])

  const tested = useMemo(() => {
    // Filter by active category tab first
    const activeCategory = activeTab === 0 ? null : categories[activeTab - 1]
    const filtered = activeCategory
      ? rows.filter((r) => r.categoryRaw.includes(activeCategory))
      : rows

    const withScores = filtered.map((r) => ({
      ...r,
      scoreA: evalFormula(appliedA, r.metrics),
      scoreB: evalFormula(appliedB, r.metrics),
    }))

    // Assign rank A
    const byA = [...withScores].sort((a, b) => (b.scoreA ?? 0) - (a.scoreA ?? 0))
    byA.forEach((r, i) => { r.rankA = i + 1 })

    // Assign rank B
    const byB = [...withScores].sort((a, b) => (b.scoreB ?? 0) - (a.scoreB ?? 0))
    byB.forEach((r, i) => { r.rankB = i + 1 })

    // Sort display by chosen column
    if (sortBy === 'A') return byA
    if (sortBy === 'B') return byB
    return [...withScores].sort((a, b) => a.originalRank - b.originalRank)
  }, [rows, categories, activeTab, appliedA, appliedB, sortBy])

  function applyA() {
    const sample = { views: 1000, likes: 50, comments: 10, shares: 5, saves: 20, reach: 800, interactions: 80 }
    if (evalFormula(formulaA, sample) === null) { setErrorA('Invalid formula — check syntax'); return }
    setErrorA(null); setAppliedA(formulaA)
  }
  function applyB() {
    const sample = { views: 1000, likes: 50, comments: 10, shares: 5, saves: 20, reach: 800, interactions: 80 }
    if (evalFormula(formulaB, sample) === null) { setErrorB('Invalid formula — check syntax'); return }
    setErrorB(null); setAppliedB(formulaB)
  }

  const SortBtn = ({ value, label }) => (
    <button
      onClick={() => setSortBy(value)}
      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
        sortBy === value
          ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Formula Tester</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Compare two scoring formulas side by side and see how the rankings shift.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Variables: {VARS.map((v) => (
            <code key={v} className="bg-gray-100 dark:bg-gray-700 px-1 rounded mr-1">{v}</code>
          ))}
        </p>
      </div>

      {/* Two formula panels */}
      <div className="flex flex-col lg:flex-row gap-4">
        <FormulaPanel
          label="A" color="A"
          formula={formulaA} onChange={setFormulaA}
          onApply={applyA} onReset={() => { setFormulaA(DEFAULT_A); setAppliedA(DEFAULT_A); setErrorA(null) }}
          error={errorA}
        />
        <FormulaPanel
          label="B" color="B"
          formula={formulaB} onChange={setFormulaB}
          onApply={applyB} onReset={() => { setFormulaB(DEFAULT_B); setAppliedB(DEFAULT_B); setErrorB(null) }}
          error={errorB}
        />
      </div>

      {loading && <p className="text-sm text-gray-500">Loading rankings…</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab(0)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                activeTab === 0
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 0 ? 'bg-orange-400 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
                {rows.length}
              </span>
            </button>
            {categories.map((cat, idx) => {
              const count = rows.filter((r) => r.categoryRaw.includes(cat)).length
              const active = activeTab === idx + 1
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(idx + 1)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-orange-400 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Sort by:</span>
            <SortBtn value="original" label="Original" />
            <SortBtn value="A" label="Formula A" />
            <SortBtn value="B" label="Formula B" />
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className={TH}>Orig.</th>
                  <th className={`${TH} border-l border-blue-100 dark:border-blue-900/40 text-blue-500`}>Rank A</th>
                  <th className={`${TH} border-l border-orange-100 dark:border-orange-900/40 text-orange-500`}>Rank B</th>
                  {sortBy === 'A' && <th className={`${TH} text-blue-500`}>Shift A</th>}
                  {sortBy === 'A' && <th className={`${TH} text-blue-500`}>Score A</th>}
                  {sortBy === 'B' && <th className={`${TH} text-orange-500`}>Shift B</th>}
                  {sortBy === 'B' && <th className={`${TH} text-orange-500`}>Score B</th>}
                  <th className={TH}>Creator</th>
                  <th className={TH}>Category</th>
                  <th className={TH}>Views</th>
                  <th className={TH}>Likes</th>
                  <th className={TH}>Comments</th>
                  <th className={TH}>Shares</th>
                  <th className={TH}>Saves</th>
                  <th className={TH}>Reach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {tested.map((row, i) => (
                    <tr key={row.instagramMediaId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className={TD}>{row.originalRank}</td>
                      {/* Rank A */}
                      <td className={`${TD} border-l border-blue-50 dark:border-blue-900/20`}>
                        <span className="font-semibold text-blue-500">{row.rankA}</span>
                      </td>
                      {/* Rank B */}
                      <td className={`${TD} border-l border-orange-50 dark:border-orange-900/20`}>
                        <span className="font-semibold text-orange-500">{row.rankB}</span>
                      </td>
                      {/* Active formula Shift + Score */}
                      {sortBy === 'A' && (
                        <td className={TD}><RankDelta original={row.originalRank} test={row.rankA} color="A" /></td>
                      )}
                      {sortBy === 'A' && (
                        <td className={TD}>
                          {row.scoreA != null
                            ? <span className="text-xs font-medium text-blue-500">{row.scoreA.toFixed(4)}</span>
                            : <span className="text-gray-400">err</span>}
                        </td>
                      )}
                      {sortBy === 'B' && (
                        <td className={TD}><RankDelta original={row.originalRank} test={row.rankB} color="B" /></td>
                      )}
                      {sortBy === 'B' && (
                        <td className={TD}>
                          {row.scoreB != null
                            ? <span className="text-xs font-medium text-orange-500">{row.scoreB.toFixed(4)}</span>
                            : <span className="text-gray-400">err</span>}
                        </td>
                      )}
                      {/* Creator */}
                      <td className={TD}>
                        <div className="flex items-center gap-2">
                          {row.thumbnail && (
                            <img src={row.thumbnail} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[110px]">@{row.username}</p>
                            {row.caption && (
                              <p className="text-xs text-gray-400 truncate max-w-[110px]">
                                {row.caption.slice(0, 30)}{row.caption.length > 30 ? '…' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={TD}><span className="truncate max-w-[100px] block">{row.category}</span></td>
                      <td className={TD}>{row.metrics.views.toLocaleString()}</td>
                      <td className={TD}>{row.metrics.likes.toLocaleString()}</td>
                      <td className={TD}>{row.metrics.comments.toLocaleString()}</td>
                      <td className={TD}>{row.metrics.shares.toLocaleString()}</td>
                      <td className={TD}>{row.metrics.saves.toLocaleString()}</td>
                      <td className={TD}>{row.metrics.reach.toLocaleString()}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
