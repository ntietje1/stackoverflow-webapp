import axios from "axios";
import { API_URL } from "../../server_url";
import { NavigateFunction } from "react-router";
import DefaultButton from "../utils/DefaultButton";

export default function LogoutButton({
  csrf,
  navigate,
}: {
  csrf: string;
  navigate: NavigateFunction;
}) {
  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, null, {
        headers: {
          "X-CSRF-Token": csrf,
        },
        withCredentials: true,
      });

      navigate("/login", { state: { needReload: true } });
    } catch (error) {
      alert(`Error logging out: ${error}`);
    }
  };

  return <DefaultButton onClick={handleLogout} text="Log out" />;
}
