# BeedPlus Admin Dashboard

A React-based admin dashboard for managing the BeedPlus platform — a social media aggregation and ranking system built around Instagram content creators.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Pages & Features](#pages--features)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Routing](#routing)

---

## Overview

BeedPlus Admin provides administrators with tools to:

- Manage users (approve, reject, assign roles and categories)
- Browse and categorize Instagram media submissions
- View post and creator rankings (daily, weekly, monthly)
- Manage categories, sub-categories, and countries
- Send bulk emails to targeted user groups
- Monitor recent platform activity

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 7.x | Build tool & dev server |
| React Router | 7.x | Client-side routing |
| TailwindCSS | 4.x | Utility-first styling |
| react-simple-maps | 3.x | World map visualization |
| react-day-picker | 9.x | Date picker component |
| prop-types | 15.x | Runtime prop validation |

---

## Prerequisites

- Node.js 18+
- npm or yarn
- BeedPlus Backend running (see `BeedPlus-Backend`)

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd BeedPlus-admin

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Start the development server
npm run dev
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the codebase |

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:4000
VITE_APP_URL=http://localhost:5173
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the BeedPlus Backend API |
| `VITE_APP_URL` | URL of this admin app (used for internal references) |

> All environment variables must be prefixed with `VITE_` to be accessible in the browser via `import.meta.env`.

---

## Project Structure

```
BeedPlus-admin/
├── public/                          # Static assets (logos, icons)
├── src/
│   ├── assets/                      # Internal assets
│   ├── components/
│   │   ├── auth/                    # Login UI components
│   │   │   ├── AnalyticsCard.jsx    # Decorative stat card on login page
│   │   │   ├── BeedLogo.jsx         # Brand logo component
│   │   │   └── LoginForm.jsx        # Login form with validation
│   │   ├── dashboard/               # Dashboard feature components
│   │   │   ├── Sidebar.jsx          # Fixed navigation sidebar
│   │   │   ├── navConfig.jsx        # Single source of truth for nav routes
│   │   │   ├── StatCard.jsx         # Metric stat card (label, value, icon)
│   │   │   ├── RecentActivity.jsx   # Activity feed table
│   │   │   ├── categories/          # Category management components
│   │   │   ├── countries/           # Country map & table components
│   │   │   ├── email/               # Email compose & recipient components
│   │   │   ├── posts/               # Post list, detail, thumbnail components
│   │   │   └── rankings/            # Creator & post ranking components
│   │   ├── router/
│   │   │   ├── GuestRoute.jsx       # Redirects to dashboard if authenticated
│   │   │   └── ProtectedRoute.jsx   # Redirects to login if unauthenticated
│   │   └── ui/                      # Reusable primitives
│   │       ├── Badge.jsx
│   │       ├── Breadcrumb.jsx
│   │       ├── Button.jsx
│   │       ├── Checkbox.jsx
│   │       ├── Input.jsx
│   │       ├── Pagination.jsx
│   │       ├── StatusBadge.jsx
│   │       └── icons.jsx            # Central SVG icon registry
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state (token, user, login, logout)
│   ├── data/                        # Mock/fallback data files
│   ├── hooks/                       # Custom React hooks
│   │   ├── useApiCall.js            # Generic async API call hook
│   │   ├── useAuth.js               # Access auth context
│   │   ├── useCategories.js         # Fetch & manage categories
│   │   ├── useCountries.js          # Fetch & manage countries
│   │   ├── useInstagram.js          # Fetch Instagram/post data
│   │   ├── useSubCategories.js      # Fetch & manage sub-categories
│   │   ├── useTheme.js              # Theme toggle logic
│   │   └── useUsers.js              # Fetch & manage users
│   ├── layouts/
│   │   ├── AuthLayout.jsx           # Split-panel (form left, graphic right)
│   │   └── DashboardLayout.jsx      # Sidebar + scrollable main content
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   └── dashboard/
│   │       ├── DashboardPage.jsx
│   │       ├── admin/AdminPage.jsx
│   │       ├── categories/          # Category & sub-category pages
│   │       ├── countries/CountriesPage.jsx
│   │       ├── email/EmailPage.jsx
│   │       ├── posts/               # Post list, detail, compare pages
│   │       ├── rankings/            # Creator & post ranking pages
│   │       └── users/               # User list, detail, status pages
│   ├── routes/
│   │   └── index.jsx                # createBrowserRouter configuration
│   └── utils/                       # API client functions
│       ├── api.js                   # Base fetch wrapper (apiFetch)
│       ├── authApi.js
│       ├── usersApi.js
│       ├── instagramApi.js
│       ├── categoriesApi.js
│       ├── subCategoriesApi.js
│       ├── countriesApi.js
│       ├── emailApi.js
│       └── activitiesApi.js
├── .env
├── package.json
├── vite.config.js
└── index.html
```

---

## Pages & Features

### Login (`/login`)
Admin-only login page. Validates that the authenticated user has `admin` or `super_admin` role before granting access.

### Dashboard Overview (`/dashboard`)
Summary page showing platform-wide stats:
- Total users, posts, categories, sub-categories
- Recent activity feed

### Users (`/dashboard/users`)
Full user management:
- Paginated list with search and multi-filter (category, country, gender, approval status)
- Approve / reject / delete users
- Update user role and category
- Filter views for approved, pending, and rejected users
- Individual user detail page (`/dashboard/users/:id`)

### Posts (`/dashboard/posts`)
Instagram media submission management:
- Browse all submitted media with thumbnails
- Filter by category, sub-category, country
- Assign/update category and sub-category per post
- Side-by-side post comparison (`/dashboard/posts/compare`)
- Individual post detail with daily insights (`/dashboard/posts/:id`)

### Categories (`/dashboard/categories/users`, `/dashboard/categories/posts`)
- View and manage categories assigned to users
- View and manage categories assigned to posts

### Sub-Categories (`/dashboard/sub-categories`)
- Create, edit, and delete sub-categories linked to parent categories

### Rankings
| Route | Description |
|---|---|
| `/dashboard/rankings/top-creators` | Monthly top 100 creators, filterable by category & country |
| `/dashboard/rankings/top-hits` | Weekly top-performing posts with trending metrics |
| `/dashboard/rankings/posts` | Post rankings by date (date picker), includes Beed Score |
| `/dashboard/rankings/posts/:id` | Detail view for individual post ranking |
| `/dashboard/rankings/formula-test` | Internal formula testing/debugging tool |

### Countries (`/dashboard/countries`)
- Create, edit, and delete countries
- Activate or suspend countries
- World map visualization of user distribution

### Email (`/dashboard/email`)
Bulk email composer:
- **Recipient modes**: All users, Approved only, Pending only, By Category, Manually selected
- Compose subject and message body
- Preview recipient count before sending

### Admin Settings (`/dashboard/admin`)
- Edit admin profile (name, email, phone, bio)
- Change password (with confirmation validation)
- Notification preferences (per-event toggles)

---

## Authentication

Authentication uses **JWT tokens** stored in `localStorage` under the key `beedplus_admin_auth`.

**Flow:**
1. User submits credentials on `/login`
2. `POST /api/auth/login` returns `{ token, user }`
3. Role is validated — only `admin` or `super_admin` can proceed
4. Token and user data are stored in `localStorage` and React Context
5. All protected API calls include `Authorization: Bearer <token>`
6. On a `401` response, the token is cleared and the user is redirected to login

**Route Guards:**
- `<ProtectedRoute>` — wraps all dashboard routes; redirects to `/login` if no token
- `<GuestRoute>` — wraps login route; redirects to `/dashboard` if already authenticated

---

## API Endpoints

All requests go to the base URL defined in `VITE_API_URL` (default: `http://localhost:4000`).

The base fetch utility is in [src/utils/api.js](src/utils/api.js).

---

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | None | Login with email and password |
| `POST` | `/api/auth/signup` | None | Register a new user account |
| `POST` | `/api/auth/verify-email` | None | Verify email with code |
| `POST` | `/api/auth/forgot-password` | None | Request a password reset email |
| `POST` | `/api/auth/reset-password?token=` | None | Reset password using reset token |
| `PUT` | `/api/auth/instagram-connect` | User | Connect Instagram account |
| `PUT` | `/api/auth/approve-instagram-connect/:userId` | Admin | Approve a user's Instagram connection |
| `PUT` | `/api/auth/reset-instagram-connect` | User | Reset Instagram connection |

---

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | List all users with pagination and filters |
| `GET` | `/api/users/me` | User | Get current authenticated user profile |
| `PUT` | `/api/users/me` | User | Update current user profile |
| `PUT` | `/api/users/change-password` | User | Change user password |
| `GET` | `/api/users/:id` | Admin | Get a specific user by ID |
| `PUT` | `/api/users/:id/role` | Admin | Update a user's role |
| `DELETE` | `/api/users/:id` | Admin | Delete a user |
| `PATCH` | `/api/users/:id/category` | Admin | Update user's category and country |
| `PATCH` | `/api/users/:id/invite` | Admin | Mark user as invited |

**Query params for `GET /api/users`:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page |
| `search` | string | Search by username or email |
| `category` | string | Filter by category ID |
| `country` | string | Filter by country ID |
| `gender` | string | Filter by gender |
| `isVerified` | boolean | Filter by email verification status |
| `approvalStatus` | string | `approved`, `pending`, or `rejected` |

---

### Instagram / Posts — `/api/instagram`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/instagram/profile` | User | Get authenticated user's Instagram profile |
| `POST` | `/api/instagram/submit-media` | User | Submit Instagram media |
| `POST` | `/api/instagram/disconnect` | User | Disconnect Instagram account |
| `GET` | `/api/instagram/submitted-media` | Admin | Get all submitted media |
| `GET` | `/api/instagram/submitted-media/:id` | User | Get a specific media submission |
| `GET` | `/api/instagram/admin/media/:id` | Admin | Get full media data including daily insights |
| `PATCH` | `/api/instagram/admin/media/:id/category` | Admin | Update media's category |
| `POST` | `/api/instagram/media/:mediaId/click` | Public | Record a media click event |
| `GET` | `/api/instagram/oembed?url=` | Public | Get oEmbed data for an Instagram URL |
| `GET` | `/api/instagram/daily-top-100` | Public | Get top 100 posts for today |
| `GET` | `/api/instagram/daily-top-10` | Public | Get top 10 posts for today |
| `GET` | `/api/instagram/daily-top-100/:category` | Public | Get top 100 posts by category |
| `GET` | `/api/instagram/daily-top-10/:category` | Public | Get top 10 posts by category |
| `GET` | `/api/instagram/ranking-dates` | Public | List all available ranking dates |
| `GET` | `/api/instagram/rankings-by-date/:date` | Public | Get rankings for a specific date |
| `GET` | `/api/instagram/creator-rankings` | Public | Get monthly creator rankings |
| `GET` | `/api/instagram/creator-monthly-top-100` | Public | Get top 100 creators for the month |
| `GET` | `/api/instagram/creator-monthly-top-10` | Public | Get top 10 creators for the month |
| `GET` | `/api/instagram/top-hits` | Public | Get weekly top hit posts |
| `GET` | `/api/instagram/media-chart` | Public | Get all media chart data |
| `GET` | `/api/instagram/media-chart/:date` | Public | Get media chart data for a specific date |
| `GET` | `/api/instagram/rankings/media` | Public | Get filtered media rankings |

**Query params for `GET /api/instagram/rankings/media`:**

| Param | Type | Description |
|---|---|---|
| `country` | string | Filter by country |
| `category` | string | Filter by category |

---

### Categories — `/api/categories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List all categories |
| `GET` | `/api/categories/:id` | Public | Get a specific category |
| `POST` | `/api/categories` | Public | Create a new category |
| `PUT` | `/api/categories/:id` | Public | Update a category |
| `DELETE` | `/api/categories/:id` | Public | Delete a category |
| `PUT` | `/api/categories/reorder` | Public | Reorder categories |

---

### Sub-Categories — `/api/sub-categories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/sub-categories` | Public | List all sub-categories (optional `?categoryId=`) |
| `GET` | `/api/sub-categories/:id` | Public | Get a specific sub-category |
| `POST` | `/api/sub-categories` | Public | Create a new sub-category |
| `POST` | `/api/sub-categories/find-or-create` | Admin | Find existing or create sub-category |
| `PUT` | `/api/sub-categories/:id` | Public | Update a sub-category |
| `DELETE` | `/api/sub-categories/:id` | Public | Delete a sub-category |

---

### Countries — `/api/countries`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/countries` | Public | List all countries (optional `?active=true|false`) |
| `GET` | `/api/countries/:id` | Public | Get a specific country |
| `POST` | `/api/countries` | Public | Create a new country |
| `PUT` | `/api/countries/:id` | Public | Update a country |
| `DELETE` | `/api/countries/:id` | Public | Delete a country |
| `PATCH` | `/api/countries/:id/suspend` | Public | Suspend a country |
| `PATCH` | `/api/countries/:id/activate` | Public | Activate a suspended country |

---

### Email — `/api/email`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/email/send` | Admin | Send bulk email to selected recipients |

**Request body for `POST /api/email/send`:**

```json
{
  "recipientMode": "all | approved | pending | category | selected",
  "category": "category-id (when recipientMode is 'category')",
  "userIds": ["id1", "id2"],
  "subject": "Email subject",
  "message": "Email body content"
}
```

---

### Activities — `/api/activities`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/activities?limit=N` | User | Get recent platform activity feed |

---

## Routing

Routes are defined in [src/routes/index.jsx](src/routes/index.jsx) using React Router v7's `createBrowserRouter`.

| Path | Page | Guard |
|---|---|---|
| `/` | Redirect to `/dashboard` | — |
| `/login` | LoginPage | GuestRoute |
| `/dashboard` | DashboardPage | ProtectedRoute |
| `/dashboard/users` | UsersPage | ProtectedRoute |
| `/dashboard/users/approved` | UsersStatusPage (approved) | ProtectedRoute |
| `/dashboard/users/pending` | UsersStatusPage (pending) | ProtectedRoute |
| `/dashboard/users/rejected` | UsersStatusPage (rejected) | ProtectedRoute |
| `/dashboard/users/:id` | UserDetailPage | ProtectedRoute |
| `/dashboard/posts` | PostsPage | ProtectedRoute |
| `/dashboard/posts/compare` | ComparePostsPage | ProtectedRoute |
| `/dashboard/posts/:id` | PostDetailPage | ProtectedRoute |
| `/dashboard/categories/users` | CategoriesUsersPage | ProtectedRoute |
| `/dashboard/categories/posts` | CategoriesPostsPage | ProtectedRoute |
| `/dashboard/sub-categories` | SubCategoriesPage | ProtectedRoute |
| `/dashboard/rankings/top-creators` | TopCreatorsPage | ProtectedRoute |
| `/dashboard/rankings/top-hits` | TopHitsPage | ProtectedRoute |
| `/dashboard/rankings/posts` | PostRankingsPage | ProtectedRoute |
| `/dashboard/rankings/posts/:id` | PostRankingDetailPage | ProtectedRoute |
| `/dashboard/rankings/formula-test` | FormulaTestPage | ProtectedRoute |
| `/dashboard/email` | EmailPage | ProtectedRoute |
| `/dashboard/admin` | AdminPage | ProtectedRoute |
| `/dashboard/countries` | CountriesPage | ProtectedRoute |
