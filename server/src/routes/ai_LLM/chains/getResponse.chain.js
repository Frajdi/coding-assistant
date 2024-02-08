const answerChain = require("./answer.chain");
const filePathChain = require("./filePath.chain");
const retrieverChain = require("./dataRetriever.chain");
const standaloneQuestionChain = require("./standAloneQuestion.chain");

const {
  RunnablePassthrough,
  RunnableSequence,
  RunnableMap,
} = require("@langchain/core/runnables");

const answerAndPathMap = RunnableMap.from({
  filePath: filePathChain,
  answer: answerChain,
});

const chain = RunnableSequence.from([
  {
    standalone_question: standaloneQuestionChain,
    original_input: new RunnablePassthrough(),
  },
  {
    context: retrieverChain,
    question: ({ original_input }) => original_input.question,
    conv_history: ({ original_input }) => original_input.conv_history,

  },
  answerAndPathMap,
]);

module.exports = chain;
