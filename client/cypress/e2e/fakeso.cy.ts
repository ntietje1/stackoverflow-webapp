describe("check overall app flow", () => {
  beforeEach(() => {
    // Clear the database before each test
    cy.exec("node ../server/populate_cypress.js");
    // cy.clearAllCookies();
  });

  afterEach(() => {
    // Clear the database after each test
    // cy.exec("node ../server/destroy.js mongodb://127.0.0.1:27017/fake_so");
    cy.clearAllCookies();
  });

  it("allows general usage and shows all elements", () => {
    cy.visit("http://localhost:3000/nothing"); // load random page
    cy.contains("Page not found.");
    cy.contains("Take me home.").click();

    cy.contains("Questions"); // check redirects to questions

    cy.contains("Remove").should("not.exist"); // check not logged in
    cy.contains("Edit").should("not.exist");

    cy.contains("What's swift?"); // check has question on page
    cy.contains("How javascript"); // check has other question
    cy.contains("Is it good to write?"); // check has other question, with description
    cy.contains("2 votes"); // check has other question, with votes

    cy.contains("order"); // check search and order is on the main page
    cy.contains("search");

    cy.contains("Log in").click(); // click on login
    cy.url().should("eq", "http://localhost:3000/login");
    cy.contains("Username");
    cy.get("#username").clear();
    cy.get("#username").type("frank", { force: true });
    cy.contains("Password");
    cy.get("#password").clear();
    cy.get("#password").type("1", { force: true });
    cy.contains("Log in").click(); // log in as existing user

    cy.contains("Questions"); // check login goes back to /questions
    cy.url().should("eq", "http://localhost:3000/questions");

    cy.contains("Remove"); // check now logged in
    cy.contains("Edit");

    cy.contains("Ask a question").click(); // ask a question
    cy.contains("Ask a question");
    cy.contains("Hello, frank");
    cy.url().should("eq", "http://localhost:3000/questions/new");

    cy.contains("Title");
    cy.get("#title").clear();
    cy.get("#title").type("new question");

    cy.contains("Description");
    cy.get("#description").clear();
    cy.get("#description").type("new question's description");

    cy.contains("Tags");
    cy.get("#new-tag").clear();
    cy.get("#new-tag").type("tag-for-question");

    cy.contains("Add Tag").click();

    cy.get("#new-tag").should("have.value", "");
    cy.contains("tag-for-question");

    cy.get("#post-question").click();

    cy.url().should("contain", "http://localhost:3000/questions/");

    cy.get(".question-card").contains("@frank");
    cy.get(".comment-card").should("not.exist");
    cy.get("#comment-input").clear();
    cy.get("#comment-input").type("new comment");

    cy.contains("Post Answer").click();

    cy.get("#comment-input").should("have.value", "");
    cy.contains("new comment");
    cy.get(".comment-card").contains("@frank");
  });
});