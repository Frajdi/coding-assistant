const checkLoggedIn = (req, res, next) => {
  const loggedIn = req.isAuthenticated() && req.user;
  if (!loggedIn) {
    return res.status(401).json({
      error: "You must log in!",
    });
  }
  next();
};

module.exports = {
    checkLoggedIn
}