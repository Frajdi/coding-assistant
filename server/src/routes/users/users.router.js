const axios = require('axios');
const express = require("express");
const { getUserById } = require('./users.controller');


const userRouter = express.Router()

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
  //--------------------------------------------------------
  
  // Route Handlers
  
  userRouter.get("/repositories", checkLoggedIn, async (req, res) => {
    try {
      const { id, user_name, access_token } = await getUserById(req.user);
      
      // Fetch user's repositories using the GitHub API
      const response = await axios.get(`https://api.github.com/users/${user_name}/repos`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
  
      console.log(response);
  
      const repositories = response.data.map(repo => ({
        name: repo.name,
        url: repo.html_url,
      }));
  
      return res.json({
        user: user_name,
        repositories: repositories,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  });

  module.exports = userRouter
  

  