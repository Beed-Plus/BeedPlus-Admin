import * as React from "react";
const CloseIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill={props.color || "#000"}
      d="m.75 18.75 9-9-9 9Zm18-18-9 9 9-9Zm-9 9-9-9 9 9Zm0 0 9 9-9-9Z"
    />
    <path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={props.strokeWidth || 1.5}
      d="m.75 18.75 9-9m0 0 9-9m-9 9-9-9m9 9 9 9"
    />
  </svg>
);
export { CloseIcon };
