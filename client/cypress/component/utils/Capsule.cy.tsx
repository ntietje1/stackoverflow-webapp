import Capsule from "../../../src/components/utils/Capsule";

describe("<Capusle />", () => {
  it("renders", () => {
    cy.mount(<Capsule text={"text-in-capsule"} />);
    cy.contains("text-in-capsule");
    cy.contains("text-in-capsule").should("have.class", "rounded-full");
    cy.contains("text-in-capsule").should("have.class", "font-mono");
  });

  it("accepts classs overrides", () => {
    cy.mount(<Capsule className="rounded-none" text={"text-in-capsule"} />);
    cy.contains("text-in-capsule");
    cy.contains("text-in-capsule").should("not.have.class", "rounded-full");
    cy.contains("text-in-capsule").should("have.class", "rounded-none");
  });
});
