const COLORS = [
  'bg-orange-400', 'bg-blue-400', 'bg-purple-400',
  'bg-teal-400',  'bg-rose-400',  'bg-indigo-400',
]

function getColor(name) {
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function UserAvatar({ name, src, size = 'md' }) {
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'xl' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm'

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-full object-cover`}
      />
    )
  }

  return (
    <div className={`${dim} ${getColor(name)} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}>
      {initials(name)}
    </div>
  )
}
