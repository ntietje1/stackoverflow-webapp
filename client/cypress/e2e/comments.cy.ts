
describe("comment interactions", () => {
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
   it("edits a comment", () => {
     cy.visit("/");
     cy.contains("How javascript").click();
 
     cy.get(".up-vote").should("not.exist"); // check no vote buttons for logged in
     cy.get(".down-vote").should("not.exist");
     cy.contains("Edit").should("not.exist");
     cy.contains("Remove").should("not.exist");
     cy.get("#comment-input").should("not.exist");
 
     cy.contains("Sign in").click();
 
     cy.get("#username").type("mark");
     cy.get("#password").type("1");
     cy.get("#submit").click();
 
     cy.contains("What's swift").click();
 
     cy.get("#comment-input").type("my new comment!");
     cy.contains("Post Answer").click();
     cy.contains("my new comment!");
 
     // cy.get(".bg-orange-500").should("not.exist");
     cy.get(".up-vote").should("not.have.class", "bg-orange-500");
     cy.contains("0");
     cy.get(".up-vote").click();
     cy.get(".up-vote").should("have.class", "bg-orange-500");
     cy.contains("1");
 
     cy.get(".down-vote").should("not.have.class", "bg-blue-700");
     cy.get(".down-vote").click();
     cy.get(".down-vote").should("have.class", "bg-blue-700");
     cy.contains("-1");
 
     cy.contains("Edit").click();
     cy.get("#edit-content").type("totally new comment contents");
     cy.contains("Save").click();
     cy.contains("totally new comment contents");
 
     cy.contains("Remove").click();
     cy.contains("totally new comment contents").should("not.exist");
     cy.contains("Ask a question").should("not.exist");
   });
 });