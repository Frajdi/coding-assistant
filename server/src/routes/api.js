const express = require("express");
const passport = require("passport");
const cookieSession = require("cookie-session");
const { Strategy } = require("passport-github2");
const repoRouter = require("./repos/repos.router");
const { createNewUser } = require("../models/users.model");
const authRouter = require("./authorization/authorization.router");
const artificialIntelligenceRouter = require("./ai_LLM/question.router");
const vectorizeRouter = require('./vectorize/vectorize.router');
require("dotenv").config();

const api = express.Router();

const config = {
  CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
  callbackURL: "/v1/auth/github/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

const verifyCallback = async (accessToken, refreshToken, profile, done) => {
  const { id, username } = profile;
  await createNewUser(id, username, accessToken);
  token = accessToken;
  profile = profile;
  done(null, profile);
};

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, id);
});



api.use(
  cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);

api.use(passport.initialize());

api.use(passport.session());

api.use("/auth", authRouter);
api.use("/repos", repoRouter);
api.use("/ai", artificialIntelligenceRouter);
api.use("/vectorize", vectorizeRouter);

module.exports = api;
