import type { InputHTMLAttributes } from "react";

interface CTIInterface extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errormsg?: string;
  description?: string;
  leftIcon?: React.ReactNode;
}

export default function CustomTextInput(props: CTIInterface) {
  return (
    <div className="my-1">
      {props.label && (
        <p className="font-medium text-[16px] pl-4 py-1">{props.label}</p>
      )}
      <div className="">
        {props.leftIcon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            {props.leftIcon}
          </span>
        )}
        <input
          className="text-[16px] md:text-[18px] border border-[#E5E5E5] h-10 bg-white rounded-lg py-2.5 px-4 w-full placeholder-gray-500/60"
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          {...props}
        />
      </div>
      {props.description && <div>{props.description}</div>}
      {props.errormsg && (
        <div className="text-[#F87A15] my-2">{props.errormsg}</div>
      )}
    </div>
  );
}
