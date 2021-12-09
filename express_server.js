const express = require('express');
const bodyParser = require('body-parser'); //this converts the request body from buffer into a string
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 5000;

app.set("view engine", "ejs"); //ejs set as view engine
app.use(bodyParser.urlencoded({extended: true})); //will add data to the req obj under key: body hence input field data will be available in req.body.longURL which canbe stored
app.use(cookieParser());

// Database:
// let urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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
}

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

//Functions:

function generateRandomString() { //picked this technique from a mentor last time
  const sampleString = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let shortString = '';
  for (let i = 0; i < 6; i++) {
    shortString += sampleString.charAt(Math.floor(Math.random() * 62));
  } return shortString;
};

const findUserByKey = function (email) {
  for (let user in users) {
    const userId = users[user];
   // console.log(userId.email)
    if (userId.email === email) {
      return userId;
    }
  } return false;
};

//Check password function
const authenticateUser = function (email, password) {
  const user = findUserByKey(email);
  if (user && user.password === password) {
    return user;
  } return false;
};

//Check Permissions function:

function ensureAuthenticated(req, res, next) {
  const user = req.cookies["user_id"];
  if (user) {
    next();
  } else {
    res.redirect('/login')
  }
};

//Check if user permited to change:

function checkPermission(req) {
  const userId = req.cookies["user_id"];
  const shortUrl = req.params.shortURL;
  if (!urlDatabase[shortUrl]) {
    return { 
      data: null,
      error: 'URL does not exist.'
    };
  } else if (urlDatabase[shortUrl]['userID'] !== userId) {
    return {
      data: null, 
      error: "You do not have permission."
    };
  }
  return {
    data: shortUrl, 
    error: null,
  }
};

//Function to find urls out of database
const urlsForUser = function(id, obj) {
  const tempObj = {};
  for (let i in obj) {
    if (obj[i]["userID"] === id) {
      tempObj[i] = urlDatabase[i]["longURL"];
    }
  }
  return tempObj
}


// ALL GETs:

// route handler for home page
app.get("/", (req, res) => {
  res.send("hello!"); //sends hello on home path.
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //sends the urlDatabase to url.json path
});

app.get("/users.json", (req, res) => {
  res.json(users);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); //sends this html body to hello page
});

app.get('/urls', ensureAuthenticated, (req, res) => {
  const userId = req.cookies["user_id"];
  const result = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: result, user: users[userId] };//defines the database object as a variable templateVars.
  return res.render('urls_index', templateVars); //renders the urls_index page to /urls path
});

// route for rendering urls_new.ejs
app.get('/urls/new', ensureAuthenticated, (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {urls: urlDatabase, userId: userId, user: users[userId] };
  res.render('urls_new', templateVars);
});

// second route
app.get('/urls/:shortURL', ensureAuthenticated, (req, res) => { //:notation to represent the value of shorturl in browser path
  const shortURL = req.params.shortURL; //params for getting the value during get
  const userId = req.cookies["user_id"];
  const result = urlsForUser(userId, urlDatabase)
  const longURL = result[shortURL];
  const templateVars = { shortURL: shortURL, longURL: longURL, user: users[userId] }; //always use [] when using variable to fetch value in object.
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', ensureAuthenticated, (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL; //gets the longURL against the shortURL key from urlDatabase
  res.redirect(longURL);
});

//Get register endpoint:
app.get('/register', (req, res) => {
  //console.log(req.cookies["user_id"]);
  const userId = req.cookies["user_id"];// needs to be defined as we are using it to identify in users database.
  const templateVars = { urls: urlDatabase, userId: userId, user: users[userId] };
  res.render('register', templateVars);
});

//Get login endpoint
app.get('/login', (req, res) => {
  //const userId = req.cookies["user_id"];
  const templateVars = { user: null };//urls: urlDatabase, userId: userId, user: users[userId] };

  res.render('login', templateVars);
});

//POST:

//does the main function of the whole app generating and assigning shortURL.
app.post('/urls', (req, res) => {
  //console.log(req.body);
  const shortURL = generateRandomString();//generates a random string and asigns it to shortURL
  
  urlDatabase[shortURL] = {
    longURL: req.body.longURL, 
    userId: req.cookies["user_id"]
  }; //adds the value captured from ejs form for longURL and gives it the rangom string before saving
  
  //urlDatabase = { shortURL: shortURL, longURL: req.body.longURL }; //updates the urlDatabase
  if (ensureAuthenticated) {
    res.redirect(`/urls/${shortURL}`);
    return;
  }
  res.redirect('/login');
  
  //res.send('ok');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const result = checkPermission(req);
  if (result.error) {
    return res.send(result.error);
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; //deletes the shortURL data from database

  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;//use params when picking up values from only the path as parameters
  const result = checkPermission(req);
  if (result.error) {
    return res.send(result.error);
  }
    if (req.body.longURL !== "") {
      urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: req.cookies["user_id"],
      };
    }
  //const longURL = req.body.newURL;
  //const templateVars = { shortURL: shortURL, longURL: longURL}
  //urlDatabase[shortURL].longURL = req.body.newURL;// urldatabase updated with the new value of long url from form entry.
  // console.log(urlDatabase[shortURL]);
  // console.log(req.body.newURL);

  res.redirect(`/urls`)
});

//post for login
app.post('/login', (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByKey(email);
  console.log("I am here")
  if (!user) {
    return res.status(403).send(`403 status code!!! User not found kindly register.`);
  } else if (!authenticateUser(email, password)) {
    return res.status(403).send(`403 status code!!! user id or password incorrect.`);
  } 
  console.log("I am here too");
  
  res.cookie('user_id', user.id);
  return res.redirect('/urls')
   
});


//post to logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');

});

//post registration handler
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const newUser = { 
    id: userId, 
    email: email, 
    password: password,
  };
  if (email === "" || password === "") {
    return res.status(400).send("400 status code");
  } else if (!findUserByKey(email)) {
    users[userId] = newUser;
    //This one assigns the value to the cookie named user_id as random value as first registeration.
    res.cookie('user_id', userId);
    return res.redirect('/urls');
  }
    return res.status(400).send(`400 status code!!! User exists kindly login`);
  
});


//app.post('/')
app.listen(PORT, () => {
  console.log(`Example app listen on port ${PORT}!`);
}); 

