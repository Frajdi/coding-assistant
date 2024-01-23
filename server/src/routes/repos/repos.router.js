const express = require("express");
const { checkLoggedIn, getAllRepositories, getRepoContentsByName } = require('./repos.controller');


  const repoRouter = express.Router();

  repoRouter.get("/", checkLoggedIn, getAllRepositories);

  repoRouter.get("/:repo_name", getRepoContentsByName);

  module.exports = repoRouter;