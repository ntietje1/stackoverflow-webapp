import { MemoryRouter, Routes, Route } from "react-router";
import QuestionCardView from "../../../src/components/question/QuestionCardView";

const question = {
  _id: "6626bf2e7923e0c874da8733",
  title: "testing title",
  description: "testing description",
  posted_by: "frank",
  post_date_time: "2024-04-22T19:49:02.023Z",
  votes: 0,
  hidden: false,
  comments: [],
  tags: ["testing-tag"],
  userVote: "none",
};

describe("<QuestionCardView />", () => {
  it("renders for the user who posted the question", () => {
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route
            path="/*"
            element={
              <QuestionCardView
                question={question}
                csrf={"csrf"}
                user={"frank"}
                role={"admin"}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    cy.intercept("/questions/*", { statusCode: 200 }).as("remove");

    cy.contains("testing-tag");
    cy.contains("testing title");
    cy.contains("testing description");
    cy.contains("frank");
    cy.contains("0 votes");
    cy.contains("Edit");
    cy.get(".up-button").should("exist");
    cy.get(".down-button").should("exist");
    cy.contains("Remove").click();

    cy.wait("@remove");
  });

  it("renders for another user (admin)", () => {
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route
            path="/*"
            element={
              <QuestionCardView
                question={question}
                csrf={"csrf"}
                user={"jake"}
                role={"admin"}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    cy.contains("testing-tag");
    cy.contains("testing title");
    cy.contains("testing description");
    cy.contains("frank");
    cy.contains("0 votes");
    cy.contains("Edit").should("not.exist");
    cy.contains("Remove");
    cy.get(".up-button").should("exist");
    cy.get(".down-button").should("exist");
  });

  it("renders for another user (non admin)", () => {
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route
            path="/*"
            element={
              <QuestionCardView
                question={question}
                csrf={"csrf"}
                user={"jake"}
                role={"poster"}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    cy.contains("testing-tag");
    cy.contains("testing title");
    cy.contains("testing description");
    cy.contains("frank");
    cy.contains("0 votes");
    cy.get(".up-button").should("exist");
    cy.get(".down-button").should("exist");
    cy.contains("Edit").should("not.exist");
    cy.contains("Remove").should("not.exist");
    cy.get(".up-button").should("exist");
    cy.get(".down-button").should("exist");
  });

  it("renders for a non-logged in user", () => {
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route
            path="/*"
            element={
              <QuestionCardView
                question={question}
                csrf={"csrf"}
                user={""}
                role={""}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    cy.contains("testing-tag");
    cy.contains("testing title");
    cy.contains("testing description");
    cy.contains("frank");
    cy.contains("0 votes");
    cy.get(".up-button").should("not.exist");
    cy.get(".down-button").should("not.exist");
    cy.contains("Edit").should("not.exist");
    cy.contains("Remove").should("not.exist");
  });
});
