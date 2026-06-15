import CustomDropDownInput from "../../CustomDropDownInput";
import CustomTextInput from "../../CustomTextInput";
import SelectSearch from "../../SelectSearch";

const SELECT =
  "w-36 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer scrollbar-thin";

export default function UserFilters({
  subCategory,
  category,
  country,
  approvalStatus,
  search = "",
  followerSort = "",
  gender = "",
  categories,
  subCategories,
  countries = [],
  onSubCategoryChange,
  onCountryChange,
  onApprovalStatusChange,
  onSearchChange,
  onFollowerSortChange,
  onGenderChange,
  onCategoryChange,
  hideStatusFilter = false,
  pagination,
}) {
  const hasFilter =
    subCategory ||
    category ||
    country ||
    approvalStatus ||
    search ||
    followerSort ||
    gender;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      {/* <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search username…"
        className="w-62 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
      /> */}

      {/* Country */}
      {/* <select
        value={country}
        onChange={(e) => onCountryChange(e.target.value)}
        className={SELECT}
      >
        <option value="">All Countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select> */}

      {/* Category */}
      {/* <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={SELECT}
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c._id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select> */}

      {/* Sub Category */}
      {/* <select
        value={subCategory}
        onChange={(e) => onSubCategoryChange(e.target.value)}
        className={SELECT}
      >
        <option value="">All Subcategories</option>
        {subCategories.map((c) => (
          <option key={c._id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select> */}

      <div className="w-[294px]">
        <CustomTextInput
          value={search}
          placeholder="Search by username…"
          onChange={(e) => {
            onSearchChange(e.target.value);
          }}
        />
      </div>
      <div className="min-w-36">
        <CustomDropDownInput
          placeholder="Category"
          value={category}
          onChange={(e) => {
            onCategoryChange(e.target.value);
          }}
          items={[
            {
              label: "All",
              value: "All",
            },
            ...categories.map((c) => ({
              label: c.name,
              value: c.name,
            })),
          ]}
        />
      </div>
      {/* <div className="w-30">
        <SelectSearch
          placeholder="Subcategory"
          onChange={(val) => onSubCategoryChange(val)}
          value={subCategory}
          items={["All", ...subCategories.map((s) => s.name)]}
        />
      </div> */}
      <div className="min-w-36">
        <CustomDropDownInput
          placeholder="Country"
          value={country}
          onChange={(e) => {
            onCountryChange(e.target.value);
          }}
          items={[
            {
              label: "All",
              value: "All",
            },
            ...countries.map((c) => ({
              label: c,
              value: c,
            })),
          ]}
        />
      </div>

      {/* Clear filters */}
      {/* {hasFilter && (
        <button
          onClick={() => {
            onSearchChange("");
            onCategoryChange("");
            onCountryChange("");
            onApprovalStatusChange("");
            onFollowerSortChange("");
            onGenderChange("");
          }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:border-red-200 hover:text-red-400 transition"
        >
          Clear
        </button>
      )} */}
    </div>
  );
}
