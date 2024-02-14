const express = require("express");
const { deleteAndCreateDocumentsTable } = require('./rebuildDocumentsTable.controller');
const { fetchDataFromRepoName } = require('./fetchRepoToDB.controller');
const { checkLoggedIn } = require('../utils/checkLoggedIn');


  const vectorizeRouter = express.Router();

  vectorizeRouter.get("/truncation", checkLoggedIn, deleteAndCreateDocumentsTable);

  vectorizeRouter.post("/sync-repo", checkLoggedIn, fetchDataFromRepoName);

  module.exports = vectorizeRouter;