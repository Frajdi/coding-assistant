const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const client = require("../../services/db");
const pgvector = require("pgvector/pg");
const {
  RunnablePassthrough,
  RunnableSequence,
  RunnableMap,
} = require("@langchain/core/runnables");
const { CallbackManager } = require("langchain/callbacks");
const socket = require('../../server');

const openAIApiKey = "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";

const openAIEmbeddings = new OpenAIEmbeddings({
  openAIApiKey: "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",
  dimensions: 1536,
});

//CREATE A CUSTOM RETRIEVER FUNCTION THAT TAKES THE STANDALONE QUESTION VECTORIZES IT AND PASSES IT TO
//THE MATCH_DOCUMENTS IN DB AND RETURN THE RESULT WITH MAYBE 5 SEARCH RESULTS

const retriever = async (standAloneQuestion) => {
  const embedding = await openAIEmbeddings.embedQuery(standAloneQuestion);
  const retrievedEmbedings = await client.query(
    `SELECT content FROM match_documents($1, $2)`,
    [pgvector.toSql(embedding), 5]
  );
  console.log(retrievedEmbedings.rows);
  return retrievedEmbedings.rows;
};

const llm = new ChatOpenAI({
  openAIApiKey,
});

const answerLlm = new ChatOpenAI({
  openAIApiKey,
  streaming: true,
  callbackManager: CallbackManager.fromHandlers({
    async handleLLMNewToken(token) {
      console.log({ token });
      socket.ioObject.emit('answer', token)
    },
    async handleLLMEnd(output) {
      socket.ioObject.emit('end', true)
    },
  }),
});

// UTILS -----------------------------------

const combineDocuments = (docs) => {
  return docs.map((doc) => doc.content).join("\n\n");
};

//Templates -----------------

const standaloneQuestionTemplate = `
Given a question and the conv_history, convert it to a standalone question as fast as
possible dont get to much based on the conv_history if it is not related to the question.
   question: {question}
   conv_history: {conv_history}
   `;

const answerTemplate = `
You are a helpful and enthusiastic support bot who can answer a given question
about the codebase based on the context provided but also considering the conv_history but remember that
context holds more weight than the conv_history you should go to history only when you cant find any data related 
to the question in the context. If the question is not about something included in the code base but for 
something new the user wants to add to the code give your best 3 options . Always speak as you are a senior developer 
college talking to a junior developer so be very detailed in your answer also polite and understanding and try to answer as fast as possible and also you have a maximum of 400 tokens to answer.
context: {context}
question: {question}
answer:
`;

const filePathTemplate = `
Given the question , the context also the conv_history find in the context the correct file path the 
answer is found to and your response, it should be something similar to 'path: src/test.js' in the context, 
you should be only the path no extra words and make sure you dont remove file extensions from the path.
context: {context}
question: {question}
path:
`;

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

const filePathPrompt = PromptTemplate.fromTemplate(filePathTemplate);

// Sequences -------------------------------------------------------------------

const standaloneQuestionChain = standaloneQuestionPrompt
  .pipe(llm)
  .pipe(new StringOutputParser());

const retrieverChain = RunnableSequence.from([
  (prevResult) => prevResult.standalone_question,
  retriever,
  combineDocuments,
]);

const answerChain = answerPrompt.pipe(answerLlm).pipe(new StringOutputParser());

const filePathChain = filePathPrompt.pipe(llm).pipe(new StringOutputParser());

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
  },
  answerAndPathMap,
]);

// FINAL FUNCTION ----------------------------------------

// Modify the function to output partial responses
const getAnswer = async (question, conv_history) => {
  const response = await chain.invoke({
    question,
    conv_history,
  });

  return response;
};

const retrieveAIResponse = async (req, res) => {
  try {
    const { question, conv_history } = req.body;
    const aiResponse = await getAnswer(question, conv_history);
    res.json(aiResponse);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  retrieveAIResponse,
};
