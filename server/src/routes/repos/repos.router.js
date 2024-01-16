const express = require("express");
const { checkLoggedIn, getAllRepositories } = require('./repos.controller');


  const userRouter = express.Router();

  userRouter.get("/", checkLoggedIn, getAllRepositories);

  module.exports = userRouter;
  

  