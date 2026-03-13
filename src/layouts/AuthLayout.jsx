import { Outlet } from 'react-router-dom'
import AnalyticsCard from '../components/auth/AnalyticsCard'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="flex w-full items-center justify-center bg-white dark:bg-gray-950 px-8 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-16">
        <AnalyticsCard />
      </div>
    </div>
  )
}
