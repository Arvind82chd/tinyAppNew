const express = require('express');
const bodyParser = require('body-parser'); //this converts the request body from buffer into a string
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 5000;

app.set("view engine", "ejs"); //ejs set as view engine
app.use(bodyParser.urlencoded({extended: true})); //will add data to the req obj under key: body hence input field data will be available in req.body.longURL which canbe stored
app.use(cookieParser());

// Database:
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



//Functions:

function generateRandomString() { //picked this technique from a mentor last time
  const sampleString = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let shortString = '';
  for (let i = 0; i < 6; i++) {
    shortString += sampleString.charAt(Math.floor(Math.random() * 62));
  } return shortString;
}

// ALL GETs:

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
  
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };//defines the database object as a variable templateVars.
  res.render('urls_index', templateVars); //renders the urls_index page to /urls path
})

// route for rendering urls_new.ejs
app.get('/urls/new', (req, res) => {
  
  res.render('urls_new', req.cookies["username"]);
});

// second route
app.get('/urls/:shortURL', (req, res) => { //:notation to represent the value of shorturl in browser path
  const shortURL = req.params.shortURL; //params for getting the value during get
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], username: req.cookies["username"] }; //always use [] when using variable to fetch value in object.
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]; //gets the longURL against the shortURL key from urlDatabase
  res.redirect(longURL);
});


//POST:

//does the main function of the whole app generating and assigning shortURL.
app.post('/urls', (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();//generates a random string and asigns it to shortURL
  
  urlDatabase[shortURL] = req.body.longURL; //adds the value captured from ejs form for longURL and gives it the rangom string before saving
  
  //urlDatabase = { shortURL: shortURL, longURL: req.body.longURL }; //updates the urlDatabase
  res.redirect(`/urls/${shortURL}`);
  //res.send('ok');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; //deletes the shortURL data from database

  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;//when picking up values from only the path as parameters
  console.log(shortURL);
  //const longURL = req.body.newURL;
  //const templateVars = { shortURL: shortURL, longURL: longURL}
  urlDatabase[shortURL] = req.body.newURL;// urldatabase updated with the new value of long url from form entry.
  // console.log(urlDatabase[shortURL]);
  // console.log(req.body.newURL);

  res.redirect(`/urls`)
});

//post for cookie
app.post('/login', (req, res) => {
  const value = req.body.username;
  res.cookie('username', value);
  res.redirect('/urls');
});


//post to logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  return res.redirect('/urls');
});

//app.post('/')
app.listen(PORT, () => {
  console.log(`Example app listen on port ${PORT}!`);
}); 

