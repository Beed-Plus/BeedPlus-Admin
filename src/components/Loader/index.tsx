import { Images } from "../../assets/";

export default function Loader() {
  return (
    <div className="w-25 h-25 absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-999">
      <div
        class="inline-block h-10 w-10 animate-spin rounded-full border-5 border-gray-200 border-t-[#3A3A3A]"
        role="status"
        aria-label="Loading"
      ></div>
    </div>
  );
}
