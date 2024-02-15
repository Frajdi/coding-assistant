export const repoData = [
  {
    path: "src/fetchDataToDb.js",
    content:
      "import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'; @newLine@import { createClient } from '@supabase/supabase-js'; @newLine@import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'; @newLine@import { OpenAIEmbeddings } from '@langchain/openai'; @newLine@import { data } from './data.js'; @newLine@ @newLine@function flattenJSON(obj, parentKey = '') { @newLine@ let result = ''; @newLine@ @newLine@ for (const key in obj) { @newLine@ if (obj.hasOwnProperty(key)) { @newLine@ const currentKey = parentKey ? `${parentKey}.${key}` : key; @newLine@ @newLine@ if (typeof obj[key] === 'object' && obj[key] !== null) { @newLine@ result += flattenJSON(obj[key], currentKey); @newLine@ } else { @newLine@ result += `${currentKey}=${obj[key]} `; @newLine@ } @newLine@ } @newLine@ } @newLine@ @newLine@ return result; @newLine@} @newLine@ @newLine@const splitter = RecursiveCharacterTextSplitter.fromLanguage('js', { @newLine@ chunkSize: 2000, @newLine@ chunkOverlap: 200, @newLine@ separators: ['\\n\\n', '\\n', ' ', ''], // default setting @newLine@}); @newLine@const fetchDataToVector = async () => { @newLine@ try { @newLine@ const text = flattenJSON(data); @newLine@ @newLine@ const output = await splitter.createDocuments([text]); @newLine@ @newLine@ const texts = await splitter.splitDocuments(output); @newLine@ @newLine@ const sbApiKey = @newLine@ 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aGJ3eHNiamlsZ2dseWx1YXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1MjQwNTAsImV4cCI6MjAyMTEwMDA1MH0.EVySSW42rwaQPnKojsUdd-3DdEpRDF3XFvI2u9WoHS0'; @newLine@ const sbUrl = 'https://vvhbwxsbjilgglyluate.supabase.co'; @newLine@ const openAIApiKey = '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'; @newLine@ @newLine@ const client = createClient(sbUrl, sbApiKey); @newLine@ @newLine@ await SupabaseVectorStore.fromDocuments( @newLine@ texts, @newLine@ new OpenAIEmbeddings({ openAIApiKey }), @newLine@ { @newLine@ client, @newLine@ tableName: 'documents', @newLine@ } @newLine@ ); @newLine@ } catch (err) { @newLine@ console.log(err); @newLine@ } @newLine@}; @newLine@ @newLine@fetchDataToVector(); @newLine@",
  },
  {
    path: "src/index.js",
    content:
      "import { chain } from './retriever'; @newLine@ @newLine@document.addEventListener('submit', (e) => { @newLine@ e.preventDefault(); @newLine@ progressConversation(); @newLine@}); @newLine@ @newLine@ @newLine@async function progressConversation() { @newLine@ const userInput = document.getElementById('user-input'); @newLine@ const chatbotConversation = document.getElementById('chatbot-conversation-container'); @newLine@ const question = userInput.value; @newLine@ userInput.value = ''; @newLine@ @newLine@ // add human message @newLine@ const newHumanSpeechBubble = document.createElement('div'); @newLine@ newHumanSpeechBubble.classList.add('speech', 'speech-human'); @newLine@ chatbotConversation.appendChild(newHumanSpeechBubble); @newLine@ newHumanSpeechBubble.textContent = question; @newLine@ chatbotConversation.scrollTop = chatbotConversation.scrollHeight; @newLine@ const response = await chain.invoke({ @newLine@ question @newLine@ }); @newLine@ @newLine@ // add AI message @newLine@ const newAiSpeechBubble = document.createElement('div'); @newLine@ newAiSpeechBubble.classList.add('speech', 'speech-ai'); @newLine@ chatbotConversation.appendChild(newAiSpeechBubble); @newLine@ newAiSpeechBubble.textContent = response; @newLine@ chatbotConversation.scrollTop = chatbotConversation.scrollHeight; @newLine@}",
  },
  {
    path: "src/retriever.js",
    content:
      "import { ChatOpenAI } from '@langchain/openai'; @newLine@import { PromptTemplate } from '@langchain/core/prompts'; @newLine@import { createClient } from '@supabase/supabase-js'; @newLine@import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'; @newLine@import { OpenAIEmbeddings } from '@langchain/openai'; @newLine@import { StringOutputParser } from '@langchain/core/output_parsers'; @newLine@import { @newLine@ RunnablePassthrough, @newLine@ RunnableSequence, @newLine@ RunnableMap, @newLine@} from '@langchain/core/runnables'; @newLine@ @newLine@const openAIApiKey = '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'; @newLine@const sbApiKey = @newLine@ 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aGJ3eHNiamlsZ2dseWx1YXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1MjQwNTAsImV4cCI6MjAyMTEwMDA1MH0.EVySSW42rwaQPnKojsUdd-3DdEpRDF3XFvI2u9WoHS0'; @newLine@const sbUrl = 'https://vvhbwxsbjilgglyluate.supabase.co'; @newLine@ @newLine@const embeddings = new OpenAIEmbeddings({ openAIApiKey }); @newLine@const client = createClient(sbUrl, sbApiKey); @newLine@const vectorStore = new SupabaseVectorStore(embeddings, { @newLine@ client, @newLine@ tableName: 'documents', @newLine@ queryName: 'match_documents', @newLine@}); @newLine@const retriever = vectorStore.asRetriever({ @newLine@ searchType: 'mmr', // Use max marginal relevance search @newLine@ searchKwargs: { fetchK: 5 }, @newLine@}); @newLine@const llm = new ChatOpenAI({ @newLine@ openAIApiKey, @newLine@ maxTokens: 400, @newLine@ streaming: true, @newLine@}); @newLine@ @newLine@// UTILS ----------------------------------- @newLine@ @newLine@const combineDocuments = (docs) => { @newLine@ return docs.map((doc) => doc.pageContent).join('\\n\\n'); @newLine@}; @newLine@ @newLine@const convHistory = [ @newLine@ 'Human: Can you explain to me how does the Subtask slider work', @newLine@ 'AI:\\'The SubtaskSlider component is a functional component that renders a slider interface for subtasks. It uses the `useChatGPT` hook to handle user input and AI activation. The component also manages state for the hovered index and images displayed in the slider. When the `isLoading` state is false and `aiImages` is available, the component updates the images displayed in the slider.', @newLine@]; @newLine@const formatConvHistory = (convArray) => { @newLine@ try { @newLine@ return convArray.join('\\n'); @newLine@ } catch (error) { @newLine@ return ''; @newLine@ } @newLine@ }; @newLine@ @newLine@//Templates ----------------- @newLine@ @newLine@const standaloneQuestionTemplate = `Given a question and the conv_history, convert it to a standalone question as fast as possible. @newLine@ question: {question} @newLine@ conv_history: {conv_history} @newLine@ `; @newLine@ @newLine@const answerTemplate = ` @newLine@You are a helpful and enthusiastic support bot who can answer a given question @newLine@about the codebase based on the context provided but also considering the conv_history. @newLine@Try to find the answer in the context also try to not show any piece of code in from the context unless it is a fix or modification asked, just answer the question briefly because the limit of tokens you have is 300. @newLine@If the question is not about @newLine@something included in the code base but for something new the user wants to add to the code @newLine@give your best 3 options . Always speak as you are a senior developer college so be polite and understanding and try to answer as fast as possible. @newLine@context: {context} @newLine@question: {question} @newLine@conv_history: {conv_history} @newLine@answer: @newLine@`; @newLine@ @newLine@const filePathTemplate = ` @newLine@Given the question , the context also the conv_history find in the context the correct file path the @newLine@question is refering to and your response should be only the path no extra words and make sure you dont remove file extensions from the path. @newLine@context: {context} @newLine@question: {question} @newLine@conv_history: {conv_history} @newLine@path: @newLine@`; @newLine@ @newLine@const answerPrompt = PromptTemplate.fromTemplate(answerTemplate); @newLine@ @newLine@const standaloneQuestionPrompt = PromptTemplate.fromTemplate( @newLine@ standaloneQuestionTemplate @newLine@); @newLine@ @newLine@const filePathPrompt = PromptTemplate.fromTemplate(filePathTemplate); @newLine@ @newLine@// Sequences --------- @newLine@ @newLine@const standaloneQuestionChain = standaloneQuestionPrompt @newLine@ .pipe(llm) @newLine@ .pipe(new StringOutputParser()); @newLine@ @newLine@const retrieverChain = RunnableSequence.from([ @newLine@ (prevResult) => prevResult.standalone_question, @newLine@ retriever, @newLine@ combineDocuments, @newLine@]); @newLine@ @newLine@const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser()); @newLine@ @newLine@const filePathChain = filePathPrompt.pipe(llm).pipe(new StringOutputParser()); @newLine@ @newLine@const answerAndPathMap = RunnableMap.from([filePathChain, answerChain]); @newLine@ @newLine@const chain = RunnableSequence.from([ @newLine@ { @newLine@ standalone_question: standaloneQuestionChain, @newLine@ original_input: new RunnablePassthrough(), @newLine@ }, @newLine@ { @newLine@ context: retrieverChain, @newLine@ question: ({ original_input }) => original_input.question, @newLine@ conv_history: ({ original_input }) => original_input.conv_history, @newLine@ }, @newLine@ answerAndPathMap @newLine@]); @newLine@ @newLine@// FINAL FUNCTION ---------------------------------------- @newLine@ @newLine@const getAnswer = async (question, conv_history) => { @newLine@ convHistory.push(`Human: ${question}`); @newLine@ @newLine@ const response = await chain.invoke({ @newLine@ question, @newLine@ conv_history, @newLine@ }); @newLine@ @newLine@ convHistory.push(`AI: ${response}`); @newLine@ @newLine@ return response; @newLine@}; @newLine@ @newLine@const response = await getAnswer( @newLine@ 'How is the dimensions of the images calculated ?', @newLine@ formatConvHistory(convHistory) @newLine@); @newLine@ @newLine@console.log(response); @newLine@",
  },
];
