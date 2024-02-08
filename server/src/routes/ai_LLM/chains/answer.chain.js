require("dotenv").config();
const socket = require("../../../server");
const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { CallbackManager } = require("@langchain/core/callbacks/manager");

const openAIKey = process.env.OPENAI_KEY;

const answerLlm = new ChatOpenAI({
  openAIApiKey: openAIKey,
  streaming: true,
  callbackManager: CallbackManager.fromHandlers({
    async handleLLMNewToken(token) {
      socket.ioObject.emit("answer", token);
    },
    async handleLLMEnd(output) {
      socket.ioObject.emit("end", true);
    },
  }),
});

const answerTemplate = `
You are a coding bot , you take the question also the conv_history and analyze well what the user is asking for.
After that you go throught the context and if the user is asking for you to explain something formulate an answer from the context
else if the user is asking to you to refactor or add a piece of code show the current piece of code from the context
and the modified version that you think is best and also and clear explenation for that.
context: {context}
conv_history: {conv_history}
question: {question}
answer:
`;

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

const answerChain = answerPrompt.pipe(answerLlm).pipe(new StringOutputParser());

module.exports = answerChain;
