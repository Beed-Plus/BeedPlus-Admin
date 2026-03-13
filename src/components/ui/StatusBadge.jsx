const variants = {
  approved: { dot: 'bg-green-500', text: 'text-green-600' },
  pending:  { dot: 'bg-orange-400', text: 'text-orange-500' },
  rejected: { dot: 'bg-red-500', text: 'text-red-500' },
}

export default function StatusBadge({ status }) {
  const key = status.toLowerCase()
  const v = variants[key] ?? variants.pending

  return (
    <span className={`flex items-center gap-1.5 text-sm font-medium ${v.text}`}>
      <span className={`h-2 w-2 rounded-full ${v.dot}`} />
      {status}
    </span>
  )
}
