import * as React from "react";
const BackArrowIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={15}
    height={15}
    fill="none"
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={0.938}
      d="M6.563 2.813 1.875 7.5l4.688 4.688M1.875 7.5h11.25"
    />
  </svg>
);
export { BackArrowIcon };
