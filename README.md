# BeedPlus Admin Dashboard

Internal administration panel for the BeedPlus platform — a social media aggregation and ranking system built around Instagram content creators. Admins use this dashboard to manage users, media posts, rankings, categories, countries, bulk emails, watchlists, and to monitor content through a built-in video player.

> **Access is restricted to users with the `admin` or `super_admin` role.**

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Authentication & Access Control](#authentication--access-control)
- [Pages & Features](#pages--features)
  - [Dashboard Overview](#dashboard-overview)
  - [Users](#users)
  - [Posts](#posts)
  - [Rankings](#rankings)
  - [Categories](#categories)
  - [Sub-Categories](#sub-categories)
  - [Countries](#countries)
  - [Email](#email)
  - [Watchlist](#watchlist)
  - [Watch Feed](#watch-feed)
  - [Admin Settings](#admin-settings)
- [Navigation](#navigation)
- [Layouts](#layouts)
- [Components](#components)
- [Hooks](#hooks)
- [API Utilities](#api-utilities)
- [State Management](#state-management)
- [Theming & Styling](#theming--styling)
- [Watch Feed — Technical Deep Dive](#watch-feed--technical-deep-dive)
- [Backend Integration](#backend-integration)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Library | React | 19 |
| Routing | React Router | 7 |
| Styling | Tailwind CSS | 4 (via `@tailwindcss/vite`) |
| Build Tool | Vite | 7 |
| Maps | react-simple-maps + topojson-client | 3 / 3 |
| Date Picker | react-day-picker | 9 |
| Runtime types | prop-types | 15 |

No Redux, no Zustand. Global state is limited to auth (React Context). Everything else is local `useState` per page.

---

## Getting Started

### Prerequisites

- Node.js 18+
- BeedPlus Backend API running (see `../BeedPlus-Backend`)

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server — default: http://localhost:5173
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:4000
VITE_APP_URL=http://localhost:5173
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the BeedPlus Backend API. All `apiFetch` calls prefix with this. Leave empty for same-origin (production). |
| `VITE_APP_URL` | URL of this admin app. Used for canonical meta tags. |

All Vite env variables must begin with `VITE_` to be exposed in the browser bundle via `import.meta.env`.

---

## Project Structure

```
BeedPlus-admin/
├── public/
│   └── small-logo.png
├── src/
│   ├── App.jsx                          # Root: AuthProvider wraps RouterProvider
│   ├── main.jsx                         # Entry point — StrictMode + ReactDOM.createRoot
│   ├── index.css                        # @import "tailwindcss" + custom scrollbar + dark overrides
│   │
│   ├── context/
│   │   └── AuthContext.jsx              # Auth state, login(), logout(), auto-logout on 401
│   │
│   ├── hooks/
│   │   ├── useAuth.js                   # Access AuthContext
│   │   ├── useTheme.js                  # Dark mode toggle + localStorage persistence
│   │   ├── useApiCall.js                # Generic async wrapper: { run, data, loading, error, reset }
│   │   ├── useInstagram.js              # Instagram/media API methods with token injection
│   │   ├── useCategories.js             # Category CRUD methods
│   │   ├── useSubCategories.js          # Sub-category CRUD methods
│   │   ├── useCountries.js              # Country CRUD + suspend/activate methods
│   │   ├── useUsers.js                  # User CRUD + role/category methods
│   │   └── uesScenes.js              # Watchlist state with optimistic add/remove
│   │
│   ├── layouts/
│   │   ├── AuthLayout.jsx               # Split-panel: form left, orange graphic right
│   │   └── DashboardLayout.jsx          # Sidebar + scrollable main content area
│   │
│   ├── routes/
│   │   ├── index.jsx                    # createBrowserRouter — all routes defined here
│   │   ├── ProtectedRoute.jsx           # Redirects to /login when no token
│   │   └── GuestRoute.jsx               # Redirects to /dashboard when already logged in
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   └── dashboard/
│   │       ├── DashboardPage.jsx
│   │       ├── admin/
│   │       │   └── AdminPage.jsx
│   │       ├── users/
│   │       │   ├── UsersPage.jsx        # List with filters + approve/reject/delete
│   │       │   └── UserDetailPage.jsx   # Full profile, role edit, category assign
│   │       ├── posts/
│   │       │   ├── PostsPage.jsx        # Media list with watchlist toggle
│   │       │   ├── PostDetailPage.jsx   # Daily insights chart + metadata
│   │       │   └── ComparePostsPage.jsx # Side-by-side post comparison
│   │       ├── rankings/
│   │       │   ├── TopCreatorsPage.jsx
│   │       │   ├── TopHitsPage.jsx
│   │       │   ├── PostRankingsPage.jsx
│   │       │   ├── PostRankingDetailPage.jsx
│   │       │   └── FormulaTestPage.jsx
│   │       ├── categories/
│   │       │   ├── CategoriesPostsPage.jsx
│   │       │   └── CategoriesUsersPage.jsx
│   │       ├── sub-categories/
│   │       │   └── SubCategoriesPage.jsx
│   │       ├── countries/
│   │       │   └── CountriesPage.jsx
│   │       ├── email/
│   │       │   └── EmailPage.jsx
│   │       ├── watchlist/
│   │       │   └── WatchlistPage.jsx
│   │       └── watch/
│   │           └── WatchPage.jsx        # Full-screen video player (Top 100)
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── icons.jsx                # Central SVG icon registry
│   │   │   ├── Input.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Checkbox.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── Breadcrumb.jsx
│   │   ├── auth/
│   │   │   ├── BeedLogo.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   └── AnalyticsCard.jsx
│   │   └── dashboard/
│   │       ├── Sidebar.jsx
│   │       ├── navConfig.jsx
│   │       ├── StatCard.jsx
│   │       ├── RecentActivity.jsx
│   │       ├── users/                   # UserTable, UserFilters, UserActions, UserAvatar
│   │       ├── posts/                   # PostTable, PostMetaSidebar, PostThumbnail, PostStatCard
│   │       ├── rankings/                # TopCreatorsTable, TopHitsTable, CreatorHighlightCards, etc.
│   │       ├── categories/              # CategoriesLayout, CategoryTable, CategoryStatCard
│   │       ├── countries/               # UserWorldMap
│   │       └── email/                   # ComposePanel, RecipientsTable
│   │
│   └── utils/
│       ├── api.js                       # apiFetch() base wrapper + proxyVideoUrl()
│       ├── authApi.js
│       ├── usersApi.js
│       ├── instagramApi.js
│       ├── categoriesApi.js
│       ├── subCategoriesApi.js
│       ├── countriesApi.js
│       ├── emailApi.js
│       ├── scenesApi.js
│       └── activitiesApi.js
│
├── index.html
├── vite.config.js
├── package.json
└── eslint.config.js
```

---

## Authentication & Access Control

### Login Flow

1. Admin submits credentials on `/login`.
2. `POST /api/auth/login` returns `{ token, user }`.
3. `AuthContext.login()` validates that `user.role` is `admin` or `super_admin`. Any other role is rejected immediately with an error message — the token is never stored.
4. On success, `{ token, user }` is persisted to `localStorage` under key `beedplus_admin_auth` and set in React context.
5. The router redirects to `/dashboard`.

### Session Persistence

`AuthContext` reads from `localStorage` on every page load, so sessions survive browser refreshes without requiring re-login.

### Auto-Logout on 401

`apiFetch` dispatches a custom `auth:unauthorized` DOM event on every 401 response. `AuthContext` listens for this event and calls `logout()` automatically — clearing state and localStorage — regardless of which component made the failing request. No per-page 401 handling is needed.

### Route Guards

| Guard | Behaviour |
|---|---|
| `ProtectedRoute` | Redirects to `/login` if `auth.token` is falsy. Preserves the intended path in router state so the user is returned there after login. |
| `GuestRoute` | Redirects to `/dashboard` if `auth.token` is truthy. Prevents logged-in admins from seeing the login page. |

### Roles

| Role | Access |
|---|---|
| `admin` | Full dashboard access |
| `super_admin` | Full dashboard access |
| Any other role | Blocked at login — never enters the app |

---

## Pages & Features

### Route Map

```
/                               → redirect to /dashboard
/login                          → LoginPage               [GuestRoute]
/dashboard                      → DashboardPage            [ProtectedRoute]
  users/                        → UsersPage (all)
  users/approved                → UsersPage (pre-filtered)
  users/pending                 → UsersPage (pre-filtered)
  users/rejected                → UsersPage (pre-filtered)
  users/:id                     → UserDetailPage
  posts/                        → PostsPage
  posts/compare                 → ComparePostsPage
  posts/:id                     → PostDetailPage
  rankings/top-creators         → TopCreatorsPage
  rankings/top-hits             → TopHitsPage
  rankings/posts                → PostRankingsPage
  rankings/posts/:id            → PostRankingDetailPage
  rankings/formula-test         → FormulaTestPage
  categories/posts              → CategoriesPostsPage
  categories/users              → CategoriesUsersPage
  sub-categories/               → SubCategoriesPage
  countries/                    → CountriesPage
  email/                        → EmailPage
  watchlist/                    → WatchlistPage
  watch/                        → WatchPage
  admin/                        → AdminPage
```

---

### Dashboard Overview

**Route:** `/dashboard`

Summary page showing platform-wide metrics:

- **Stat cards** — total users, approved users, total posts, active countries.
- **Recent activity feed** — scrollable timeline of platform events: media submissions, ranking updates, user sign-ups, approvals, Instagram connections and disconnections. Each activity type has a distinct colour and icon. Data comes from `GET /api/activities`.

---

### Users

**Routes:** `/dashboard/users`, `/dashboard/users/approved`, `/dashboard/users/pending`, `/dashboard/users/rejected`, `/dashboard/users/:id`

#### User List

Paginated table of all registered users.

**Columns:** avatar, Instagram username, email, follower count, category, country, gender, approval status, joined date.

**Filters:**
- Free-text search (username or email)
- Follower sort (ascending / descending)
- Category
- Country
- Gender
- Approval status

The sub-routes `/approved`, `/pending`, `/rejected` pre-apply the approval status filter so admins can jump directly to a specific queue.

**Row actions:**
| Action | API call |
|---|---|
| View | Navigate to `/dashboard/users/:id` |
| Approve | `PATCH /api/users/:id` `{ approvalStatus: 'approved' }` |
| Reject | `PATCH /api/users/:id` `{ approvalStatus: 'rejected' }` |
| Delete | `DELETE /api/users/:id` (with confirmation) |

#### User Detail (`/dashboard/users/:id`)

Full profile view for a single user:

- **Profile information** — name, email, role, Instagram username, follower count, bio, gender, joined date.
- **Instagram stats** — profile picture, reach, impressions.
- **Role management** — change role between `user`, `admin`, `campaign_manager`, `super_admin` via dropdown.
- **Category & Country assignment** — selecting a new value triggers a confirmation email to the user automatically (fire-and-forget, non-blocking).
- **Submitted posts** — list of the user's submitted media with status indicators.
- **Danger zone** — permanently delete the account.

---

### Posts

**Routes:** `/dashboard/posts`, `/dashboard/posts/:id`, `/dashboard/posts/compare`

#### Post List (`/dashboard/posts`)

Browse all Instagram media submissions to the platform.

**Columns:** thumbnail, caption (truncated), creator username, category, sub-category, country, reach, likes, comments, saves, submission date.

**Filters:** free-text search, category, sub-category, country.

**Watchlist toggle** — each row has a heart icon button that adds/removes the post from the admin watchlist using optimistic UI (the icon updates instantly before the API call resolves).

#### Post Detail (`/dashboard/posts/:id`)

Deep dive into a single media item:

- **Media preview** — thumbnail image or video with link to original Instagram post.
- **Engagement metrics** — reach, likes, comments, saves, shares, lifetime views.
- **Daily insights chart** — line graph of reach over time using the `dailyInsights` array.
- **Category & sub-category assignment** — update via dropdowns.
- **Ranking score** — current Beed+ score with formula breakdown.

#### Compare Posts (`/dashboard/posts/compare`)

Select multiple posts from the table and view them side-by-side. Useful for evaluating content quality, engagement rates, or ranking fairness across posts.

---

### Rankings

#### Top Creators (`/dashboard/rankings/top-creators`)

Monthly leaderboard of content creators ranked by their Beed+ creator score.

- **Highlight cards** — featured card for #1 creator, total active creators, count of filtered creators.
- **Sortable table** — rank, profile picture, username, follower count, post count, monthly score, category.
- **Category filter** — narrow to a specific category.

Data: `GET /api/instagram/creator-monthly-top-100`

#### Top Hits (`/dashboard/rankings/top-hits`)

Best-performing individual media posts for the current period.

- Featured top-post card with large thumbnail and headline metrics.
- Ranked table of all top-hit posts below.
- Metrics: lifetime views, likes, comments, saves, reach.

Data: `GET /api/instagram/top-hits`

#### Media Charts (`/dashboard/rankings/posts`)

All media with a meaningful reach score. Sortable and filterable.

- Date picker to view rankings on any historical date.
- Columns: rank, thumbnail, creator, category, daily reach, Beed Score.
- Click any row to open the ranking detail page.

Data: `GET /api/instagram/rankings-by-date/:date` or `GET /api/instagram/media-chart`

#### Ranking Detail (`/dashboard/rankings/posts/:id`)

Historical deep dive for a single ranked media item:

- Daily reach chart over time.
- Ranking score trend.
- Full metadata panel.

#### Formula Tester (`/dashboard/rankings/formula-test`)

Developer utility for tuning the ranking score formula. Allows testing formula variations against live data without affecting the live rankings stored in the database.

---

### Categories

**Routes:** `/dashboard/categories/posts`, `/dashboard/categories/users`

Full CRUD interface for managing content categories:

- **Add** — create a new category with a name and a colour (colour picker).
- **Edit** — update name or colour inline.
- **Delete** — remove with confirmation.
- **Reorder** — drag-and-drop to change display order. Persisted via `PUT /api/categories/reorder` with the new ID array.

The `/categories/users` view shows category distribution across registered users.

---

### Sub-Categories

**Route:** `/dashboard/sub-categories`

Manage sub-categories, each linked to a parent category:

- Filter the list by parent category via dropdown.
- Create new sub-categories (with `findOrCreate` logic to prevent duplicates).
- Edit or delete existing sub-categories.

---

### Countries

**Route:** `/dashboard/countries`

Manage the list of supported countries on the platform:

- **Interactive world map** — choropleth showing user count per country, rendered with `react-simple-maps`.
- **Country table** — name, ISO code, user count, active status.
- **Create / Edit** — add new countries or update existing ones.
- **Suspend** — hide a country from user sign-up without deleting its data. Existing users in that country are unaffected.
- **Activate** — re-enable a suspended country.
- **Delete** — permanently remove.

---

### Email

**Route:** `/dashboard/email`

Bulk email composer for admin-to-user communications.

**Recipient modes:**

| Mode | Who receives it |
|---|---|
| `all` | Every registered user |
| `approved` | Users with `approvalStatus: approved` |
| `pending` | Users awaiting approval |
| `category` | All users assigned to a specific category |
| `selected` | Specific users chosen via the recipient table |

**Flow:**
1. Select recipient mode.
2. (If `category`) choose a category from the dropdown.
3. (If `selected`) check users in the recipient table.
4. Write a subject and message body.
5. Click **Send** → `POST /api/email/send`.

The recipient table shows a live preview of who will receive the email before sending.

---

### Watchlist

**Route:** `/dashboard/watchlist`

Admin-curated list of media being actively monitored. Useful for tracking controversial content, verifying data integrity, or following specific creator campaigns.

- Filter by category and country.
- Remove items from the watchlist.
- Items can also be added/removed directly from the **Posts** page table via the heart icon button.
- Powered by `uesScenes` hook with optimistic UI updates and a `Set` for O(1) membership checks.

---

### Watch Feed

**Route:** `/dashboard/watch`

A TikTok / Instagram Reels–style full-screen video player for browsing the current Top 100 ranked posts.

See [Watch Feed — Technical Deep Dive](#watch-feed--technical-deep-dive) for implementation details.

**Grid view:**
- Fetches all 100 videos in one request via `GET /api/instagram/watch-feed?page=1&limit=100`.
- Responsive thumbnail grid: 2 → 3 → 4 → 5 columns across breakpoints.
- Each tile shows: thumbnail image, hover-to-preview video clip, rank badge, creator username.
- Clicking a tile opens the full-screen player starting at that video's index.
- Filter by country via dropdown.

**Full-screen player:**
- Scroll vertically to move between videos (scroll-snap).
- Right-side controls: Previous, Play/Pause, Next, Mute/Unmute.
- Keyboard shortcuts: `↑` / `←` = previous, `↓` / `→` = next, `Esc` = close.
- Non-active slides show a blurred, dimmed thumbnail for spatial context.
- Videos auto-advance when finished.

---

### Admin Settings

**Route:** `/dashboard/admin`

Profile and account management for the currently logged-in admin:

- View and update name, email, phone, bio.
- Change password with current password verification and confirmation field.

---

## Navigation

Navigation is driven by a single config file: [src/components/dashboard/navConfig.jsx](src/components/dashboard/navConfig.jsx).

To add, remove, or reorder a nav item, edit this file — the `Sidebar` renders from it automatically.

**Structure:**

```js
[
  {
    // No section label — top-level items
    items: [
      { label: 'Dashboard',     path: '/dashboard',              icon: DashboardIcon },
      { label: 'Users',         path: '/dashboard/users',        icon: UsersIcon,
        children: [
          { label: 'Approved',  path: '/dashboard/users/approved' },
          { label: 'Pending',   path: '/dashboard/users/pending' },
          { label: 'Rejected',  path: '/dashboard/users/rejected' },
        ]
      },
      { label: 'Posts',         path: '/dashboard/posts',         icon: PostsIcon },
      { label: 'Watch',         path: '/dashboard/watch',         icon: WatchIcon },
      { label: 'Watchlist',     path: '/dashboard/watchlist',     icon: WatchlistIcon },
      { label: 'Compare Posts', path: '/dashboard/posts/compare', icon: CompareIcon },
      { label: 'Countries',     path: '/dashboard/countries',     icon: CountryIcon },
    ],
  },
  {
    section: 'Category',
    items: [
      { label: 'Categories',    path: '/dashboard/categories/posts', icon: CategoriesIcon },
      { label: 'Sub-Categories',path: '/dashboard/sub-categories',   icon: SubCategoriesIcon },
    ],
  },
  {
    section: 'Charts',
    items: [
      { label: 'Top Creators',  path: '/dashboard/rankings/top-creators',  icon: TrophyIcon },
      { label: 'Top Hits',      path: '/dashboard/rankings/top-hits',       icon: TopHitsIcon },
      { label: 'Media Charts',  path: '/dashboard/rankings/posts',          icon: RankingsIcon },
      { label: 'Formula Tester',path: '/dashboard/rankings/formula-test',   icon: FormulaIcon },
    ],
  },
  {
    section: 'Messaging',
    items: [
      { label: 'Email Users',   path: '/dashboard/email', icon: EmailIcon },
    ],
  },
]
```

All SVG icons used in nav items are defined in [src/components/ui/icons.jsx](src/components/ui/icons.jsx).

---

## Layouts

### `AuthLayout`

Two-column layout used for the login page:
- **Left panel** — white background, contains the login form via `<Outlet />`. Full width on mobile.
- **Right panel** — orange-to-amber gradient background with a decorative `AnalyticsCard`. Hidden on mobile (`hidden md:flex`).

### `DashboardLayout`

Main shell for all authenticated pages:
- Fixed `Sidebar` on the left.
- Flexible `main` content area on the right (`flex-1 overflow-y-auto`).
- Mobile top bar with hamburger menu and "Beed+ Admin" logo.
- Manages theme state (`useTheme`) and passes `dark` + `toggleTheme` down to `Sidebar`.
- Applies `dark` class support via Tailwind's class-based dark mode.

---

## Components

### `Sidebar`

Fixed left navigation panel. Reads from `navConfig` to render groups, items, and collapsible sub-menus. Uses React Router `NavLink` for active highlighting. Includes:
- Admin name, role, and avatar initials at the top.
- Dark mode toggle.
- Logout button (calls `AuthContext.logout()`).
- Collapses to overlay on mobile.

### `StatCard`

Reusable metric display card.

Props: `label` (string), `value` (number/string), `icon` (JSX), `loading` (bool), `to` (optional route string for navigation).

### `RecentActivity`

Activity timeline fetched from `GET /api/activities`. Renders a list of typed events, each with a distinct colour and icon. Supported event types include media submissions, ranking updates, user sign-ups, approvals, and Instagram connection events.

### `UserTable`

Paginated sortable data table for users. Handles filtering, pagination, status badge rendering, and inline action buttons (view, approve, delete).

### `PostTable`

Data table for media posts. Displays thumbnails, engagement metrics, and a watchlist toggle button per row. Integrates with `uesScenes` for the toggle state.

### `CategoriesLayout`

Full CRUD UI for categories. Manages the add/edit form, the category list, colour picker, and drag-to-reorder functionality. Calls `reorderCategories()` on drop.

### `UserWorldMap`

Interactive world map rendered with `react-simple-maps`. Shades countries by user count. Hovering a country shows a tooltip with its user count.

### `ComposePanel`

Email compose form. Controls recipient mode selection, category/user selection, subject, and message. Exposes a `send()` callback for the parent page.

### `RecipientsTable`

Table of users that can be selected individually for the `selected` recipient mode. Shows name, email, category, country, and a checkbox per row.

### UI Primitives

| Component | Description |
|---|---|
| `Input` | Rounded text input, orange focus ring |
| `Button` | Orange-500 filled button, full-width by default |
| `Checkbox` | Styled checkbox with orange checked state |
| `Badge` | Small text chip |
| `StatusBadge` | Coloured dot + label: green=approved, yellow=pending, red=rejected |
| `Pagination` | Prev/Next + page number buttons |
| `Breadcrumb` | Hierarchical path indicator |
| `icons.jsx` | All SVG icons as named exports — add new icons here |

---

## Hooks

### `useAuth()`

```js
const { auth, login, logout } = useAuth()
// auth.token — JWT string or null
// auth.user  — { _id, name, email, role, ... } or null
```

- `login(email, password)` — async, throws if role is not admin/super_admin.
- `logout()` — clears localStorage and React state.

### `useTheme()`

```js
const { dark, toggleTheme } = useTheme()
```

Reads initial preference from `localStorage` or `prefers-color-scheme`. Toggles `dark` class on `<html>`. Persists to `localStorage`.

### `useApiCall(fn)`

Generic async call wrapper.

```js
const { run, data, loading, error, reset } = useApiCall(myAsyncFn)
await run(arg1, arg2)
```

- `loading` is true while the promise is pending.
- `error` holds the error message string on failure.
- `reset()` clears all state back to defaults.

### `uesScenes()`

```js
const { watchlistedIds, add, remove, loading } = uesScenes()
watchlistedIds.has(mediaId) // O(1) lookup
```

- Fetches the full watchlist on mount.
- `watchlistedIds` is a `Set` — checking if any post is watchlisted is O(1), important for large tables.
- `add(mediaId)` and `remove(mediaId)` update the Set immediately (optimistic) before the API call resolves.

### `useInstagram()` / `useCategories()` / `useSubCategories()` / `useCountries()` / `useUsers()`

These hooks wrap their corresponding `*Api.js` module and inject the auth token automatically. They expose all the API methods, ready to call without manually handling headers.

---

## API Utilities

### `apiFetch(path, options)`

The single HTTP client used everywhere (`src/utils/api.js`).

```js
// GET
const data = await apiFetch('/api/users', { token: auth.token })

// POST
const data = await apiFetch('/api/users', {
  method: 'POST',
  body: { name: 'John' },
  token: auth.token,
})
```

**Behaviour:**
- Sets `Content-Type: application/json`.
- Appends `Authorization: Bearer <token>` when token is provided.
- Parses the JSON response body.
- On non-2xx: throws `new Error(data.message ?? 'Request failed (status)')`.
- On 401: dispatches `auth:unauthorized` DOM event before throwing, triggering auto-logout via `AuthContext`.

### `proxyVideoUrl(url)`

Converts an Instagram CDN video URL into a same-origin proxy URL:

```js
proxyVideoUrl('https://cdninstagram.com/v/...')
// → 'http://localhost:4000/api/proxy/video?url=https%3A%2F%2Fcdninstagram.com...'
```

Used to route video requests through the backend proxy, which handles Range-request forwarding for iOS Safari byte-range streaming. See [Backend Integration](#backend-integration) for proxy details.

### API Modules (`src/utils/`)

| Module | Key methods |
|---|---|
| `authApi.js` | `login`, `signup`, `verifyEmail`, `forgotPassword`, `resetPassword`, `instagramConnect`, `approveInstagramConnect`, `resetInstagramConnect` |
| `usersApi.js` | `getUsers`, `getUserById`, `getMe`, `updateMe`, `changePassword`, `updateUserRole`, `updateUserCategory`, `deleteUser` |
| `instagramApi.js` | `getDailyTop100`, `getDailyTop10`, `getWatchFeed`, `getCreatorRankings`, `getTopHits`, `getMediaChart`, `getAllSubmittedMediaForAdmin`, `getMediaByIdForAdmin`, `updateMediaCategory`, `submitMedia`, `getOembed`, `recordClick`, `disconnect` |
| `categoriesApi.js` | `getCategories`, `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory`, `reorderCategories` |
| `subCategoriesApi.js` | `getSubCategories`, `createSubCategory`, `updateSubCategory`, `deleteSubCategory`, `findOrCreate` |
| `countriesApi.js` | `getCountries`, `createCountry`, `updateCountry`, `deleteCountry`, `suspendCountry`, `activateCountry` |
| `emailApi.js` | `sendBulkEmail` |
| `scenesApi.js` | `getScenes`, `updateScene`, `removeFromWatchlist` |
| `activitiesApi.js` | `getActivities` |

---

## State Management

| Layer | Mechanism |
|---|---|
| Auth (token + user) | `AuthContext` + `localStorage` — shared across the whole app |
| Theme (dark mode) | `useTheme` hook + `localStorage` + `document.documentElement.classList` |
| Watchlist | `uesScenes` hook — optimistic updates, `Set` for O(1) lookup |
| Page data | Local `useState` + `useEffect` in each page component — no caching between navigations |

There is no global data store. Pages fetch fresh data on mount.

---

## Theming & Styling

- **Tailwind CSS v4** — configured via `@tailwindcss/vite`. No `tailwind.config.js` file is required.
- **Dark mode** — class-based (`dark:` prefix). The `dark` class is toggled on `<html>` by `useTheme`.
- **Brand colour** — `orange-500` (`#f97316`) used for buttons, focus rings, active nav links, badges, and chart accents.
- **Scrollbars** — globally hidden/minimal via custom CSS in `index.css`.
- **Date Picker** — `react-day-picker` styled with orange CSS custom properties in `index.css`.

### Design Conventions

| Element | Classes |
|---|---|
| Cards | `rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900` |
| Inputs | `rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-400` |
| Buttons | `rounded-xl bg-orange-500 text-white hover:bg-orange-600` |
| Tables | `divide-y divide-gray-100 dark:divide-gray-800` |
| Status: approved | `green` |
| Status: pending | `yellow` |
| Status: rejected | `red` |

---

## Watch Feed — Technical Deep Dive

The Watch page (`/dashboard/watch`) uses a **3 persistent video elements** architecture, mirroring how TikTok/Instagram handle seamless video scroll performance.

### Why 3 elements?

Most naive implementations create one `<video>` DOM element per slide. With 100 slides this means 100 elements in the DOM, each of which the browser tries to manage. The 3-element approach maintains exactly:

```
prevRef     — the video before current  (preload="metadata")
currentRef  — the currently playing video  (preload="auto")
nextRef     — the video after current   (preload="metadata")
```

No matter how many videos are loaded, only these 3 `<video>` DOM elements ever exist.

### VideoPortal

When `activeIdx` changes, a `VideoPortal` component physically moves `currentRef` into the active slide's DOM node via `host.appendChild(video)`. This makes the video the visual content of that slide — no z-index tricks needed.

On unmount (when the slide is no longer active), the `VideoPortal` cleanup function moves the video back into a hidden parking container (`parkRef`) rather than letting React remove it from the DOM. This is critical: **removing a video element from the DOM resets its buffering state on iOS Safari**, causing the next play to buffer from scratch.

```
Normal mount cycle (slide 3 → slide 4):
  1. VideoPortal for slide 3 unmounts → video moved to parkRef (stays in DOM)
  2. VideoPortal for slide 4 mounts → video moved from parkRef to slide 4
  3. bindSource updates src if needed
  4. playCurrent() resumes playback
```

### Source Binding

`bindSource(el, url)` checks `el.dataset.src === url` before touching the element. If the URL hasn't changed, it skips `pause()` + `src =` + `load()` entirely. This means fast-scrolling back to a recently seen video costs nothing — no re-request, no re-buffer.

### Scroll Detection

A scroll-snap container stacks over the video layer. Each slide is a `height: 100dvh` div with `scroll-snap-align: start`.

Index detection uses scroll position math:

```js
const slideH = slideRefs.current[0]?.offsetHeight || el.clientHeight
const idx = Math.round(el.scrollTop / slideH)
```

`slideRefs[0].offsetHeight` (the actual rendered pixel height) is used instead of `window.innerHeight`, which can drift on iOS Safari when the address bar shows/hides — causing the wrong video to activate.

A 120 ms debounce is applied so that fast-scrolling through multiple slides only fires the update **after the user stops scrolling**, not on every intermediate position. This means prev/current/next sources are only rebound for the slide the user actually lands on — not for every slide they passed through.

### Mute Handling

React's `muted` prop on `<video>` is a known bug — it doesn't update the DOM attribute dynamically after mount. Mute state is set **imperatively** (`video.muted = true/false`) whenever the mute button is tapped or when `playCurrent()` runs.

### Auto-Advance

An `ended` event listener is attached directly to `currentRef` on mount (not via React's `onEnded` prop, since the element is moved via DOM manipulation). When the video ends, it calls `scrollIntoView` on the next slide, which triggers the scroll handler and loads the next video.

### Non-Active Slide Thumbnails

Slides that are not the active video show the post's thumbnail image, dimmed (`opacity-40`) and blurred (`blur-sm`). `scale-105` hides the blur-edge artifacts at slide boundaries. This gives the user visual context of what's coming without loading additional video data.

---

## Backend Integration

The admin connects to the BeedPlus backend (configured via `VITE_API_URL`, default: `http://localhost:4000`).

### Authentication Header

Every authenticated API request includes:

```
Authorization: Bearer <JWT>
```

The token is read from `AuthContext` and passed into every `apiFetch` call via the `token` option.

### Key API Prefixes

| Prefix | Purpose |
|---|---|
| `/api/auth/*` | Login, password reset, Instagram OAuth |
| `/api/users/*` | User CRUD, role and category assignment |
| `/api/instagram/*` | Media submissions, rankings, watch feed, charts |
| `/api/categories/*` | Category CRUD + reorder |
| `/api/sub-categories/*` | Sub-category CRUD |
| `/api/countries/*` | Country CRUD + suspend/activate |
| `/api/email/*` | Bulk email dispatch |
| `/api/watchlist/*` | Admin watchlist management |
| `/api/activities/*` | Platform activity log |
| `/api/proxy/video` | Same-origin video proxy for iOS streaming |

### Video Proxy (`/api/proxy/video`)

`GET /api/proxy/video?url=<encoded-instagram-cdn-url>`

The backend proxy:
- **Whitelists** only `cdninstagram.com`, `fbcdn.net`, `instagram.com` — other hosts are rejected with 403.
- **Forwards `Range` headers** from the client, enabling iOS Safari byte-range streaming (partial content, 206 responses).
- **Streams** the upstream response directly to the client without buffering the whole file in Node.js memory.
- **Sets `Cross-Origin-Resource-Policy: cross-origin`** to override Helmet's default `same-origin` policy, which would otherwise block cross-origin video loads.
- **Sets `Cache-Control: public, max-age=3600`** so the browser caches proxied video chunks and avoids repeat requests.

### Watch Feed Endpoint

`GET /api/instagram/watch-feed?page=1&limit=100`

Returns a lean payload — only the fields the player needs:

```json
{
  "items": [
    {
      "instagramMediaId": "...",
      "currentRank": 1,
      "media": {
        "mediaUrl": "https://cdninstagram.com/...",
        "thumbnailUrl": "https://cdninstagram.com/...",
        "permalink": "https://www.instagram.com/p/..."
      },
      "userData": {
        "username": "creator_handle",
        "profilePicture": "https://...",
        "country": "Nigeria"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 100,
    "pages": 1,
    "hasMore": false
  }
}
```

Heavy fields (dailyInsights, insights, beedPlusScore, category, clicks, etc.) are stripped server-side to keep the payload small and the initial load fast.
