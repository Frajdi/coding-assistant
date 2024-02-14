const axios = require("axios");

const MAX_FILE_SIZE_BYTES = 50 * 1024; // 50KB

const fetchGitHubData = async (url, accessToken) => {
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch data from ${url}:`, error.message);
    throw error;
  }
};

const fetchSingleFile = async (file, accessToken) => {
  const fileUrl = file.download_url || file.url;

  try {
    const response = await axios.head(fileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const contentLength = parseInt(response.headers["content-length"], 10);

    if (contentLength > MAX_FILE_SIZE_BYTES) {
      console.log(
        `File ${file.path} exceeds the size limit and will not be fetched.`
      );
      return null;
    }

    const fileResponse = await axios.get(fileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { path: file.path, content: fileResponse.data };
  } catch (error) {
    console.error(`Failed to fetch file ${file.path}:`, error.message);
    return null;
  }
};

const processItem = async (item, owner, repo, accessToken) => {
  if (item.type === "file") {
    return fetchSingleFile(item, accessToken);
  } else if (item.type === "dir") {
    return fetchFilesRecursive(owner, repo, item.path, accessToken);
  } else {
    return null;
  }
};

const fetchFilesRecursive = async (owner, repo, path, accessToken) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    const contents = await fetchGitHubData(url, accessToken);

    const result = await Promise.all(
      contents.map((item) => processItem(item, owner, repo, accessToken))
    );
    return result.filter((item) => item !== null).flat();
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const getRepositoriesList = async (user_name, access_token) => {
  const query = `
  query GetUserRepositories($userName: String!) {
    user(login: $userName) {
      name
      avatarUrl
      repositories(first: 100) {
        totalCount
        nodes {
          id
          name
          updatedAt
          isPrivate
          owner {
            login
          }
          languages(first: 10) {
            nodes {
              name
              color
            }
          }
        }
      }
      followers {
        totalCount
      }
      following {
        totalCount
      }
    }
  }  
  `;

  const variables = { userName: user_name };

  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      { query, variables },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  fetchFilesRecursive,
  getRepositoriesList
};
