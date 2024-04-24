import { MemoryRouter, Navigate, Route, Routes } from "react-router";
import UserPage from "../../../src/components/user/UserPage";
import { sampleUser } from "./sampleUser";

describe("<CommentCard />", () => {
  it("renders for logged out user", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");

    cy.intercept(
      {
        method: "GET",
        url: "/check-login",
      },
      { loggedIn: true }
    ).as("check-login");

    cy.intercept({ method: "GET", url: "/users/*" }, sampleUser).as(
      "load-user"
    );

    cy.intercept("/comments/*/check-vote", "up").as("check-vote");

    window.history.pushState({}, "", "/users/frank");
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route path="/*" element={<Navigate to={"/users/frank"} />} />
          <Route path="/users/:username" element={<UserPage />} />
        </Routes>
      </MemoryRouter>
    );

    cy.contains("frank").should("have.class", "text-3xl");
    cy.contains("Posted Questions");
    cy.get(".question-card").contains("I don't know.");
    cy.contains("Posted Comments");

    cy.contains("Upvoted Questions");

    cy.contains("Downvoted Questions");
    cy.get(".question-card");

    cy.contains("Upvoted comments");
    cy.get(".comment-card");

    cy.contains("Downvoted comments");
    cy.get(".comment-card");
  });
});
