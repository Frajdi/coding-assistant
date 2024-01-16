const express = require("express");
const { 
    logOut,
    authFail,
    authenticateWithGitHub,
    authenticationCallback
} = require('./authorization.controller');

const authRouter = express.Router();


authRouter.get("/github", authenticateWithGitHub);

authRouter.get("/github/callback", authenticationCallback);

authRouter.get("/logout", logOut);

authRouter.get("/failure", authFail);

module.exports = authRouter;