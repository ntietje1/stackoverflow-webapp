describe("question interactions", () => {
  beforeEach(() => {
    // Clear the database before each test
    cy.exec("node ../server/populate_cypress.js");
    cy.clearAllCookies();
  });

  afterEach(() => {
    // Clear the database after each test
    cy.exec("node ../server/destroy.js mongodb://127.0.0.1:27017/fake_so");
    cy.clearAllCookies();
  });

  it("votes on a question", () => {
    cy.visit("http://localhost:3000/questions/new");
    cy.url().should("eq", "http://localhost:3000/questions");

    cy.visit("http://localhost:3000/questions");

    cy.contains("React").click();
    cy.contains("-2 votes");
    cy.contains("Log in").click();

    cy.get("#username").type("mark");
    cy.get("#password").type("1");
    cy.get("#submit").click();

    cy.contains("React").click();

    cy.get(".down-button").should("have.class", "bg-blue-700");
    cy.get(".down-button").click();
    cy.get(".down-button").should("not.have.class", "bg-blue-700");
    cy.contains("-2 votes").should("not.exist");
    cy.contains("-1 votes");

    cy.get(".up-button").should("not.have.class", "bg-orange-500");
    cy.get(".up-button").click();
    cy.get(".up-button").should("have.class", "bg-orange-500");
    cy.contains("-1 votes").should("not.exist");
    cy.contains("0 votes");

    cy.contains("Edit").click();

    cy.contains("Title");
    cy.get("#title").type(" [edit title]");

    cy.contains("Description");
    cy.get("#description").type(" [edit desc]");
    cy.contains("Tags");
    cy.get("#tag-name").type("new");
    cy.get("#add-tag").click();
    cy.contains("Tag already included");
    cy.get("#tag-name").clear();
    cy.get("#add-tag").click();
    cy.contains("Tag cannot be empty");
    cy.get("#tag-name").type("[edit tag]");
    cy.get("#add-tag").click();
    cy.contains("[edit tag]");

    cy.get(":nth-child(1) > .cursor-pointer").click();
    cy.contains("new").should("not.exist");

    cy.contains("Submit Changes").click();

    cy.contains("[edit tag]");
    cy.contains("[edit desc]");
    cy.contains("[edit title]");

    cy.contains("Log out").click();
    cy.contains("Log in").click();

    cy.get("#username").type("frank");
    cy.get("#password").type("1");
    cy.get("#submit").click();

    cy.contains("React").click();
    cy.contains("Edit").should("not.exist");
    cy.contains("Remove").click();

    cy.url().should("eq", "http://localhost:3000/questions");
    cy.contains("React").should("not.exist");
  });
});
