import VoteButtons from "../../../src/components/utils/VoteButtons";

describe("<VoteButtons />", () => {
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

  it("renders properly for default case", () => {
    const upSpy = cy.spy().as("upSpy");
    const downSpy = cy.spy().as("downSpy");

    cy.mount(
      <VoteButtons
        votes={4}
        user={"frank"}
        userVote={"none"}
        onUpvote={upSpy}
        onDownvote={downSpy}
      />
    );

    cy.contains("4 votes");
    cy.get(".up-button").should("exist");
    cy.get(".down-button").should("exist");

    cy.get("@upSpy").should("not.have.been.called");
    cy.get(".up-button").click();
    cy.get("@upSpy").should("have.been.called");

    cy.get("@downSpy").should("not.have.been.called");
    cy.get(".down-button").click();
    cy.get("@downSpy").should("have.been.called");
  });

  it("hide buttons for no user", () => {
    const upSpy = cy.spy().as("upSpy");
    const downSpy = cy.spy().as("downSpy");

    cy.mount(
      <VoteButtons
        votes={4}
        user={""}
        userVote={"none"}
        onUpvote={upSpy}
        onDownvote={downSpy}
      />
    );

    cy.contains("4 votes");
    cy.get(".up-button").should("not.exist");
    cy.get(".down-button").should("not.exist");
  });

  it("renders properly for downvote case", () => {
    const upSpy = cy.spy().as("upSpy");
    const downSpy = cy.spy().as("downSpy");

    cy.mount(
      <VoteButtons
        votes={4}
        user={"frank"}
        userVote={"down"}
        onUpvote={upSpy}
        onDownvote={downSpy}
      />
    );

    cy.contains("4 votes");
    cy.get(".up-button").should("exist");
    cy.get(".down-button").should("exist");
    cy.get(".down-button").should("have.class", "bg-blue-700");

    cy.get("@upSpy").should("not.have.been.called");
    cy.get(".up-button").click();
    cy.get("@upSpy").should("have.been.called");

    cy.get("@downSpy").should("not.have.been.called");
    cy.get(".down-button").click();
    cy.get("@downSpy").should("have.been.called");
  });

  it("renders properly for upvote case", () => {
    const upSpy = cy.spy().as("upSpy");
    const downSpy = cy.spy().as("downSpy");

    cy.mount(
      <VoteButtons
        votes={4}
        user={"frank"}
        userVote={"up"}
        onUpvote={upSpy}
        onDownvote={downSpy}
      />
    );

    cy.contains("4 votes");
    cy.get(".up-button").should("exist");
    cy.get(".down-button").should("exist");
    cy.get(".up-button").should("have.class", "bg-orange-500");

    cy.get("@upSpy").should("not.have.been.called");
    cy.get(".up-button").click();
    cy.get("@upSpy").should("have.been.called");

    cy.get("@downSpy").should("not.have.been.called");
    cy.get(".down-button").click();
    cy.get("@downSpy").should("have.been.called");
  });
});
