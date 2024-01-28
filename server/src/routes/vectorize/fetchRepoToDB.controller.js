import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";

function flattenJSON(obj, parentKey = "") {
  let result = "";

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const currentKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof obj[key] === "object" && obj[key] !== null) {
        result += flattenJSON(obj[key], currentKey);
      } else {
        result += `${currentKey}=${obj[key]} `;
      }
    }
  }

  return result;
}

const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
  chunkSize: 2000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", " ", ""], // default setting
});


const fetchDataToVector = async (data) => {
  try {
    const text = flattenJSON(data);

    const output = await splitter.createDocuments([text]);

    const texts = await splitter.splitDocuments(output);

    const sbApiKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aGJ3eHNiamlsZ2dseWx1YXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1MjQwNTAsImV4cCI6MjAyMTEwMDA1MH0.EVySSW42rwaQPnKojsUdd-3DdEpRDF3XFvI2u9WoHS0";
    const sbUrl = "https://vvhbwxsbjilgglyluate.supabase.co";
    const openAIApiKey = "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";

    const client = createClient(sbUrl, sbApiKey);

    await SupabaseVectorStore.fromDocuments(
      texts,
      new OpenAIEmbeddings({ openAIApiKey }),
      {
        client,
        tableName: "documents",
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports={fetchDataToVector}