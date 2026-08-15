import { Link } from "react-router-dom";

const COL =
  "px-4 py-3 text-left text-[11px] font-semibold tracking-widest text-[#3A3A3AB2]";

function RankBadge({ rank }) {
  if (rank === 1)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-white shadow-lg">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-xs font-black text-white shadow-lg">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-300 text-xs font-black text-white shadow-lg">
        3
      </span>
    );
  return <span className="text-sm font-semibold text-gray-500">#{rank}</span>;
}

function CreatorAvatar({ profilePicture, username }) {
  if (profilePicture) {
    return (
      <img
        src={profilePicture}
        alt={username}
        className="h-10.5 w-10.5 rounded-full object-cover border border-gray-100"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
      {username?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function formatScore(n) {
  if (n == null) return "—";
  return n.toLocaleString();
}

export default function TopCreatorsTable({
  creators,
  loading,
  nested = false,
}) {
  const Wrapper = ({ children }) =>
    nested ? (
      <div className="overflow-x-auto rounded-2xl">{children}</div>
    ) : (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-x-auto">
        {children}
      </div>
    );

  if (loading) {
    return (
      <Wrapper>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-[#433E3E1A] ">
              <th className={COL}></th>
              <th className={COL}>Creators</th>
              <th className={COL}>Category</th>
              <th className={COL}>Posts</th>
              <th className={COL}>Reach</th>
              <th className={COL}>Country</th>
              <th className={COL}>Joined</th>
              <th className={`${COL}`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 dark:border-gray-800/50 last:border-0"
              >
                <td className="px-6 py-4">
                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="h-4 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="ml-auto h-8 w-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Wrapper>
    );
  }
console.log("CREATORS", creators)
  return (
    <Wrapper>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-[#DDDDDD] dark:bg-gray-800/50 sticky top-0 z-10">
            <th className={COL}></th>
            <th className={COL}>Creators</th>
            <th className={COL}>Category</th>
            <th className={COL}>Posts</th>
            <th className={COL}>Reach</th>
            <th className={COL}>Country</th>
            <th className={COL}>Joined</th>
            <th className={`${COL}`}>Action</th>
          </tr>
        </thead>
        <tbody>
          {creators.map((creator, index) => (
            <tr
              key={creator.instagramUsername}
              className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors"
            >
              {/* Rank */}
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {index + 1}
                </span>
              </td>

              {/* Creator */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <CreatorAvatar
                    profilePicture={creator.profilePictureUrl}
                    username={creator.instagramUsername}
                  />
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                    {creator.instagramUsername}
                  </span>
                </div>
              </td>

              {/* Category */}
              <td className="px-6 py-4">
                {creator.category ? (
                  <span className="inline-flex items-center rounded-full dark:bg-gray-800 px-3 py-1 text-xs font-medium text-[#2F3134] dark:text-gray-300">
                    {creator.category}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    —
                  </span>
                )}
              </td>

              {/* Post */}
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {creator.postCount || "—"}
              </td>

              {/* Monthly Reach */}
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {formatScore(creator.monthlyReach)}
                </span>
              </td>

              {/* Country */}
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {creator.country || "—"}
              </td>

              {/* Country */}
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {creator.createdAt || "—"}
              </td>

              {/* Action */}
              <td className="px-6 py-4">
                <Link
                  to={`/dashboard/users/${creator.instagramUsername}`}
                  className="inline-flex items-center rounded-xl bg-[#FFEFD0] px-4 py-2 text-xs font-semibold text-[#9B5A0A] transition"
                >
                  View Profile
                </Link>
              </td>
            </tr>
          ))}

          {creators.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-500"
              >
                No creators found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Wrapper>
  );
}
