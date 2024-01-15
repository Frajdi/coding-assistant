const express = require("express");
const passport = require("passport");

const authRouter = express.Router();


authRouter.get(
    "/github",
    passport.authenticate("github", {
      scope: ["user:email", "read:repo_hook"],
    })
);

authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: true,
  }),
  (req, res) => {
    console.log("Github called us back!");
  }
);

authRouter.get("/logout", (req, res) => {
  req.logOut();
  return res.redirect("/");
});

authRouter.get("/failure", (req, res) => {
  return res.send("Failed to log in!");
});

module.exports = authRouter;