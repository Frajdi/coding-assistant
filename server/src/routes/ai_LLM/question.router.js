const express = require("express");
const {retrieveAIResponse} = require('./question.controller');
const { checkLoggedIn } = require('../utils/checkLoggedIn');

const artificialIntelligenceRouter = express.Router();

artificialIntelligenceRouter.post("/", checkLoggedIn, retrieveAIResponse);

module.exports = artificialIntelligenceRouter;
