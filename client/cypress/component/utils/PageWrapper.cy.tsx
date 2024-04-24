import { MemoryRouter, Route, Routes } from "react-router";
import PageWrapper from "../../../src/components/utils/PageWrapper";
import Login from "../../../src/components/user/LoggingIn";

describe("<PageWrapper />", () => {
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

  it("renders and redirects properly for not logged in", () => {
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route
            path="/login"
            element={
              <Login
                navigate={() => {
                  console.log("navigate");
                }}
              />
            }
          />
          <Route
            path="/*"
            element={
              <PageWrapper user={""} title={"title"} csrf={"csrf"}>
                <h1>children</h1>
              </PageWrapper>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    cy.contains("title");
    cy.contains("children");
    cy.contains("Log in").click();
    cy.contains("Username"); // check redirects properly
    cy.contains("Password");
  });

  it("renders and redirects properly for logged in", () => {
    cy.mount(
      <MemoryRouter basename="/">
        <Routes>
          <Route
            path="/login"
            element={<Login navigate={() => console.log("call navigate")} />}
          />
          <Route
            path="/*"
            element={
              <PageWrapper title={"title"} csrf={"csrf"} user={"frank"}>
                <h1>children</h1>
              </PageWrapper>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    cy.contains("title");
    cy.contains("children");
    cy.contains("Hello, frank!");
    cy.contains("Log out");
  });
});
