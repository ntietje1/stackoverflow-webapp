import { MemoryRouter } from "react-router";
import Register from "../../../src/components/user/Register";

describe("<Register />", () => {
  it("renders properly and shows an error if received", () => {
    const navSpy = cy.spy().as("navSpy");
    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");

    cy.intercept("/register", {
      statusCode: 500,
      body: "That username is already in use.",
    }).as("getRegister");

    cy.mount(
      <MemoryRouter>
        <Register navigate={navSpy} />
      </MemoryRouter>
    );

    cy.wait(["@csrf"]);

    cy.contains("Register");
    cy.contains("Go to login")
      .should("have.attr", "href")
      .and("include", "/login");

    cy.get("#username").type("frank");
    cy.get("#password").type("password");
    cy.contains("Poster").click();
    cy.get("#submit").click();

    cy.wait("@getRegister");

    cy.contains("Error registering: That username is already in use");
    cy.get("@navSpy").should("not.have.been.called");

    // cy.contains("Could not find user.");
  });

  it("renders properly and navigates for valid response", () => {
    const navSpy = cy.spy().as("navSpy");

    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");

    cy.intercept("/register", {
      statusCode: 200,
    }).as("getRegister");

    cy.mount(
      <MemoryRouter>
        <Register navigate={navSpy} />
      </MemoryRouter>
    );

    cy.wait(["@csrf"]);

    cy.contains("Register");
    cy.contains("Go to login")
      .should("have.attr", "href")
      .and("include", "/login");

    cy.get("#username").type("frank");
    cy.get("#password").type("password");
    cy.contains("Poster").click();
    cy.get("@navSpy").should("not.have.been.called");
    cy.get("#submit").click();

    cy.wait("@getRegister");

    cy.get("@navSpy").should("have.been.called");
  });
});
