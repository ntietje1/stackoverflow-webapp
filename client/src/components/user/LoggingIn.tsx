import axios from "axios";
import { API_URL } from "../../server_url";
import { Navigate, NavigateFunction, useLocation } from "react-router";
import { useCsrf } from "../../utils/useCsrf";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../utils/useUser";

function Login({ navigate }: { navigate: NavigateFunction }) {
  const csrfToken = useCsrf();
  const [user] = useUser(csrfToken);

  const loc = useLocation();

  useEffect(() => {
    if (loc.state && loc.state.needReload) {
      navigate(".", { replace: true });
      location.reload();
    }
  }, [loc]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    axios
      .post(
        `${API_URL}/login`,
        { username, password },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      )
      .then(() => {
        navigate("/questions");
      })
      .catch((error) => {
        console.log(error);
        setError(`Error logging in`);
      });
  };

  const [error, setError] = useState<string>("");

  return (
    <>
      {user ? (
        <Navigate to="/questions" />
      ) : (
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" />
          <br />
          <input id="submit" type="submit" value="Log in" />
          <p className="font-mono my-4 text-rose-600">
            {error !== "" && error}
          </p>
          <Link
            className="italic text-cyan-600 underline hover:text-cyan-700"
            to={"/register"}
          >
            Go to register
          </Link>
        </form>
      )}
    </>
  );
}

export default Login;
