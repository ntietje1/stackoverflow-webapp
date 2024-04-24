import { MemoryRouter } from "react-router";
import Login from "../../../src/components/user/LoggingIn";

describe("<Login />", () => {
  it("renders properly for default case and shows an error if received", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");

    cy.intercept(
      {
        method: "POST",
        url: "/login",
      },
      { statusCode: 500, body: "Could not find user." }
    ).as("login");

    cy.mount(
      <MemoryRouter>
        <Login navigate={() => console.log("navigate")} />
      </MemoryRouter>
    );

    cy.wait(["@csrf"]);

    cy.contains("Login");
    cy.contains("Go to register")
      .should("have.attr", "href")
      .and("include", "/register");

    //  cy.get("#username").type("frank");
    //  cy.get("#password").type("password");
    cy.contains("Log in").click();

    cy.wait(["@login"]);

    cy.contains("Could not find user.");
  });

  it("renders properly for default case and navigates if no error", () => {
    const navSpy = cy.spy().as("navSpy");

    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");

    cy.intercept(
      {
        method: "POST",
        url: "/login",
      },
      { statusCode: 200 }
    ).as("login");

    cy.mount(
      <MemoryRouter>
        <Login navigate={navSpy} />
      </MemoryRouter>
    );

    cy.wait(["@csrf"]);

    cy.contains("Login");
    cy.contains("Go to register")
      .should("have.attr", "href")
      .and("include", "/register");

    //  cy.get("#username").type("frank");
    //  cy.get("#password").type("password");
    cy.get("@navSpy").should("not.be.called");
    cy.contains("Log in").click();

    cy.wait(["@login"]);
    cy.get("@navSpy").should("have.been.called");
  });
});
