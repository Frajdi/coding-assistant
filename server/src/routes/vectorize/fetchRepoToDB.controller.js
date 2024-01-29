const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { createClient } = require("@supabase/supabase-js");
const {
  SupabaseVectorStore,
} = require("@langchain/community/vectorstores/supabase");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { getRepoByName } = require("../repos/repos.controller");
const {getUserById} = require("../../models/users.model");



const sbApiKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aGJ3eHNiamlsZ2dseWx1YXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1MjQwNTAsImV4cCI6MjAyMTEwMDA1MH0.EVySSW42rwaQPnKojsUdd-3DdEpRDF3XFvI2u9WoHS0";
const sbUrl = "https://vvhbwxsbjilgglyluate.supabase.co";
const openAIApiKey = "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";


function filterRepo(repo) {
  // Function to check if a file path indicates an image, package.lock.json, or node_modules
  const isExcludedFile = (path) => {
    const excludedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const excludedFiles = ['package.lock.json'];
    const excludedFolders = ['node_modules'];

    const lowerPath = path.toLowerCase();
    
    // Check for excluded extensions
    if (excludedExtensions.some(ext => lowerPath.endsWith(ext))) {
      return true;
    }

    // Check for excluded files
    if (excludedFiles.includes(lowerPath)) {
      return true;
    }

    // Check for excluded folders
    if (excludedFolders.some(folder => lowerPath.includes(`/${folder}/`))) {
      return true;
    }

    return false;
  };

  // Filter out objects based on the isExcludedFile function
  const filteredRepo = repo.filter(file => !isExcludedFile(file.path));
  return filteredRepo.map((file) => {
    file.content = encodeURI(file.content)
    return file
  })
}

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
  chunkSize: 600,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", " ", ""], // default setting
});

const fetchDataToVector = async (data) => {
  try {
    const text = flattenJSON(data);

    const output = await splitter.createDocuments([text]);

    const texts = await splitter.splitDocuments(output);

    const client = createClient(sbUrl, sbApiKey);

    await SupabaseVectorStore.fromDocuments(
      texts,
      new OpenAIEmbeddings({ openAIApiKey }),
      {
        client,
        tableName: "documents",
      }
    );
    return "succefully vectorized and inserted repo data to DB";
  } catch (err) {
    console.log(err);
    throw new Error("failed to vectorize and inseart repo to db");
  }
};

const fetchDataFromRepoName = async (req, res) => {
  console.log('calleeeeeeeeed');
  const { repo_name } = req.params;
  
  
  try {
    const { user_name, access_token } = await getUserById(req.user);
    const repoData = await getRepoByName(repo_name, access_token, user_name);

    const response = await fetchDataToVector(filterRepo(repoData));
    console.log('sync-response', response);
    res.json({ message: response });
  } catch (error) {
    console.log('sync-error',error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { fetchDataFromRepoName };
