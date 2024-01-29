const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express")

const app = require('./app');
const initializeDatabse = require('./services/initializeDB');


const PORT = 3000;

app.use(express.static(path.join(__dirname, '../../client/dist')));

// Handle all other routes by sending the 'index.html' file
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});


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
