import { Link } from "react-router-dom";

export default function StatCard({
  label,
  value,
  icon: Icon,
  loading = false,
  href,
  index,
}) {
  const inner = (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-800  ${index === 0 ? "bg-[#2F3134]" : "bg-white"} dark:bg-gray-900 p-4 shadow-lg sm:p-6 transition h-44 ${href ? "hover:border-orange-200 hover:shadow-lg cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`"text-base font-medium ${index === 0 ? "text-[#DADADA]" : "text-[#686969]"}`}
        >
          {label}
        </span>
      </div>
      {
        <p
          className={`text-4xl font-bold ${index === 0 ? "text-[#FDD6B6]" : "text-[#2F3134]"}`}
        >
          {value}
        </p>
      }
    </div>
  );

  if (href) return <Link to={href}>{inner}</Link>;
  return inner;
}
