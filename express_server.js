const express = require('express');
const bodyParser = require('body-parser'); //this converts the request body from buffer into a string
const app = express();
const PORT = 5000;

app.set("view engine", "ejs"); //ejs set as view engine
app.use(bodyParser.urlencoded({extended: true})); //will add data to the req obj under key: body hence input field data will be available in req.body.longURL which canbe stored
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Functions:

function generateRandomString() {
  const sampleString = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let shortString = '';
  for (let i = 0; i < 6; i++) {
    shortString += sampleString.charAt(Math.floor(Math.random() * 62));
  } return shortString;
}

//GET:

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


//POST:
app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('ok');
})

app.listen(PORT, () => {
  console.log(`Example app listen on port ${PORT}!`);
}); 

