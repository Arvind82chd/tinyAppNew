const express = require('express');
const bodyParser = require('body-parser'); 
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { generateRandomString, findUserByEmail, authenticateUser, ensureAuthenticated, checkPermission, urlsForUser } = require('./helpers');
const app = express();
const PORT = 5000;

app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


// Databases:

//User Fake Database:
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1"
  }
};


//URL Fake Database:
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
};



// ALL GETs:

//Route handler for home page
app.get("/", ensureAuthenticated, (req, res) => {
 
  res.redirect('/urls' );
});


//Route handler for urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); 
});


//Test database page endpoint
app.get("/users.json", (req, res) => {
  res.json(users);
});


//hello page endpoint
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); 
});


//urls endpoint
app.get('/urls', ensureAuthenticated, (req, res) => {
  const userId = req.session.user_id;
  const result = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: result, user: users[userId] };
  return res.render('urls_index', templateVars); 
});


//Route for rendering urls_new.ejs
app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const templateVars = { urls: urlDatabase, userId: userId, user: users[userId] };
    return res.render('urls_new', templateVars);
  }  else {
    res.redirect('/login');
  }
});


// Get route for shortURL
app.get('/urls/:shortURL', ensureAuthenticated, (req, res) => { 
 
  const shortURL = req.params.shortURL; 
  const userId = req.session.user_id;
  const results = checkPermission(urlDatabase, userId, shortURL);
  if (!results.error) {

    const longUrl = urlDatabase[shortURL]['longURL'];
    const templateVars = { shortURL, url: longUrl, user: users[userId] }; 
    res.render('urls_show', templateVars);
  } else res.send(permission.error)
});


//Get endpoint to go to longURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
  const longURL = urlDatabase[shortURL]['longURL'];
    res.redirect(longURL);
  } else res.send(`ShortURL does not exist.`)
});


//Get register endpoint:
app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { urls: urlDatabase, userId: userId, user: users[userId] };
  res.render('register', templateVars);
});


//Get login endpoint
app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('login', templateVars);
});



//ALL POST:

//Post for urls: 
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longUrl = req.body.longURL;
  const userId = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL: longUrl,
    userId: userId
  }; 
  if (ensureAuthenticated) { //checks if non login user accesses /urls from command line
    res.redirect(`/urls`);
    return;
  }     return res.send(`Kindly login to access this page <a href='/login'>here</a>.`);
  
});


//Post for deleting URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const result = checkPermission(urlDatabase, userId, shortURL );
  if (result.error) {
    return res.send(result.error);
  }
  delete urlDatabase[shortURL]; 
  res.redirect('/urls');
});


//Post endpoint for urls/new: does the main function of the whole app generating and assigning shortURL.
app.post('/urls/new', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.newURL;
  const userId = req.session.user_id;
  const newURLData = {
    longURL: longURL,
    userID: userId
  };
  if (longURL !== "") {
    urlDatabase[shortURL] = newURLData;
  }
  res.redirect(`/urls/${shortURL}`);
});


//Post for shortURL
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const result = checkPermission(urlDatabase, userId, shortURL);//keeps check on non userid person changing data for other users.
  const longURL = req.body.editedURL;
  const editedURL = {
    longURL: longURL,
    userID: userId,
  }
  if (result.error) {
    return res.send(result.error);
  } else if (longURL !== "") {
    urlDatabase[shortURL] = editedURL;
  }
  res.redirect(`/urls`);
});


//post login handler
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(users, email);
  if (!user) {
    return res.status(403).send(`403 status code!!! User not found kindly register.`);
    
  } else if (!authenticateUser(email, password, users)) {
    return res.status(403).send(`403 status code!!! user id or password incorrect.`);
  }
  req.session.user_id = user.id;
  return res.redirect('/urls');
});


//logout endpoint
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


//post registration handler
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: userId,
    email: email,
    password: hashedPassword,
  };
  if (email === "" || hashedPassword === "") {
    return res.status(400).send("400 status code, Invalid userId or password");
  } else if (!findUserByEmail(users, email)) {
    users[userId] = newUser;
    req.session.user_id = userId;
    return res.redirect('/urls');
  }
  return res.status(400).send(`400 status code!!! User exists kindly login`);
  
});


//Port listening:
app.listen(PORT, () => {
  console.log(`Example app listen on port ${PORT}!`);
});

