import SearchForm from "../../../src/components/utils/SearchForm";

describe("<SearchForm />", () => {
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

  it("submits properly for all inputs", () => {
    const nav = cy.spy().as("navSpy");

    cy.mount(<SearchForm navigate={nav} />);

    cy.get("#title").type("title");
    cy.get("#description").type("desc");
    cy.get("#tags").type("tags");
    cy.get("#early").type("2017-06-01T08:30");
    cy.get("#late").type("2071-04-01T08:30");
    cy.get("#order").select("unanswered");

    cy.contains("search").click();

    cy.get("@navSpy").should("have.been.calledWith", {
      pathname: "/questions",
      search:
        "title=title&description=desc&tags=tags&early=1496320200000&late=3195117000000&order=unanswered",
    });
  });

  it("calls navigate on reset", () => {
    const nav = cy.spy().as("navSpy");

    cy.mount(<SearchForm navigate={nav} />);
    cy.contains("reset").click();

    cy.get("@navSpy").should("have.been.called");
  });

  it("renders and submits properly for no inputs", () => {
    const nav = cy.spy().as("navSpy");

    cy.mount(<SearchForm navigate={nav} />);

    cy.get("#title").should("have.attr", "placeholder", "title");
    cy.get("#description").should("have.attr", "placeholder", "description");
    cy.get("#tags").should("have.attr", "placeholder", "tags");
    cy.get("#early").should("exist");
    cy.get("#late").should("exist");
    cy.get("#order").should("exist");
    cy.get("#newest").should("exist");
    cy.get("#active").should("exist");
    cy.get("#unanswered").should("exist");
    cy.get("#submit").should("exist");
    cy.contains("reset");

    cy.contains("search").click();

    cy.get("@navSpy").should("have.been.calledWith", {
      pathname: "/questions",
      search: "order=newest",
    });
  });
});
