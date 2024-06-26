const passport = require("passport");

const authenticateWithGitHub = (req, res, next) => {
  passport.authenticate("github", {
    scope: ["user:email", "repo:read"],
  })(req, res, next);
  return
};

const authenticationCallback = (req, res, next) => {
  passport.authenticate("github", {
    failureRedirect: "/failure",
    successRedirect: "/projects",
    session: true,
  })(req, res, next);

  console.log("Github called us back!");
  return;
};

const logOut = (req, res) => {
  req.logOut();
  return res.redirect("/");
};

const authFail = (req, res) => res.send("Failed to log in!");

module.exports = {
  logOut,
  authFail,
  authenticateWithGitHub,
  authenticationCallback,
};
