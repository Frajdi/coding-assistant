const fs = require("fs");
const pool = require("./services/db");
const path = require("path");
const https = require("https");
const axios = require('axios');
const helmet = require("helmet");
const express = require("express");
const passport = require("passport");
const cookieSession = require("cookie-session");
const { Strategy } = require("passport-github2");

const PORT = 3000;

const setUpDatabase = async () => {
  try {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS users(id INT, user_name VARCHAR(50), access_token VARCHAR(50))"
    );
    console.log("Database Ready");
    return;
  } catch (error) {
    console.log(error);
    return;
  }
};

const createNewUser = async (id, userName, accessToken) => {
  try { 
    const res = await pool.query(
      "INSERT INTO users(id, user_name, access_token) VALUES($1, $2, $3) RETURNING *",
      [id, userName, accessToken]
    );
    return console.log(res.rows[0]);
  } catch (error) {
    console.log(error);
    return;
  }
};


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

const config = {
  CLIENT_ID: "c020288fd5a399a67e79",
  CLIENT_SECRET: "3440256f830156b63c6078ee55382fb1c20aa6a4",
  COOKIE_KEY_1: "mainKey",
  COOKIE_KEY_2: "rotationKey",
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/github/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};


const verifyCallback = async(accessToken, refreshToken, profile, done) => {
  // console.log("User profile =========> ", profile, "<==========");
  // console.log("accessToken =========> ", accessToken, "<==========");
  const {id, username} = profile;
  await createNewUser(id, username, accessToken)
  token = accessToken;
  profile = profile;
  done(null, profile);
};

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // console.log("deserialized user Data ----------", id);
  done(null, id);
});

const app = express();

// setting Up middleware

app.use(helmet());

app.use(
  cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);

app.use(passport.initialize());

app.use(passport.session());

const checkLoggedIn = (req, res, next) => {
  const logedIn = req.isAuthenticated() && req.user;
  if (!logedIn) {
    return res.status(401).json({
      error: "You must log in!",
    });
  }
  next();
};

// Route Handlers

app.get(
  "/auth/github",
  passport.authenticate("github", {
    scope: ["user:email", "read:repo_hook"],
  })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: true,
  }),
  (req, res) => {
    // const accessToken = req.user.accessToken;
    // console.log("User profile =========> ", accessToken,"<==========");
    console.log("Github called us back!");
  }
);

app.get("/auth/logout", (req, res) => {
  req.logOut();
  return res.redirect("/");
});

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/repositories", checkLoggedIn, async (req, res) => {
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

app.get("/failure", (req, res) => {
  return res.send("Failed to log in!");
});

const startServer = async () => {
  await setUpDatabase();

  https
    .createServer(
      {
        cert: fs.readFileSync("cert.pem"),
        key: fs.readFileSync("key.pem"),
      },
      app
    )
    .listen(PORT, () => {
      console.log(`Server listening in port : ${PORT}`);
    });
};

startServer();
