const express = require("express");

const {retrieveAIResponse} = require('./question.controller');

const artificialIntelligenceRouter = express.Router();

artificialIntelligenceRouter.post("/", retrieveAIResponse);

module.exports = artificialIntelligenceRouter;
