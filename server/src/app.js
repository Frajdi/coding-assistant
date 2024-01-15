const helmet = require("helmet");
const express = require("express");
const api = require('./routes/api');


const app = express();
  
app.use('/v1', api);
app.use(helmet());
  
module.exports = app;
  