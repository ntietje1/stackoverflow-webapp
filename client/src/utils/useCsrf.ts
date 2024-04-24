import axios from "axios";
import { useState, useCallback, useEffect } from "react";
import { API_URL } from "../server_url";

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState("");

  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/csrf-token`, {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      alert(`Error fetching CSRF token: ${error}`);
    }
  }, []);

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  return csrfToken;
}
