import { MemoryRouter, Routes, Route } from "react-router";
import NewQuestion from "../../../src/components/question/NewQuestion";

describe("<NewQuestion />", () => {
  it("redirects you if you're not logged in", () => {
    const navSpy = cy.spy().as("navSpy");

    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");
    cy.intercept("/check-login", { loggedIn: false }).as("login");

    cy.get("@navSpy").should("not.have.been.called");

    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route path="/*" element={<NewQuestion navigate={navSpy} />} />
        </Routes>
      </MemoryRouter>
    );

    cy.get("@navSpy").should("have.been.called");
  });

  it("lets you complete and submit", () => {
    const navSpy = cy.spy().as("navSpy");

    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");
    cy.intercept("/check-login", {
      loggedIn: true,
      user: {
        username: "frank",
      },
    }).as("login");
    cy.intercept(
      {
        method: "POST",
        url: "/questions",
      },
      { statusCode: 200 }
    );

    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route path="/*" element={<NewQuestion navigate={navSpy} />} />
        </Routes>
      </MemoryRouter>
    );

    cy.get("@navSpy").should("not.have.been.called");

    cy.contains("Title");
    cy.contains("Description");
    cy.contains("Tags");

    cy.get("#title").type("new title");
    cy.get("#description").type("new description");
    cy.get("#new-tag").type("mytag");
    cy.get("@navSpy").should("not.have.been.called");
    cy.contains("Ask Question").click();

    cy.get("#title").should("not.have.value");
    cy.get("#description").should("not.have.value");
    cy.get("#new-tag").should("not.have.value");
  });

  it("displays error if invalid post sent to server", () => {
    const navSpy = cy.spy().as("navSpy");

    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");
    cy.intercept("/check-login", {
      loggedIn: true,
      user: {
        username: "frank",
      },
    }).as("login");
    cy.intercept(
      {
        method: "POST",
        url: "/questions",
      },
      { statusCode: 500 }
    ).as("fail post");

    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route path="/*" element={<NewQuestion navigate={navSpy} />} />
        </Routes>
      </MemoryRouter>
    );

    cy.get("@navSpy").should("not.have.been.called");

    cy.contains("Title");
    cy.contains("Description");
    cy.contains("Tags");

    cy.get("@navSpy").should("not.have.been.called");

    cy.contains("Ask Question").click();
    cy.contains("Error posting question");
    cy.get("@navSpy").should("not.have.been.called");
  });
});
