import {
  DashboardIcon,
  UsersIcon,
  PostsIcon,
  CountryIcon,
  CategoriesUsersIcon,
  CategoriesPostsIcon,
  SubCategoriesIcon,
  TrophyIcon,
  TopHitsIcon,
  RankingsIcon,
  EmailIcon,
} from '../ui/icons'

const navConfig = [
  {
    items: [
      { label: 'Dashboard', path: '/dashboard',          icon: DashboardIcon },
      { label: 'Users',     path: '/dashboard/users',    icon: UsersIcon },
      { label: 'Posts',     path: '/dashboard/posts',    icon: PostsIcon },
      { label: 'Countries', path: '/dashboard/countries', icon: CountryIcon },
    ],
  },
  {
    section: 'Category',
    items: [
      // { label: 'Categories (Users)', path: '/dashboard/categories/users', icon: CategoriesUsersIcon },
      { label: 'Categories', path: '/dashboard/categories/posts', icon: CategoriesPostsIcon },
      { label: 'Sub-Categories', path: '/dashboard/sub-categories', icon: SubCategoriesIcon },
    ],
  },
  {
    section: 'Ranking',
    items: [
      { label: 'Top Creators', path: '/dashboard/rankings/top-creators', icon: TrophyIcon },
      { label: 'Top Hits', path: '/dashboard/rankings/top-hits', icon: TopHitsIcon },
      { label: 'Post Rankings', path: '/dashboard/rankings/posts', icon: RankingsIcon },
    ],
  },
  {
    section: 'Messaging',
    items: [
      { label: 'Email Users', path: '/dashboard/email', icon: EmailIcon },
    ],
  },

]

export default navConfig
