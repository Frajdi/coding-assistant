const axios = require("axios");
const { getUserById } = require("../../models/users.model");

const checkLoggedIn = (req, res, next) => {
  console.log(req);
  const logedIn = req.isAuthenticated() && req.user;
  if (!logedIn) {
    return res.status(401).json({
      error: "You must log in!",
    });
  }
  next();
};

const getAllRepositories = async (req, res) => {
  try {
    const { user_name, access_token } = await getUserById(req.user);

    // Fetch user's repositories using the GitHub API
    const { data } = await axios.get(
      `https://api.github.com/users/${user_name}/repos`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return res.json({
      user: user_name,
      repositories: data,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: "Failed to fetch repositories",
    });
  }
};


// const fetchFilesRecursively = async (owner, repo, path, accessToken) => {
//   const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

//   const headers = {
//     Authorization: `Bearer ${accessToken}`,
//     Accept: 'application/vnd.github.v3.raw', // Specify raw content response
//   };

//   try {
//     const response = await axios.get(url, { headers });

//     if (response.status !== 200) {
//       throw new Error(`Failed to fetch directory content. Status code: ${response.status}`);
//     }

//     const contents = response.data;

//     // Process each item in the directory
//     const filePromises = contents.map(async (item) => {
//       if (item.type === 'file') {
//         const fileUrl = item.download_url || item.url; // Use download_url if available
//         const fileContentResponse = await axios.get(fileUrl, { headers });
//         const fileContent = fileContentResponse.data;

//         return {
//           path: item.path,
//           content: fileContent,
//         };
//       } else if (item.type === 'dir') {
//         // Recursively fetch files in subdirectories
//         return fetchFilesRecursively(owner, repo, item.path, accessToken);
//       }
//     });

//     return Promise.all(filePromises);
//   } catch (error) {
//     console.error(error.message);
//     throw error; // Re-throw the error to propagate it up the call stack
//   }
// };

const fetchFile = async (file, accessToken) => {
  const fileUrl = file.download_url || file.url;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const response = await axios.get(fileUrl, { headers });
  return {
    path: file.path,
    content: response.data,
  };
};

const processItem = async (item, owner, repo, accessToken) => {
  if (item.type === 'file') {
    return fetchFile(item, accessToken);
  } else if (item.type === 'dir') {
    const subdirectoryContent = await fetchFilesRecursively(owner, repo, item.path, accessToken);
    return subdirectoryContent;
  }
};

const fetchFilesRecursively = async (owner, repo, path, accessToken) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github.v3.raw',
  };

  try {
    const response = await axios.get(url, { headers });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch directory content. Status code: ${response.status}`);
    }

    const contents = response.data;

    const filePromises = contents.map(item => processItem(item, owner, repo, accessToken));

    const result = await Promise.all(filePromises);

    return result.flat(); // Flatten the array of arrays
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};




const getRepoContentsByName = async (req, res) => {
  const { repo_name } = req.params;

  try {
    const { user_name, access_token } = await getUserById(req.user);

    const repoContent = await fetchFilesRecursively(user_name, repo_name, '', access_token);
    console.log(repoContent);
    res.json(repoContent);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { checkLoggedIn, getAllRepositories, getRepoContentsByName};
