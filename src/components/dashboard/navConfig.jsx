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
  CompareIcon,
  FormulaIcon,
} from '../ui/icons'

const navConfig = [
  {
    items: [
      { label: 'Dashboard', path: '/dashboard',          icon: DashboardIcon },
      {
        label: 'Users',
        path: '/dashboard/users',
        icon: UsersIcon,
        children: [
          { label: 'Approved', path: '/dashboard/users/approved' },
          { label: 'Pending',  path: '/dashboard/users/pending' },
          { label: 'Rejected', path: '/dashboard/users/rejected' },
        ],
      },
      { label: 'Posts',          path: '/dashboard/posts',         icon: PostsIcon },
      { label: 'Compare Posts',  path: '/dashboard/posts/compare', icon: CompareIcon },
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
    section: 'Charts',
    items: [
      { label: 'Top Creators', path: '/dashboard/rankings/top-creators', icon: TrophyIcon },
      { label: 'Top Hits', path: '/dashboard/rankings/top-hits', icon: TopHitsIcon },
      { label: 'Media Charts', path: '/dashboard/rankings/posts', icon: RankingsIcon },
      { label: 'Formula Tester', path: '/dashboard/rankings/formula-test', icon: FormulaIcon },
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
