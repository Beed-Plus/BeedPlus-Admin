const variants = {
  orange: 'border border-orange-300 bg-orange-50 text-orange-500',
  gray:   'border border-gray-200 bg-gray-50 text-gray-500',
  green:  'border border-green-200 bg-green-50 text-green-600',
}

export default function Badge({ label, variant = 'gray' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}
