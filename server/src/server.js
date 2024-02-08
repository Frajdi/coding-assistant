const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const { Server } = require("socket.io");

const app = require("./app");
const initializeDatabse = require("./services/initializeDB");

const PORT = 3000;

const server = https.createServer(
  {
    cert: fs.readFileSync("cert.pem"),
    key: fs.readFileSync("key.pem"),
  },
  app
);

const io = new Server(server);

app.use(express.static(path.join(__dirname, "../../client/dist")));

// Handle all other routes by sending the 'index.html' file
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const startServer = async () => {
  await initializeDatabse();
  server.listen(PORT, () => {
    console.log(`Server listening in port : ${PORT}`);
  });
};

startServer();

module.exports.ioObject = io;
