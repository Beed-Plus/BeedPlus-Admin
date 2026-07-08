export default function PostThumbnail({
  src,
  color = "#444",
  alt = "",
  showPlayIcon = false,
}) {
  if (src) {
    return (
      <div className="w-12 h-12 relative">
        <img
          src={src}
          alt={alt}
          className="w-full object-cover h-full rounded-2xl"
        />

        {showPlayIcon && (
          <div className="absolute inset-0 flex items-center justify-center ">
            <div className="flex h-4 w-4  items-center justify-center rounded-full ">
              <svg
                width="44"
                height="47"
                viewBox="0 0 44 47"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.01028e-08 3.52098C4.01028e-08 0.845978 2.86562 -0.847772 5.20937 0.439728L41.2719 20.2741C41.8238 20.5773 42.2842 21.0233 42.6049 21.5653C42.9255 22.1074 43.0947 22.7256 43.0947 23.3554C43.0947 23.9851 42.9255 24.6034 42.6049 25.1454C42.2842 25.6874 41.8238 26.1334 41.2719 26.4366L5.20937 46.271C4.67402 46.5653 4.0712 46.7151 3.46034 46.7054C2.84949 46.6958 2.25168 46.5272 1.72584 46.2162C1.2 45.9052 0.764293 45.4625 0.461657 44.9318C0.159022 44.4011 -9.22244e-05 43.8007 4.01028e-08 43.1897V3.52098Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      className="h-12 w-12 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white/60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}
