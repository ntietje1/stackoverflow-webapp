import { MemoryRouter, Routes, Route } from "react-router";
import Questions from "../../../src/components/question/Questions";

describe("<Questions />", () => {
  it("renders for logged out user, empty", () => {
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
      {
        loggedIn: false,
      }
    ).as("check-login");

    cy.intercept(
      {
        method: "GET",
        url: "/questions",
      },
      { statusCode: 200 }
    ).as("questions");

    window.history.pushState({}, "", "/questions");
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route path="/*" element={<Questions />} />
        </Routes>
      </MemoryRouter>
    );

    cy.contains("search");
    cy.contains("Log in");
    cy.contains("Questions");

    cy.contains("No questions found.");
  });
});
