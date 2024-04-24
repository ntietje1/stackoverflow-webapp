import DefaultButton from "../../../src/components/utils/DefaultButton";

describe("<DefaultButton />", () => {
  it("renders base elements properly", () => {
    cy.mount(<DefaultButton text={"my title"} />);
    cy.contains("my title");
  });

  it("accepts classs overrides and other params", () => {
    const clickAction = cy.spy().as("clickSpy");

    cy.mount(
      <DefaultButton
        className="bg-green-200"
        text={"text-in-button"}
        onClick={clickAction}
      />
    );
    cy.contains("text-in-button").should("have.class", "bg-green-200");

    cy.contains("text-in-button").click();
    cy.get("@clickSpy").should("have.been.called");
  });
});
