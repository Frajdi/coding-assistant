require("dotenv").config();
const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

const openAIKey = process.env.OPENAI_KEY;

const llm = new ChatOpenAI({
  openAIApiKey: openAIKey,
});

const filePathTemplate = `
Given the question , the context also the conv_history find in the context the correct file path the 
the user is refering to, take the path in the context,  the format should be like this 'path: src/test.js'.

If you find the path return it with the same format as you find it dont add anything to it.

If the path isn't found answer with 'I dont know the path'

context: {context}
conv_history: {conv_history}
question: {question}
path:
`;

const filePathPrompt = PromptTemplate.fromTemplate(filePathTemplate);

const filePathChain = filePathPrompt.pipe(llm).pipe(new StringOutputParser());

module.exports = filePathChain;
