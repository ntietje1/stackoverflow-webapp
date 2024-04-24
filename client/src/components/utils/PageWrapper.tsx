import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "../user/LogoutButton";
import DefaultButton from "./DefaultButton";

interface Props {
  title: string;
  csrf: string;
  children: ReactNode;
  user: string | string[] | null | undefined;
}

export default function PageWrapper({ title, csrf, user, children }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row w-full justify-between bg-cyan-600 items-center p-4 gap-4">
        <Link
          to={"/questions"}
          className="text-3xl font-bold text-white line-clamp-1"
        >
          {title}
        </Link>
        <div className="flex flex-row gap-8 items-center justify-center">
          {user ? (
            <>
              <span className="font-mono italic text-slate-100">
                Hello, {user}!
              </span>
              <LogoutButton csrf={csrf} navigate={navigate} />
            </>
          ) : (
            <DefaultButton
              onClick={() => navigate("/login", { replace: true })}
              text="Log in"
            />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
