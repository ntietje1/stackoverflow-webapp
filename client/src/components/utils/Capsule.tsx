import { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends HTMLAttributes<HTMLDivElement> {
  text: ReactNode;
}

export default function Capsule({ text, ...props }: Props) {
  const { className, ...newProps } = props;

  return (
    <span
      className={twMerge(
        "rounded-full w-fit p-2 px-4 bg-cyan-600 text-white font-mono text-xs min-w-16 flex justify-center capsule",
        className
      )}
      {...newProps}
    >
      {text}
    </span>
  );
}
