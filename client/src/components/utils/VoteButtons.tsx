interface Props {
  votes: number;
  userVote: string;
  onUpvote: () => void;
  onDownvote: () => void;
  user: string | string[] | null | undefined;
}

export default function VoteButtons({
  votes,
  userVote,
  onUpvote,
  onDownvote,
  user,
}: Props) {
  return (
    <div className="flex items-center justify-center">
      <p className="mr-2 whitespace-nowrap">{`${votes} votes`}</p>
      {user !== "" && (
        <>
          <div className="flex flex-col">
            <button
              onClick={onUpvote}
              className={`focus:outline-none ${
                userVote === "up"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "hover:bg-orange-000"
              } up-button`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6 text-gray-800"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <div className="h-2" />
            <button
              onClick={onDownvote}
              className={`focus:outline-none ${
                userVote === "down"
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "hover:bg-blue-000"
              } down-button`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6 text-gray-800"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
