const express = require("express");
const { getAllRepositories, getRepositoryContentsByName, getAllFetchedRepositories } = require('./repos.controller');
const { checkLoggedIn } = require('../utils/checkLoggedIn');


  const repoRouter = express.Router();

  repoRouter.get("/", checkLoggedIn, getAllRepositories);
  
  repoRouter.get("/fetched-repos", checkLoggedIn, getAllFetchedRepositories);

  repoRouter.get("/:repo_name", checkLoggedIn, getRepositoryContentsByName);

  module.exports = repoRouter;