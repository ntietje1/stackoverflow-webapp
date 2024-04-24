# List of features

| Feature                   | Description                                                                                                                                                                                                                             | E2E Tests (all found under client/cypress/e2e) | **Component Tests (all found under client/cypress/component)** | **Jest Tests (all found under server/tests** | **Server Endpoint**                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------- | ----------------------------------- |
| View posts                | The posts are displayed in a readable, understandable format including titles, descriptions, and who posted the question                                                                                                                | questions.cy.ts                                | question/Questions.cy.tsx                                      | question.test.js                             | GET /questions/getQuestionsByFilter |
| Create new posts          | Users who are logged in can post a question with a title, description, and optional tags to the platform.                                                                                                                               | questions.cy.ts                                | question/NewQuestion.cy.tsx                                    | question.test.js                             | POST /questions                     |
| Search for existing posts | Users can filter the posts on the platform by title, description, tag, and/or date posted to help find posts they are looking for                                                                                                       | search.cy.ts                                   | utils/SearchForm.cy.tsx                                        | question.test.js                             | GET /questions/getQuestionsByFilter |
| Commenting on posts       | Users who are logged in can leave answers to question posts. Answers include a response and show the poster's username.                                                                                                                 | comments.cy.ts                                 | question/SingleQuestionPage.cy.tsx                             | comment.test.js                              | POST /comments/:qid                 |
| Voting on posts           | Users who are logged in can upvote or downvote posts to increase or decrease their score.                                                                                                                                               | questions.cy.ts                                | utils/VoteButtons.cy.tsx                                       | question.test.js                             | PUT /questions/:qid                 |
| Tagging posts             | Users who are logged in and posting a question can include tags (no restriction on style or form) on their posts to help others search for them.                                                                                        | questions.cy.ts                                | question/NewQuestion.cy.tsx                                    | question.test.js                             | POST /questions                     |
| User profiles             | Any user on the platform can have their username under a comment or question clicked on to view all of their posts, comments, and votes.                                                                                                | users.cy.ts                                    | user/UserPage.cy.tsx                                           | user.test.js                                 | GET /users/:uid                     |
| Post moderation           | Users can choose to be Admins when joining the platform, giving them the privilege to remove other user's posts.                                                                                                                        | questions.cy.ts                                | SingleQuestionPage.cy.tsx                                      | question.test.js                             | GET /questions/:qid                 |
| Set Sort Preference       | When looking at all questions on the platform, or when searching, any user can change the sort order to Newest (sort by date posted), Unanswered (posts without answers at the top), or Active (sort by date of either comment or post) | search.cy.ts                                   | utils/SearchForm.cy.tsx                                        | question.test.js                             | GET /questions/getQuestionsByFilter |
| Edit a comment            | A user can edit their own comment.                                                                                                                                                                                                      | comments.cy.ts                                 | comments/CommentCard.tsx                                       | comment.test.js                              | PUT /comments/:cid                  |
| Edit a post               | A user can edit their own post.                                                                                                                                                                                                         | questions.cy.ts                                | question/SingleQuestionPage.cy.tsx                             | question.test.js                             | PUT /questions/:qid                 |


# Instructions to generate and view coverage report 
## Cypress tests: 
1. `cd client`
2. `npm install`
3. `npx cypress open`
4. Click `E2E Testing` > click `Start E2E Testing in Electron` > click `overall.cy.ts` and wait for it to run
5. Close any open Cypress windows (should bring you back to the Terminal)
6. Run `open coverage/lcov-report/index.html` to see the coverage report in your browser
## Jest tests:
1. `cd server`
2. `npm install`
3. `npm test`
4. `open coverage/lcov-report/index.html`

# Extra Credit Section
The features which were not originally required which we chose to add for extra credit were `Set Sort Preference`, `Edit a comment`, and `Edit a post`. Descriptions of what we did for each are in the **List of Features** section/table
