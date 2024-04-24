import { MemoryRouter, Routes, Route, Navigate } from "react-router";
import SingleQuestionPage from "../../../src/components/question/SingleQuestionPage";

describe("<SingleQuestionPage />", () => {
  it("renders for logged in user", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");

    cy.intercept(
      {
        method: "GET",
        url: "/check-login",
      },
      {
        loggedIn: true,
        user: {
          _id: "662589485049202088033d32",
          username: "james",
          password: "1",
          question_ids: ["662589485049202088033d2a"],
          comment_ids: ["662589485049202088033d22", "662596a62ab33ffa8cc063b5"],
          upvoted_qids: ["662589485049202088033d2a"],
          downvoted_qids: [],
          upvoted_cids: [
            "662589485049202088033d2e",
            "662596a62ab33ffa8cc063b5",
          ],
          downvoted_cids: [],
          role: "poster",
          __v: 5,
        },
      }
    ).as("check-login");

    cy.intercept({ method: "POST", url: "/comments" }, { statusCode: 200 });

    cy.intercept(
      {
        method: "GET",
        url: "/questions/*",
      },
      {
        _id: "662589485049202088033d2a",
        title: "What's swift?",
        description: "I don't know. Who can help?",
        posted_by: "frank",
        post_date_time: "2024-04-20T07:00:00.000Z",
        votes: 2,
        hidden: false,
        comments: [],
        tag_ids: [],
        __v: 1,
        tags: [],
        userVote: "up",
      }
    ).as("question");

    const navSpy = cy.spy().as("navSpy");

    window.history.pushState({}, "", "/questions/123");
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route path="/*" element={<Navigate to={"/questions/123"} />} />
          <Route
            path="/questions/:qid"
            element={<SingleQuestionPage navigate={navSpy} />}
          />
        </Routes>
      </MemoryRouter>
    );

    cy.contains("Hello, james");
    cy.contains("What's swift");
    cy.contains("I don't know. Who can help?");
    cy.contains("2 votes");
    cy.contains("Remove").should("not.exist");
    cy.get(".up-button").should("exist");
    cy.get(".down-button").should("exist");

    cy.get("@navSpy").should("not.have.been.called");
    cy.get("#comment-input").type("my own answer");
    cy.contains("Post Answer").click();
    cy.get("@navSpy").should("have.been.called");
  });

  it("renders for logged out user", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");

    cy.intercept(
      {
        method: "GET",
        url: "/check-login",
      },
      {
        loggedIn: false,
      }
    ).as("check-login");

    cy.intercept({ method: "POST", url: "/comments" }, { statusCode: 200 });

    cy.intercept(
      {
        method: "GET",
        url: "/questions/*",
      },
      {
        _id: "662589485049202088033d2a",
        title: "What's swift?",
        description: "I don't know. Who can help?",
        posted_by: "frank",
        post_date_time: "2024-04-20T07:00:00.000Z",
        votes: 2,
        hidden: false,
        comments: [],
        tag_ids: [],
        __v: 1,
        tags: [],
        userVote: "up",
      }
    ).as("question");

    const navSpy = cy.spy().as("navSpy");

    window.history.pushState({}, "", "/questions/123");
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route path="/*" element={<Navigate to={"/questions/123"} />} />
          <Route
            path="/questions/:qid"
            element={<SingleQuestionPage navigate={navSpy} />}
          />
        </Routes>
      </MemoryRouter>
    );

    cy.contains("Log in");
    cy.contains("What's swift");
    cy.contains("I don't know. Who can help?");
    cy.contains("2 votes");
    cy.contains("Remove").should("not.exist");
    cy.get(".up-button").should("not.exist");
    cy.get(".down-button").should("not.exist");

    cy.get("@navSpy").should("not.have.been.called");
    cy.get("#comment-input").should("not.exist");
    cy.contains("Sign in to post answers");
  });

  it("renders for admin user", () => {
    cy.intercept(
      {
        method: "GET",
        url: "/csrf-token",
      },
      { csrfToken: "my-token" }
    ).as("csrf");

    cy.intercept(
      {
        method: "GET",
        url: "/check-login",
      },
      {
        loggedIn: true,
        user: {
          _id: "662589485049202088033d32",
          username: "james",
          password: "1",
          question_ids: ["662589485049202088033d2a"],
          comment_ids: ["662589485049202088033d22", "662596a62ab33ffa8cc063b5"],
          upvoted_qids: ["662589485049202088033d2a"],
          downvoted_qids: [],
          upvoted_cids: [
            "662589485049202088033d2e",
            "662596a62ab33ffa8cc063b5",
          ],
          downvoted_cids: [],
          role: "admin",
          __v: 5,
        },
      }
    ).as("check-login");

    cy.intercept(
      {
        method: "GET",
        url: "/questions/*",
      },
      {
        _id: "662589485049202088033d2a",
        title: "What's swift?",
        description: "I don't know. Who can help?",
        posted_by: "frank",
        post_date_time: "2024-04-20T07:00:00.000Z",
        votes: 2,
        hidden: false,
        comments: [],
        tag_ids: [],
        __v: 1,
        tags: [],
        userVote: "up",
      }
    ).as("question");

    cy.intercept(
      {
        method: "PUT",
        url: "/questions/*",
      },
      {
        statusCode: 200,
      }
    ).as("questionRemove");

    const navSpy = cy.spy().as("navSpy");

    window.history.pushState({}, "", "/questions/123");
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route path="/*" element={<Navigate to={"/questions/123"} />} />
          <Route
            path="/questions/:qid"
            element={<SingleQuestionPage navigate={navSpy} />}
          />
        </Routes>
      </MemoryRouter>
    );

    cy.contains("Hello, james");
    cy.contains("What's swift");
    cy.contains("I don't know. Who can help?");
    cy.contains("2 votes");
    cy.contains("Remove").should("exist");
    cy.get(".up-button").should("exist");
    cy.get(".down-button").should("exist");

    cy.get("@navSpy").should("not.have.been.called");
    cy.contains("Remove").click();
  });
});
