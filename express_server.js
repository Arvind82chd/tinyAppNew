const express = require('express');
const app = express();
const PORT = 5000;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listen on port ${PORT}!`);
});