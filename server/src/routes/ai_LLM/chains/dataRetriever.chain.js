require("dotenv").config();
const pgvector = require("pgvector/pg");
const client = require("../../../services/db");
const { OpenAIEmbeddings } = require("@langchain/openai");
const combineDocuments = require("./utils/combineDocumnets");
const { RunnableSequence } = require("@langchain/core/runnables");

const openAIKey = process.env.OPENAI_KEY;

const openAIEmbeddings = new OpenAIEmbeddings({
  openAIApiKey: openAIKey,
  modelName: 'text-embedding-3-small',
  dimensions: 1536,
});

const retriever = async (standAloneQuestion) => {
  const embedding = await openAIEmbeddings.embedQuery(standAloneQuestion);
  const retrievedEmbedings = await client.query(
    `SELECT content FROM match_documents($1, $2)`,
    [pgvector.toSql(embedding), 10]
  );
  return retrievedEmbedings.rows;
};

const retrieverChain = RunnableSequence.from([
  (prevResult) => prevResult.standalone_question,
  retriever,
  combineDocuments,
]);

module.exports = retrieverChain;
