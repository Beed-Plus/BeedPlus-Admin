import { useState, useMemo, useEffect } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'

function useIsDark() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return dark
}

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// ISO alpha-3 numeric → alpha-2 mapping for the most common codes
// world-atlas uses numeric ISO codes as keys; react-simple-maps exposes
// `geo.properties.name` and (in 110m) no direct alpha-2.
// We match by country name against our `countries` array instead.

function getColor(value, max, dark) {
  if (!value || value === 0) return dark ? '#1f2937' : '#f3f4f6'
  const ratio = Math.min(value / max, 1)
  // Orange gradient: light → deep orange
  if (dark) {
    const r = Math.round(124 + ratio * 131)   // 124 → 255
    const g = Math.round(45  - ratio * 24)    // 45 → 21
    const b = Math.round(18  - ratio * 6)     // 18 → 12
    return `rgb(${r},${g},${b})`
  }
  const r = Math.round(255)
  const g = Math.round(237 - ratio * 120)  // 237 → 117
  const b = Math.round(213 - ratio * 193)  // 213 → 20
  return `rgb(${r},${g},${b})`
}

function Tooltip({ name, userCount, x, y }) {
  if (!name) return null
  return (
    <div
      style={{ left: x + 12, top: y - 8 }}
      className="pointer-events-none fixed z-50 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-lg"
    >
      <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{name}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {userCount ? `${userCount.toLocaleString()} users` : 'No users'}
      </p>
    </div>
  )
}

export default function UserWorldMap({ countries = [] }) {
  const isDark = useIsDark()
  const [tooltip, setTooltip] = useState(null)  // { name, userCount, x, y }
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 })

  // Build lookup: lowercase country name → userCount
  const nameMap = useMemo(() => {
    const map = {}
    countries.forEach((c) => {
      map[c.name.toLowerCase()] = c.userCount ?? 0
    })
    return map
  }, [countries])

  const maxUsers = useMemo(
    () => Math.max(1, ...countries.map((c) => c.userCount ?? 0)),
    [countries],
  )

  function handleMouseMove(geo, e) {
    const name = geo.properties.name
    const userCount = nameMap[name?.toLowerCase()] ?? 0
    setTooltip({ name, userCount, x: e.clientX, y: e.clientY })
  }

  function handleMouseLeave() {
    setTooltip(null)
  }

  function handleMoveEnd(pos) {
    setPosition(pos)
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">User Distribution</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Geographic breakdown of platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 dark:text-gray-500">Low</span>
            <div
              className="h-3 w-20 rounded-full"
              style={{
                background: isDark
                  ? 'linear-gradient(to right, #1f2937, rgb(255,21,12))'
                  : 'linear-gradient(to right, #f3f4f6, rgb(255,117,20))',
              }}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">High</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="w-full flex-1" style={{ minHeight: 280 }}>
        <ComposableMap
          projectionConfig={{ scale: 147, center: [0, 10] }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={6}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name
                  const count = nameMap[name?.toLowerCase()] ?? 0
                  const fill = getColor(count, maxUsers, isDark)
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={isDark ? '#374151' : '#e5e7eb'}
                      strokeWidth={0.4}
                      style={{
                        default: { outline: 'none' },
                        hover:   { outline: 'none', opacity: 0.8, cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                      onMouseMove={(e) => handleMouseMove(geo, e)}
                      onMouseLeave={handleMouseLeave}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Zoom hint */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-2.5 flex items-center justify-between">
        <p className="text-[11px] text-gray-300 dark:text-gray-600">Scroll to zoom · Drag to pan</p>
        <button
          onClick={() => setPosition({ coordinates: [0, 20], zoom: 1 })}
          className="text-[11px] font-medium text-orange-400 hover:text-orange-500 transition"
        >
          Reset view
        </button>
      </div>

      {tooltip && (
        <Tooltip
          name={tooltip.name}
          userCount={tooltip.userCount}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
    </div>
  )
}
