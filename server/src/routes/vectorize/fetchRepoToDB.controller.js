const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { getRepoByName } = require("../repos/repos.controller");
const { getUserById } = require("../../models/users.model");
const { OpenAIEmbeddings } = require("@langchain/openai");
const client = require("../../services/db");
const pgvector = require("pgvector/pg");
require('dotenv').config();

const openAiKey = process.env.OPENAI_KEY;

const openAIEmbeddings = new OpenAIEmbeddings({
  openAIApiKey: openAiKey,
  dimensions: 1536,
});


function stringifyData(data) {
  // Check if the data is an object or an array
  if (typeof data === 'object' && data !== null) {
    // If it's an array, stringify each element
    if (Array.isArray(data)) {
      return `[${data.map(item => stringifyData(item)).join(', ')}]`;
    }
    
    // If it's an object, stringify each key-value pair
    const keyValuePairs = Object.entries(data)
      .map(([key, value]) => `"${key}": ${stringifyData(value)}`);
    return `{${keyValuePairs.join(', ')}}`;
  } else {
    // If it's not an object or array, stringify the primitive value
    return JSON.stringify(data);
  }
}

function filterRepo(repo) {
  // Function to check if a file path indicates an image, package.lock.json, or node_modules
  const isExcludedFile = (path) => {
    const excludedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", "mp3", "mp4"];
    const excludedFiles = ["package-lock.json"];
    const excludedFolders = ["node_modules"];

    const lowerPath = path.toLowerCase();

    // Check for excluded extensions
    if (excludedExtensions.some((ext) => lowerPath.endsWith(ext))) {
      return true;
    }

    // Check for excluded files
    if (excludedFiles.includes(lowerPath)) {
      return true;
    }

    // Check for excluded folders
    if (excludedFolders.some((folder) => lowerPath.includes(`/${folder}/`))) {
      return true;
    }

    return false;
  };

  // Filter out objects based on the isExcludedFile function
  const filteredRepo = repo.filter((file) => !isExcludedFile(file.path));
  // return filteredRepo.map((file) => {
  //   file.content = encodeURI(file.content);
  //   return file;
  // });

  console.log(filteredRepo);

  const preparedRepo = filteredRepo.map((file) => stringifyData(file.content));

  return preparedRepo;
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

    const contents = texts.map((text) => text.pageContent);

    const embeddings = await openAIEmbeddings.embedDocuments(contents);

    for (let [index, document] of texts.entries()) {
      await client.query(
        `INSERT INTO documents (content, metadata, embedding) VALUES ($1, $2, $3)`,
        [
          document.pageContent,
          document.metadata,
          pgvector.toSql(embeddings[index]),
        ]
      );
    }
    return "Successfully vectorized and inserted repo data to DB";
  } catch (err) {
    throw new Error("Failed to vectorize and insert repo to DB");
  }
};

const fetchDataFromRepoName = async (req, res) => {
  const { repo_name } = req.params;

  try {
    const { user_name, access_token } = await getUserById(req.user);
    const repoData = await getRepoByName(repo_name, access_token, user_name);

    const response = await fetchDataToVector(filterRepo(repoData));
    res.json({ message: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { fetchDataFromRepoName };
