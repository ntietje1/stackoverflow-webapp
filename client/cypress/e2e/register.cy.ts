import axios from "axios";

describe("csrf alert", () => {
  beforeEach(() => {
    // Clear the database before each test
    cy.exec("node ../server/populate_cypress.js");
    // cy.clearAllCookies();
  });

  afterEach(() => {
    // Clear the database after each test
    cy.exec("node ../server/destroy.js mongodb://127.0.0.1:27017/fake_so");
    cy.clearAllCookies();
  });
  it("should display an alert on error fetching CSRF token", () => {
    // Stub axios.get to simulate an error
    cy.stub(axios, "get").callsFake(() => {
      throw new Error("Some error fetching CSRF token");
    });

    // Visit any route that would trigger the useCsrf hook
    cy.visit("/");

    // Check if the alert message is displayed
    cy.on("window:alert", (text) => {
      expect(text).to.include("Error fetching CSRF token:");
    });
  });
});

describe("registering a new user works", () => {
  beforeEach(() => {
    // Clear the database before each test
    cy.exec("node ../server/populate_cypress.js");
    // cy.clearAllCookies();
  });

  afterEach(() => {
    // Clear the database after each test
    cy.exec("node ../server/destroy.js mongodb://127.0.0.1:27017/fake_so");
    cy.clearAllCookies();
  });

  it("registers successfully for unique username", () => {
    cy.visit("http://localhost:3000/register");
    cy.contains("Register");
    cy.get("#submit").click();
    cy.contains(
      "Neither username nor password may be empty. Role must be `Admin` or `Poster"
    );

    cy.get("#username").type("mark");
    cy.get("#password").type("2");
    cy.get("#submit").click();
    cy.contains("A user with this username already exists");

    cy.get("#username").type("james");
    cy.get("#password").type("1");
    cy.get("#submit").click();
    cy.url().should("eq", "http://localhost:3000/login");

    cy.visit("http://localhost:3000/login");
    cy.get("#username").type("frank");
    cy.get("#password").type("1");
    cy.get("#submit").click();
    cy.url().should("eq", "http://localhost:3000/questions");
    cy.contains("Hello, frank!");

    cy.visit("http://localhost:3000/login");
    cy.url().should("eq", "http://localhost:3000/questions");
    cy.contains("Hello, frank!");
  });

  it("renders an error for error during edit", () => {
    cy.intercept("/comments/*/*", { statusCode: 500 }).as("check-vote");
    cy.intercept("/comments/*", { statusCode: 500 }).as("edit comment");

    cy.visit("http://localhost:3000/");
    cy.contains("Log in").click();
    cy.get("#username").type("frank");
    cy.get("#password").type("1");
    cy.get("#submit").click();
    cy.contains("javascript").click();

    cy.get(".up-vote").first().click();

    cy.contains("Edit").click();
    cy.contains("Save").click();

    cy.on("window:alert", (str) => {
      expect(str).to.contain(`Error updating comment`);
    });
  });

  it("renders an error for error during remove", () => {
    cy.intercept("/comments/*/*", { statusCode: 500 }).as("check-vote");
    cy.intercept("/comments/*", { statusCode: 500 }).as("edit comment");

    cy.visit("http://localhost:3000/");
    cy.contains("Log in").click();
    cy.get("#username").type("frank");
    cy.get("#password").type("1");
    cy.get("#submit").click();
    cy.contains("javascript").click();

    cy.get(":nth-child(4) > .flex > .bg-rose-700").click();
    cy.on("window:alert", (str) => {
      expect(str).to.contain(`Error updating comment`);
    });
  });
});
