const express = require('express');
const app = express();
const PORT = 5000;

app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("hello!"); //sends hello on home path.
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //sends the urlDatabase to url.json path
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listen on port ${PORT}!`);
}); 

