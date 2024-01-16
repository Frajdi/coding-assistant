const pool = require("../../services/db");
const axios = require('axios');

const getUserById = async(id) => {
    try {
      const res = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      console.log(res.rows[0]);
      return res.rows[0]
    } catch (error) {
      console.log(error);
      return;
    }
}

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
    const {data} = await axios.get(`https://api.github.com/users/${user_name}/repos`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

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

module.exports = {checkLoggedIn, getAllRepositories};