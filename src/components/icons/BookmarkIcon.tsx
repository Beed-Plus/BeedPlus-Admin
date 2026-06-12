import * as React from "react";
const BookmarkIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={20}
    fill={props.fillColor ? props.fillColor : "transparent"}
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.843 1.074c1.1.128 1.907 1.077 1.907 2.185V18.75l-7.5-3.75-7.5 3.75V3.26c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
    />
  </svg>
);
export { BookmarkIcon };
