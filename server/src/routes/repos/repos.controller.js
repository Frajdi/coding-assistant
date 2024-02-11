const axios = require("axios");
const { getUserById } = require("../../models/users.model");

const checkLoggedIn = (req, res, next) => {
  const loggedIn = req.isAuthenticated() && req.user;
  if (!loggedIn) {
    return res.status(401).json({
      error: "You must log in!",
    });
  }
  next();
};

const MAX_FILE_SIZE_BYTES = 50 * 1024; // 50KB

const fetchFile = async (file, accessToken) => {
  const fileUrl = file.download_url || file.url;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    // Fetch the file metadata without downloading the content
    const response = await axios.head(fileUrl, { headers });

    // Check if the content length is within the limit
    const contentLength = parseInt(response.headers['content-length'], 10);
    if (contentLength > MAX_FILE_SIZE_BYTES) {
      console.log(`File ${file.path} exceeds the size limit and will not be fetched.`);
      return null;
    }

    // If the file size is within the limit, fetch the content
    const fileResponse = await axios.get(fileUrl, { headers });
    return {
      path: file.path,
      content: fileResponse.data,
    };
  } catch (error) {
    console.error(`Failed to fetch file ${file.path}:`, error.message);
    return null;
  }
};

const processItem = async (item, owner, repo, accessToken) => {
  if (item.type === "file") {
    return fetchFile(item, accessToken);
  } else if (item.type === "dir") {
    return fetchFilesRecursively(owner, repo, item.path, accessToken);
  } else {
    return null; // Return null for items that are not files or directories
  }
};

const fetchFilesRecursively = async (owner, repo, path, accessToken) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github.v3.raw",
  };

  try {
    const response = await axios.get(url, { headers });

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch directory content. Status code: ${response.status}`
      );
    }

    const contents = response.data;

    // Fetch file contents and filter them concurrently
    const result = await Promise.all(contents.map((item) =>
      processItem(item, owner, repo, accessToken)
    ));

    const filteredResult = result.filter((item) => item !== null);

    // Flatten the result array
    return filteredResult.flat();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const getRepoByName = async (repoName, accessToken, userName) => {
  try {
    const repoContent = await fetchFilesRecursively(
      userName,
      repoName,
      "",
      accessToken
    );

    return repoContent;
  } catch (error) {
    throw new Error(`Failed to fetch repo ${repoName}`);
  }
};

const getRepoContentsByName = async (req, res) => {
  const { repo_name } = req.params;

  try {
    const { user_name, access_token } = await getUserById(req.user);

    const repoContent = await getRepoByName(repo_name, access_token, user_name);
    // Format the content property of each object
    repoContent.forEach((obj) => {
      if (typeof obj.content === "string") {
        obj.content = obj.content.replace(/\n/g, "@newLine@");
      }
    });

    // Send the formatted repoContent to the frontend
    res.json(repoContent);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllRepositories = async (req, res) => {
  try {
    const { user_name, access_token } = await getUserById(req.user);

    // Fetch user's repositories using the GitHub API
    const { data: repositories } = await axios.get(
      `https://api.github.com/users/${user_name}/repos`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // Fetch owner's data and languages_url for each repository
    const repositoriesWithDetails = await Promise.all(
      repositories.map(async (repo) => {
        const ownerData = await axios.get(repo.owner.url, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        const languagesData = await axios.get(repo.languages_url, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        return {
          ...repo,
          owner: ownerData.data,
          languages: languagesData.data,
        };
      })
    );

    return res.json({
      user: user_name,
      repositories: repositoriesWithDetails,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch repositories",
    });
  }
};

module.exports = { checkLoggedIn, getAllRepositories, getRepoContentsByName, getRepoByName };
