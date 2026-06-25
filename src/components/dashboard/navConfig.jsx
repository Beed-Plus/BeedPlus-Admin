import { BookmarkIcon } from "../icons";
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
  WatchlistIcon,
  WatchIcon,
  ReviewIcon,
  ScenesIcon,
} from "../ui/icons";

const navConfig = [
  {
    section: "General",
    items: [{ label: "Overview", path: "/dashboard", icon: DashboardIcon }],
  },
  {
    section: "Management",
    items: [
      {
        label: "Users",
        path: "/dashboard/users",
        icon: UsersIcon,
        children: [
          {
            label: "Approved",
            path: "/dashboard/users/approved",
            icon: UsersIcon,
          },
          {
            label: "Deferred",
            path: "/dashboard/users/deferred",
            icon: UsersIcon,
          },
          {
            label: "Pending",
            path: "/dashboard/users/pending",
            icon: UsersIcon,
          },
        ],
      },
      { label: "Media", path: "/dashboard/posts", icon: PostsIcon },
      {
        label: "Review",
        path: "/dashboard/media-review",
        icon: ReviewIcon,
        children: [
          {
            label: "Deferred",
            path: "/dashboard/media-review/deferred",
            icon: UsersIcon,
          },
          {
            label: "Pending",
            path: "/dashboard/media-review/pending",
            icon: UsersIcon,
          },
        ],
      },
      {
        label: "Compare",
        path: "/dashboard/posts/compare",
        icon: CompareIcon,
      },
    ],
  },
  {
    section: "Organization",
    items: [
      // { label: 'Categories (Users)', path: '/dashboard/categories/users', icon: CategoriesUsersIcon },
      {
        label: "Categories",
        path: "/dashboard/categories/posts",
        icon: CategoriesPostsIcon,
      },
      {
        label: "Sub-Categories",
        path: "/dashboard/sub-categories",
        icon: SubCategoriesIcon,
      },
      { label: "Countries", path: "/dashboard/countries", icon: CountryIcon },
    ],
  },
  {
    section: "Analytics",
    items: [
      {
        label: "Creators",
        path: "/dashboard/rankings/top-creators",
        icon: TrophyIcon,
      },
      // {
      //   label: "Top Hits",
      //   path: "/dashboard/rankings/top-hits",
      //   icon: TopHitsIcon,
      // },
      {
        label: "Charts",
        path: "/dashboard/rankings/posts",
        icon: RankingsIcon,
      },
      { label: "Scenes", path: "/dashboard/scenes", icon: ScenesIcon },
    ],
  },
  {
    section: "Tools",
    items: [
      {
        label: "Tester",
        path: "/dashboard/rankings/formula-test",
        icon: CategoriesPostsIcon,
      },
      { label: "Emailing", path: "/dashboard/email", icon: EmailIcon },
    ],
  },
];

export default navConfig;
