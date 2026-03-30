import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import UsersPage from '../pages/dashboard/users/UsersPage'
import UserDetailPage from '../pages/dashboard/users/UserDetailPage'
import UsersStatusPage from '../pages/dashboard/users/UsersStatusPage'
import PostsPage from '../pages/dashboard/posts/PostsPage'
import PostDetailPage from '../pages/dashboard/posts/PostDetailPage'
import ComparePostsPage from '../pages/dashboard/posts/ComparePostsPage'
import CategoriesUsersPage from '../pages/dashboard/categories/CategoriesUsersPage'
import CategoriesPostsPage from '../pages/dashboard/categories/CategoriesPostsPage'
import SubCategoriesPage from '../pages/dashboard/categories/SubCategoriesPage'
import TopCreatorsPage from '../pages/dashboard/rankings/TopCreatorsPage'
import TopHitsPage from '../pages/dashboard/rankings/TopHitsPage'
import PostRankingsPage from '../pages/dashboard/rankings/PostRankingsPage'
import PostRankingDetailPage from '../pages/dashboard/rankings/PostRankingDetailPage'
import FormulaTestPage from '../pages/dashboard/rankings/FormulaTestPage'
import EmailPage from '../pages/dashboard/email/EmailPage'
import AdminPage from '../pages/dashboard/admin/AdminPage'
import CountriesPage from '../pages/dashboard/countries/CountriesPage'
import ProtectedRoute from '../components/router/ProtectedRoute'
import GuestRoute from '../components/router/GuestRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <GuestRoute><AuthLayout /></GuestRoute>,
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/approved', element: <UsersStatusPage status="approved" /> },
      { path: 'users/pending',  element: <UsersStatusPage status="pending" /> },
      { path: 'users/rejected', element: <UsersStatusPage status="rejected" /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'posts', element: <PostsPage /> },
      { path: 'posts/compare', element: <ComparePostsPage /> },
      { path: 'posts/:id', element: <PostDetailPage /> },
      { path: 'categories/users', element: <CategoriesUsersPage /> },
      { path: 'categories/posts', element: <CategoriesPostsPage /> },
      { path: 'sub-categories', element: <SubCategoriesPage /> },
      { path: 'rankings/top-creators', element: <TopCreatorsPage /> },
      { path: 'rankings/top-hits', element: <TopHitsPage /> },
      { path: 'rankings/posts', element: <PostRankingsPage /> },
      { path: 'rankings/posts/:id', element: <PostRankingDetailPage /> },
      { path: 'rankings/formula-test', element: <FormulaTestPage /> },
      { path: 'email', element: <EmailPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'countries', element: <CountriesPage /> },
    ],
  },
])

export default router
