const { getUserById } = require("../../models/users.model");
const { getFetchedRepos } = require("../../models/fetchedRepos.model");
const {
  fetchFilesRecursive,
  getRepositoriesList,
} = require("../../models/githubRepos.model");

const getRepositoryByName = async (repoName, accessToken, userName) => {
  try {
    const repoData = await fetchFilesRecursive(userName, repoName, "", accessToken); 
    return repoData
  } catch (error) {
    throw new Error(`Failed to fetch repo ${repoName}`);
  }
};

const getRepositoryContentsByName = async (req, res) => {
  const { repo_name } = req.params;

  try {
    const { user_name, access_token } = await getUserById(req.user);
    let repoContent = await getRepositoryByName(
      repo_name,
      access_token,
      user_name
    );

    repoContent.forEach((obj) => {
      if (typeof obj.content === "string") {
        obj.content = obj.content.replace(/\n/g, "@newLine@");
      }
    });

    res.json(repoContent);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllRepositories = async (req, res) => {
  try {
    const { user_name, access_token } = await getUserById(req.user);

    const { data } = await getRepositoriesList(user_name, access_token);

    console.log("====>", data);
    res.json(data);
  } catch (error) {
    console.error("Failed to fetch repositories:", error.message);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
};

const getAllFetchedRepositories = async (req, res) => {
  try {
    const fetchedRepos = await getFetchedRepos();
    res.json({ fetchedRepos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllRepositories,
  getRepositoryContentsByName,
  getRepositoryByName,
  getAllFetchedRepositories,
};
