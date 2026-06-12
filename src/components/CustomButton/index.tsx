interface CustomButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  font?: "bold" | "semibold" | "regular";
}

export default function CustomButton(props: CustomButtonProps) {
  return (
    <div
      onClick={!props.loading && !props.disabled ? props.onClick : undefined}
      className={`text-center text-[12px] lg:text-[16px] uppercase ${props.disabled || props.loading ? "bg-[#CCC]" : "bg-[#F87A15]"} ${props.font == "bold" ? "font-bold" : props.font == "semibold" ? "font-semibold" : ""}  text-white py-2 px-4 rounded-[24px] w-auto my-4`}
    >
      {!props.loading ? props.text : "Loading.."}
    </div>
  );
}
