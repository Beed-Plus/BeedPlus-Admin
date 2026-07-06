import type { ReactNode } from "react";

interface ModalInterface {
  children: ReactNode;
  isVisible: boolean;
  onCloseModal?: () => void;
}

export default function Modal(props: ModalInterface) {
  return (
    <div
      onClick={props.onCloseModal}
      className={`${props.isVisible ? "flex" : "hidden"} w-full h-[100vh] justify-center items-center fixed top-0 left-0 right-0 bottom-0 bg-black/50`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {props.children}
      </div>
    </div>
  );
}
