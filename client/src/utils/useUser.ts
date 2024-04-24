import axios from "axios";
import { useState, useCallback, useEffect } from "react";
import { API_URL } from "../server_url";

export function useUser(csrfToken: string) {
  const [user, setUsername] = useState<null | string>(null);
  const [role, setRole] = useState<null | string>();
  const [upvotedComments, setUpvotedComments] = useState<string[]>([]);
  const [downvotedComments, setDownvotedComments] = useState<string[]>([]);
  const [upvotedQuestions, setUpvotedQuestions] = useState<string[]>([]);
  const [downvotedQuestions, setDownvotedQuestions] = useState<string[]>([]);

  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/check-login`, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
      });
      const resLoggedIn = response.data.loggedIn;
      if (resLoggedIn) {
        setUsername(response.data.user.username);
        setRole(response.data.user.role);
        setUpvotedComments(response.data.user.upvoted_cids);
        setDownvotedComments(response.data.user.downvoted_cids);
        setUpvotedQuestions(response.data.user.upvoted_qids);
        setDownvotedQuestions(response.data.user.downvoted_qids);
      } else {
        setUsername("");
      }
    } catch (error) {
      alert(`Error checking login status: ${error}`);
    }
  }, [csrfToken]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return [
    user,
    role,
    upvotedComments,
    downvotedComments,
    upvotedQuestions,
    downvotedQuestions,
  ];
}
