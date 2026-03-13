import { Link } from 'react-router-dom'
import UserAvatar from '../users/UserAvatar'

export default function PostMetaSidebar({ category, subCategory, creator }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Metadata */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Metadata</p>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Category</p>
            <p className="mt-0.5 text-sm font-bold text-gray-800 dark:text-gray-100">{category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Sub-Category</p>
            <p className="mt-0.5 text-sm font-bold text-gray-800 dark:text-gray-100">{subCategory}</p>
          </div>
        </div>
      </div>

      {/* Creator */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Creator</p>
        <div className="flex items-center gap-3">
          <UserAvatar name={creator.name} />
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{creator.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{creator.role}</p>
            <Link
              to="/dashboard/users"
              className="mt-1 block text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
