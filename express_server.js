const express = require('express');
const app = express();
const PORT = 5000;

app.set("view engine", "ejs"); //ejs set as view engine
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// route handler for home page
app.get("/", (req, res) => {
  res.send("hello!"); //sends hello on home path.
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase); //sends the urlDatabase to url.json path
// });

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); //sends this html body to hello page
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };//defines the database object as a variable templateVars.
  res.render('urls_index', templateVars); //renders the urls_index page to /urls path
})

// rout for rendering urls_new.ejs
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// second route
app.get('/urls/:shortURL', (req, res) => { //:notation to represent the value of shorturl in browser path
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase.shortURL }
  res.render('urls_show', templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listen on port ${PORT}!`);
}); 

