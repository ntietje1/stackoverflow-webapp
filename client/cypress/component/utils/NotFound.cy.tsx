import NotFound from "../../../src/components/utils/NotFound";

describe("<NotFound />", () => {
  it("renders and redirects properly", () => {
    cy.mount(<NotFound />);
    cy.contains("Page not found");
    cy.get('a[href="/questions"]').should("be.visible");
    cy.get('a[href="/questions"]').contains("Take me home.");
  });
});
