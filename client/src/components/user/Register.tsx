import { useState } from "react";
import { API_URL } from "../../server_url";
import { NavigateFunction } from "react-router";
import { Link } from "react-router-dom";
import { useCsrf } from "../../utils/useCsrf";
import axios from "axios";

export default function Register({ navigate }: { navigate: NavigateFunction }) {
  const csrfToken = useCsrf();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const role = (form.elements.namedItem("role") as HTMLInputElement).value;

    axios
      .post(
        `${API_URL}/register`,
        { username, password, role },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      )
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        setError(`Error registering: ${error.response.data}`);
      });
  };

  const [error, setError] = useState<string>("");

  return (
    <form onSubmit={handleRegister}>
      <h1>Register</h1>
      <label htmlFor="username">Username</label>
      <input id="username" type="text" placeholder="username" />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" placeholder="password" />

      <label htmlFor="roleChoice">Role</label>
      <div id="roleChoice">
        <div>
          <input
            name="role"
            type="radio"
            id="admin"
            value="admin"
            defaultChecked
          />
          <label htmlFor="admin">Admin</label>
        </div>
        <div>
          <input name="role" type="radio" id="poster" value="poster" />
          <label htmlFor="poster">Poster</label>
        </div>
      </div>

      <input id="submit" type="submit" value="Register" />

      <p className="font-mono my-4 text-rose-600">{error !== "" && error}</p>

      <Link
        className="italic text-cyan-600 underline hover:text-cyan-700"
        to={"/login"}
      >
        Go to login
      </Link>
    </form>
  );
}
