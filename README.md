You can run the app with `npm run deploy` command.

TODO: 

- Create a front end route to authorize with github.
- After he authorizes send him to look at all of his repos.
- than he can click on one of them and : 

        - create the router for vectorize that calls the https://localhost:3000/v1/repos/${repo_name} and uses the "fetchDataToVector" function from "vectorize/fetchRepoToDB.controller.js" in order to fetch the repo to database.

- Than navigate the user to the main page.