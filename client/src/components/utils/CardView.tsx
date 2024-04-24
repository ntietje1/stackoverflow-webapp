import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Capsule from "./Capsule";

interface Props {
  title: string;
  note?: ReactNode;
  destination?: string;
  children?: ReactNode;
  sidechildren?: ReactNode;
  className?: string;
}

export default function CardView({
  title,
  note,
  destination,
  children,
  sidechildren,
  className,
}: Props) {
  return (
    <div
      className={`${className} bg-slate-200 rounded-lg p-4 hover:shadow-md flex justify-between w-full card-view`}
    >
      <div>
        <Link
          to={destination ?? "."}
          className="link line-clamp-2 text-lg font-semibold"
        >
          {title}
        </Link>
        {note && <Capsule text={note} />}
        {children && children}
      </div>
      {sidechildren && <div className="ml-4">{sidechildren}</div>}
    </div>
  );
}
