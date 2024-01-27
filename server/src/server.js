const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express")

const app = require('./app');
const initializeDatabse = require('./services/initializeDB');


const PORT = 3000;

// app.get("/", (req, res) => {
//   return res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
// });

app.use(express.static(path.join(__dirname, '../../client/dist')));


const startServer = async () => {
  await initializeDatabse();

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
