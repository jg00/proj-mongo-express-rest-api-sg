const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const app = express();

// For dev or prod environments
if (process.env.NODE_ENV !== "test") {
  mongoose.connect("mongodb://localhost/muber", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
}

// Middlewares
app.use(bodyParser.json());
routes(app);

app.use((err, req, res, next) => {
  res.status(422).send({ error: err.message });
});

module.exports = app;
