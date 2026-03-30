// Central SVG icon registry — all icons are 24x24 viewBox, strokeWidth 1.8
const base = { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }
const s = (d, extra = {}) => (
  <svg {...base} {...extra}>
    {d}
  </svg>
)

export const DashboardIcon = (p) =>
  s(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.8" />
    </>,
    p,
  )

export const UsersIcon = (p) =>
  s(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M17 20H7a4 4 0 01-4-4v0a4 4 0 014-4h10a4 4 0 014 4v0a4 4 0 01-4 4zM12 7a3 3 0 110-6 3 3 0 010 6z"
    />,
    p,
  )

export const PostsIcon = (p) =>
  s(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />,
    p,
  )

export const CategoriesUsersIcon = (p) =>
  s(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M17 20H5a2 2 0 01-2-2v0a2 2 0 012-2h12a2 2 0 012 2v0a2 2 0 01-2 2zM9 7a3 3 0 110-6 3 3 0 010 6zm10-1v6m-3-3h6M15 7a3 3 0 110-6 3 3 0 010 6z"
    />,
    p,
  )

export const CategoriesPostsIcon = (p) =>
  s(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
    />,
    p,
  )

export const SubCategoriesIcon = (p) =>
  s(
    <>
      <rect x="2" y="2" width="8" height="8" rx="1.5" strokeWidth="1.8" />
      <rect x="14" y="2" width="8" height="8" rx="1.5" strokeWidth="1.8" />
      <rect x="8" y="14" width="8" height="8" rx="1.5" strokeWidth="1.8" />
      <path strokeLinecap="round" strokeWidth="1.8" d="M6 10v4m12-4v4M6 14h12" />
    </>,
    p,
  )

export const TrophyIcon = (p) =>
  s(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M8 21h8m-4-4v4m0-4a7 7 0 007-7V3H5v7a7 7 0 007 7zM5 7H2a2 2 0 000 4c.34 0 .666-.056.97-.16M19 7h3a2 2 0 010 4 3.97 3.97 0 01-.97-.16"
    />,
    p,
  )

export const TopHitsIcon = (p) =>
  s(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />,
    p,
  )

export const RankingsIcon = (p) =>
  s(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />,
    p,
  )

export const EmailIcon = (p) =>
  s(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />,
    p,
  )

export const CountryIcon = (p) =>
  s(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />,
    p,
  )

export const AdminIcon = (p) =>
  s(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM12 15a3 3 0 100-6 3 3 0 000 6z"
    />,
    p,
  )

export const CategoriesIcon = (p) =>
  s(
    <>
      <circle cx="12" cy="5" r="2" strokeWidth="1.8" />
      <circle cx="5" cy="19" r="2" strokeWidth="1.8" />
      <circle cx="19" cy="19" r="2" strokeWidth="1.8" />
      <path strokeLinecap="round" strokeWidth="1.8" d="M12 7v5m0 0l-5.5 5m5.5-5l5.5 5" />
    </>,
    p,
  )

export const CompareIcon = (p) =>
  s(
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </>,
    p,
  )

export const FormulaIcon = (p) =>
  s(
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 7h6m0 10H9m3-10v10M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </>,
    p,
  )
