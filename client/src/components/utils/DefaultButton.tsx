import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export default function DefaultButton({ text, ...props }: Props) {
  const { className, ...newProps } = props;

  return (
    <button
      className={twMerge(
        "w-fit p-2 px-4 text-xs rounded-md font-mono  shadow-md text-semibold bg-slate-600 hover:bg-slate-700 text-white ring-slate-50 ring-1 hover:ring-2",
        className
      )}
      {...newProps}
    >
      {text}
    </button>
  );
}
