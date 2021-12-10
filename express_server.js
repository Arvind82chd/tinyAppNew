const express = require('express');
const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { generateRandomString, findUserByKey, authenticateUser, ensureAuthenticated, checkPermission, urlsForUser } = require('./helpers');
const app = express();
const PORT = 5000;

app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


// Databases:

//User Database:
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


//URL Database:
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
app.get("/", (req, res) => {
  res.send("hello!"); 
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
app.get('/urls/new', ensureAuthenticated, (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {urls: urlDatabase, userId: userId, user: users[userId] };
  res.render('urls_new', templateVars);
});


// Get route for shortURL
app.get('/urls/:shortURL', ensureAuthenticated, (req, res) => { 
  const shortURL = req.params.shortURL; 
  const userId = req.session.user_id;
  const result = urlsForUser(userId, urlDatabase[shortURL]);
  const longUrl = urlDatabase[shortURL]["longURL"];
  const templateVars = { shortURL, url: longUrl, user: users[userId] }; 
  res.render('urls_show', templateVars);
});


//Get endpoint to go to longURL
app.get('/u/:shortURL', ensureAuthenticated, (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL; 
  res.redirect(longURL);
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

//Post for urls: does the main function of the whole app generating and assigning shortURL.
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.session.user_id
  }; 

  if (ensureAuthenticated) {
    res.redirect(`/urls/${shortURL}`);
    return;
  }
  res.redirect('/login');
});


//Post for deleting URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const result = checkPermission(req);
  if (result.error) {
    return res.send(result.error);
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; 
  res.redirect('/urls');
});


//Post for shortURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const result = checkPermission(req);
  console.log(checkPermission(req));
  const longURL = req.body.newURL;
  const userId = req.session.user_id;
  if (result.error) {
    return res.send(result.error);
     
  } else if (longURL !== "") {
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userId,
    };
  }

  res.redirect(`/urls`);
});


//post for login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //const hashedPassword = bcrypt.hashSync(password, 10);
  const user = findUserByKey(email);
  console.log(user.id);
  if (!user) {
    return res.status(403).send(`403 status code!!! User not found kindly register.`);
    
  } else if (!authenticateUser(email, password)) {
    return res.status(403).send(`403 status code!!! user id or password incorrect.`);
  }
  console.log("I am here too");
  
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
    return res.status(400).send("400 status code");
  } else if (!findUserByKey(email)) {
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

