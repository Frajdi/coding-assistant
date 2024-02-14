const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { getRepositoryByName } = require("../repos/repos.controller");
const { getUserById } = require("../../models/users.model");
const { OpenAIEmbeddings } = require("@langchain/openai");
const client = require("../../services/db");
const pgvector = require("pgvector/pg");
require("dotenv").config();

const openAiKey = process.env.OPENAI_KEY;

const openAIEmbeddings = new OpenAIEmbeddings({
  openAIApiKey: openAiKey,
  modelName: "text-embedding-3-small",
  dimensions: 1536,
});

function stringifyData(data) {
  // Check if the data is an object or an array
  if (typeof data === "object" && data !== null) {
    // If it's an array, stringify each element
    if (Array.isArray(data)) {
      return `[${data.map((item) => stringifyData(item)).join(", ")}]`;
    }

    // If it's an object, stringify each key-value pair
    const keyValuePairs = Object.entries(data).map(
      ([key, value]) => `"${key}": ${stringifyData(value)}`
    );
    return `{${keyValuePairs.join(", ")}}`;
  } else {
    // If it's not an object or array, stringify the primitive value
    return JSON.stringify(data);
  }
}

function filterRepo(repo) {
  // Function to check if a file path indicates an image, package.lock.json, or node_modules
  const isExcludedFile = (path) => {
    const excludedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      "mp3",
      "mp4",
      ".lock",
      ".json",
      ".yml",
      ".yaml",
      ".xml",
      ".md",
    ];
    const excludedFiles = [".gitignore", "LICENSE"];
    const excludedFolders = ["node_modules", "assets", "dist", "build"];

    const lowerPath = path.toLowerCase();

    if (excludedExtensions.some((ext) => lowerPath.endsWith(ext))) {
      return true;
    }

    if (excludedFiles.includes(lowerPath)) {
      return true;
    }

    if (excludedFolders.some((folder) => lowerPath.includes(`/${folder}/`))) {
      return true;
    }

    return false;
  };
  // Filter out objects based on the isExcludedFile function
  const filteredRepo = repo.filter((file) => !isExcludedFile(file.path));
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
  console.log(data, "zeroth");
  try {
    console.log(data, "first");
    const text = flattenJSON(data);
    console.log(text, "second");
    const output = await splitter.createDocuments([text]);
    console.log(output, "third");
    const texts = await splitter.splitDocuments(output);
    console.log(texts, "fourth");
    const contents = texts.map((text) => text.pageContent);
    console.log(Array.isArray(contents), "fifth");
    const embeddings = await openAIEmbeddings.embedDocuments(contents);
    console.log(embeddings, "sixth");
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

const addNewFetchedRepository = async (repoId, userId, repoName, updatedAt) => {
  try {
    await client.query(
      `INSERT INTO fetched_repositories (repository_id, user_id, name, updated_at) VALUES ($1, $2, $3, $4)`,
      [repoId, userId, repoName, updatedAt]
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const fetchDataFromRepoName = async (req, res) => {
  console.log("teeeeesssssttttt");
  const { repo_name, id, updated_at } = req.body;
  const { user_name, access_token } = await getUserById(req.user);

  try {
    await addNewFetchedRepository(id, req.user, repo_name, updated_at);

    const repoData = await getRepositoryByName(
      repo_name,
      access_token,
      user_name
    );
    const fileteredRepo = filterRepo(repoData)
    const response = await fetchDataToVector(fileteredRepo);
    res.json({ message: "success" });
    // res.json({ message: "test" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { fetchDataFromRepoName };
