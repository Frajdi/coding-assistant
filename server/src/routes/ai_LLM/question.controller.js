const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { createClient } = require("@supabase/supabase-js");
const { SupabaseVectorStore } = require("@langchain/community/vectorstores/supabase");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const {
  RunnablePassthrough,
  RunnableSequence,
  RunnableMap,
} = require("@langchain/core/runnables");

const openAIApiKey = "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";
const sbApiKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aGJ3eHNiamlsZ2dseWx1YXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1MjQwNTAsImV4cCI6MjAyMTEwMDA1MH0.EVySSW42rwaQPnKojsUdd-3DdEpRDF3XFvI2u9WoHS0";
const sbUrl = "https://vvhbwxsbjilgglyluate.supabase.co";

const embeddings = new OpenAIEmbeddings({ openAIApiKey });
const client = createClient(sbUrl, sbApiKey);

const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: "documents",
  queryName: "match_documents",
});

const retriever = vectorStore.asRetriever({
  searchType: "mmr", // Use max marginal relevance search
  searchKwargs: { fetchK: 5 },
});

const llm = new ChatOpenAI({
  openAIApiKey,
//   maxTokens: 400,
  streaming: true,
});

// UTILS -----------------------------------

const combineDocuments = (docs) => {
  return docs.map((doc) => doc.pageContent).join("\n\n");
};

//Templates -----------------

const standaloneQuestionTemplate = `
Given a question and the conv_history, convert it to a standalone question as fast as
possible dont get to much based on the conv history if it is not related to the question.
   question: {question}
   conv_history: {conv_history}
   `;

const answerTemplate = `
You are a helpful and enthusiastic support bot who can answer a given question
about the codebase based on the context provided but also considering the conv_history but remember that
context holds more weight than the conv_history you should go to history only when you cant find any data related 
to the question in the context. Try to find the answer in the context also try to not show any piece of code in from the 
context unless it is a fix or modification. If the question is not about something included in the code base but for 
something new the user wants to add to the code give your best 3 options . Always speak as you are a senior developer 
college talking to a junior developer so be very detailed in your answer also polite and understanding and try to answer as fast as possible and also you have a maximum of 400 tokens to answer.
context: {context}
question: {question}
conv_history: {conv_history}
answer:
`;

const filePathTemplate = `
Given the question , the context also the conv_history find in the context the correct file path the 
answer is found to and your response, it should be something similar to 'path: src/test.js' in the context, 
you should be only the path no extra words and make sure you dont remove file extensions from the path.
context: {context}
question: {question}
conv_history: {conv_history}
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

const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

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
    conv_history: ({ original_input }) => original_input.conv_history,
  },
  answerAndPathMap,
]);

// FINAL FUNCTION ----------------------------------------

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
