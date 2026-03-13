export default function Checkbox({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 accent-orange-500 cursor-pointer"
      />
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </label>
  )
}
