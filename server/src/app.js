const helmet = require("helmet");
const express = require("express");
const api = require('./routes/api');
const cors = require("cors");


const app = express();

app.use(
    cors({
      origin: "*",
    })
  );
  
app.use('/v1', api);
app.use(helmet());
  
module.exports = app;
   