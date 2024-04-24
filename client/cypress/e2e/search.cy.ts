describe("search form", () => {
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
  it("should navigate to /questions with search params on submit", () => {
    cy.visit("/questions");

    cy.get("#title").type("Sample Title");
    cy.get("#description").type("Sample Description");
    cy.get("#tags").type("test,tag");
    cy.get("#early").type("2024-04-23T00:00:00");
    cy.get("#late").type("2024-04-24T00:00:00");
    cy.get("#order").select("unanswered");

    cy.get("#submit").click();

    cy.url().should("include", "/questions?");
    cy.url().should("contain", "title=Sample+Title");
    cy.url().should("contain", "description=Sample+Description");
    cy.url().should("contain", "tags=test%2Ctag");
    cy.url().should("contain", "early=1713");
    cy.url().should("contain", "late=17139");
    cy.url().should("contain", "order=unanswered");
  });

  it("should navigate to /questions with replace=true and state.needReload on reset", () => {
    cy.visit("/questions");

    cy.get("#title").type("Sample Title");

    cy.contains("reset").click();

    cy.url().should("equal", "http://localhost:3000/questions");
  });

  it("should clear search input fields on reset", () => {
    cy.visit("/questions");

    cy.get("#title").type("Sample Title");
    cy.get("#description").type("Sample Description");
    cy.get("#tags").type("test");

    cy.contains("reset").click();

    cy.get("#title").should("have.value", "");
    cy.get("#description").should("have.value", "");
    cy.get("#tags").should("have.value", "");
  });
});
