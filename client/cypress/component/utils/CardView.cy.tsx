import { MemoryRouter } from "react-router";
import CardView from "../../../src/components/utils/CardView";

describe("<CardView />", () => {
  it("renders base elements properly", () => {
    cy.mount(
      <MemoryRouter>
        <CardView title={"my title"} />
      </MemoryRouter>
    );
    cy.contains("my title");
    cy.contains("child").should("not.exist");
  });

  it("renders bonus elements properly", () => {
    cy.mount(
      <MemoryRouter>
        <CardView
          title={"my title"}
          destination="/destination"
          note="special note"
        >
          <h1>child</h1>
        </CardView>
      </MemoryRouter>
    );
    cy.contains("my title");
    cy.contains("child");
    cy.get(".capsule").contains("special note");
    cy.get('a[href="/destination"]').should("be.visible");
    cy.get('a[href="/destination"]').contains("my title");
  });

  it("class override works", () => {
    cy.mount(
      <MemoryRouter>
        <CardView className="bg-rose-100" title={"my title"} />
      </MemoryRouter>
    );
    cy.contains("my title");
    cy.get(".card-view").should("have.class", "bg-rose-100");
  });
});
