
describe("user page has correct contents", () => {
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
 
   it("opens when a username is clicked", () => {
     cy.visit("http://localhost:3000/questions");
     cy.contains("frank").click();
   });
 });
 