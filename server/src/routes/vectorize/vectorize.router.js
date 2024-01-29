const express = require("express");
const { deleteAndCreateDocumentsTable } = require('./rebuildDocumentsTable.controller');
const { fetchDataFromRepoName } = require('./fetchRepoToDB.controller');


  const vectorizeRouter = express.Router();

  vectorizeRouter.get("/truncation", deleteAndCreateDocumentsTable);

  vectorizeRouter.get("/sync-data/:repo_name", fetchDataFromRepoName);

  module.exports = vectorizeRouter;