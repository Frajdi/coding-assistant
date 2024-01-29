const helmet = require("helmet");
const express = require("express");
const api = require('./routes/api');
const cors = require("cors");


const app = express();

app.use(express.json());

app.use(
    cors({
      origin: "*",
    })
  );
  
app.use('/v1', api);
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"]
    }
  })
)
  
module.exports = app;
   