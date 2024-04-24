export default function NotFound() {
  return (
    <div className="mx-auto mt-20 rounded-lg bg-slate-200 max-w-96 min-w-48 p-8">
      <h1 className="text-xl">Page not found.</h1>
      <a
        className="text-blue-600 hover:text-blue-700 underline transition-all"
        href="/questions"
      >
        Take me home.
      </a>
    </div>
  );
}
