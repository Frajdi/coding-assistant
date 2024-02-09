require("dotenv").config();
const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

const openAIKey = process.env.OPENAI_KEY;

const llm = new ChatOpenAI({
  openAIApiKey: openAIKey,
  modelName: 'gpt-3.5-turbo-0125'
});

const standaloneQuestionTemplate = `
Given a question and the conv_history, convert it to a standalone question.

Check if the question might be related to the conv history and improve the stand alone question 
else dont take conv history in consideration for the final result.

question: {question}
conv_history: {conv_history}
`;

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

const standaloneQuestionChain = standaloneQuestionPrompt
  .pipe(llm)
  .pipe(new StringOutputParser());

module.exports = standaloneQuestionChain;
