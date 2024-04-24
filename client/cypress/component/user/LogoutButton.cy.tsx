import { MemoryRouter } from "react-router";
import LogoutButton from "../../../src/components/user/LogoutButton";

describe("<LogoutButton />", () => {
  it("renders properly for default case and shows an error if received", () => {
    cy.intercept("/logout", "logged out.").as("log out");

    cy.intercept(
      {
        method: "POST",
        url: "/login",
      },
      { statusCode: 500, body: "Could not find user." }
    ).as("login");

    const navSpy = cy.spy().as("navSpy");

    cy.mount(
      <MemoryRouter>
        <LogoutButton csrf={"csrf-token"} navigate={navSpy} />
      </MemoryRouter>
    );

    cy.get("@navSpy").should("not.have.been.called");
    cy.contains("Log out").click();
    cy.get("@navSpy").should("have.been.called");

    //  cy.wait(["@csrf"]);

    //  cy.contains("Login");
    //  cy.contains("Go to register")
    //    .should("have.attr", "href")
    //    .and("include", "/register");

    //  //  cy.get("#username").type("frank");
    //  //  cy.get("#password").type("password");
    //  cy.contains("Log in").click();

    //  cy.wait(["@login"]);

    //  cy.contains("Could not find user.");
  });
});
