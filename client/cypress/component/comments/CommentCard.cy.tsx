import { MemoryRouter } from "react-router";
import CommentCard from "../../../src/components/comment/CommentCard";

describe("<CommentCard />", () => {
  it("renders for logged out user", () => {
    cy.mount(
      <MemoryRouter>
        <CommentCard
          comment={{
            text: "This is the contents of the comment",
            username: "testing",
            post_date_time: new Date("20 April 2024"),
            votes: 45,
            _id: "",
          }}
          csrf={"csrf-token"}
          user={""}
          role={"poster"}
          navigate={() => console.log()}
        />
      </MemoryRouter>
    );

    cy.contains("testing");
    cy.contains("4/20/2024");
    cy.contains("This is the contents of the comment");
    cy.contains("45");
    cy.get(".up-vote").should("not.exist");
    cy.get(".down-vote").should("not.exist");
    cy.contains("Edit").should("not.exist");
    cy.contains("Remove").should("not.exist");
  });

  it("renders for logged in user", () => {
    cy.mount(
      <MemoryRouter>
        <CommentCard
          comment={{
            text: "This is the contents of the comment",
            username: "testing",
            post_date_time: new Date("20 April 2024"),
            votes: 45,
            _id: "comment-id",
          }}
          csrf={"csrf-token"}
          user={"frank"}
          role={"poster"}
          navigate={() => console.log()}
        />
      </MemoryRouter>
    );

    cy.contains("testing");
    cy.contains("4/20/2024");
    cy.contains("This is the contents of the comment");
    cy.contains("45");
    cy.get(".up-vote").should("exist");
    cy.get(".down-vote").should("exist");
    cy.contains("Edit").should("not.exist");
    cy.contains("Remove").should("not.exist");
  });
  it("renders for user who posted the comment and edit works", () => {
    const navSpy = cy.spy().as("navSpy");

    cy.intercept(
      {
        method: "PUT",
        url: "/comments/*",
      },
      { statusCode: 200 }
    ).as("edit");

    cy.intercept(
      {
        method: "GET",
        url: "/comments/*",
      },
      "none"
    ).as("vote");

    cy.mount(
      <MemoryRouter>
        <CommentCard
          comment={{
            text: "This is the contents of the comment",
            username: "testing",
            post_date_time: new Date("20 April 2024"),
            votes: 45,
            _id: "3941285707",
          }}
          csrf={"csrf-token"}
          user={"testing"}
          role={"poster"}
          navigate={navSpy}
        />
      </MemoryRouter>
    );

    cy.contains("testing");
    cy.contains("4/20/2024");
    cy.contains("This is the contents of the comment");
    cy.contains("45");
    cy.get(".up-vote").should("exist");
    cy.get(".down-vote").should("exist");

    cy.contains("Edit").click();
    cy.get("#edit-content").type(" and now there's more.");
    cy.get("@navSpy").should("not.have.been.called");
    cy.contains("Save").click();
    cy.get("@navSpy").should("have.been.called");
  });

  it("renders for user who posted the comment and remove works", () => {
    const navSpy = cy.spy().as("navSpy");

    cy.intercept(
      {
        method: "PUT",
        url: "/comments/*",
      },
      { statusCode: 200 }
    ).as("edit");

    cy.intercept(
      {
        method: "GET",
        url: "/comments/*",
      },
      "none"
    ).as("vote");

    cy.mount(
      <MemoryRouter>
        <CommentCard
          comment={{
            text: "This is the contents of the comment",
            username: "testing",
            post_date_time: new Date("20 April 2024"),
            votes: 45,
            _id: "3941285707",
          }}
          csrf={"csrf-token"}
          user={"testing"}
          role={"poster"}
          navigate={navSpy}
        />
      </MemoryRouter>
    );

    cy.contains("testing");
    cy.contains("4/20/2024");
    cy.contains("This is the contents of the comment");
    cy.contains("45");
    cy.get(".up-vote").should("exist");
    cy.get(".down-vote").should("exist");

    cy.get("@navSpy").should("not.have.been.called");
    cy.contains("Remove").click();
    cy.get("@navSpy").should("have.been.called");
  });

  it("renders any user who posted the comment and upvotes work", () => {
    const navSpy = cy.spy().as("navSpy");

    cy.intercept(
      {
        method: "PUT",
        url: "/comments/*",
      },
      { statusCode: 200 }
    ).as("edit");

    cy.intercept(
      {
        method: "GET",
        url: "/comments/*",
      },
      "none"
    ).as("vote");

    cy.mount(
      <MemoryRouter>
        <CommentCard
          comment={{
            text: "This is the contents of the comment",
            username: "testing",
            post_date_time: new Date("20 April 2024"),
            votes: 45,
            _id: "3941285707",
          }}
          csrf={"csrf-token"}
          user={"testing"}
          role={"poster"}
          navigate={navSpy}
        />
      </MemoryRouter>
    );

    cy.contains("testing");
    cy.contains("4/20/2024");
    cy.contains("This is the contents of the comment");
    cy.contains("45");
    cy.get("@navSpy").should("not.have.been.called");
    cy.get(".up-vote").click();
    cy.get("@navSpy").should("have.been.called");
  });

  it("renders any user who posted the comment and downvotes work", () => {
    const navSpy = cy.spy().as("navSpy");

    cy.intercept(
      {
        method: "PUT",
        url: "/comments/*",
      },
      { statusCode: 200 }
    ).as("edit");

    cy.intercept(
      {
        method: "GET",
        url: "/comments/*",
      },
      "none"
    ).as("vote");

    cy.mount(
      <MemoryRouter>
        <CommentCard
          comment={{
            text: "This is the contents of the comment",
            username: "testing",
            post_date_time: new Date("20 April 2024"),
            votes: 45,
            _id: "3941285707",
          }}
          csrf={"csrf-token"}
          user={"testing"}
          role={"poster"}
          navigate={navSpy}
        />
      </MemoryRouter>
    );

    cy.contains("testing");
    cy.contains("4/20/2024");
    cy.contains("This is the contents of the comment");
    cy.contains("45");

    cy.get("@navSpy").should("not.have.been.called");
    cy.get(".down-vote").click();
    cy.get("@navSpy").should("have.been.called");
  });
});
