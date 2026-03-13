import { Link } from 'react-router-dom'

export default function Breadcrumb({ crumbs }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast ? (
              <span className="font-semibold text-gray-700">{crumb.label}</span>
            ) : (
              <Link to={crumb.to} className="hover:text-orange-500 transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
