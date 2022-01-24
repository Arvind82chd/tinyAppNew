const bcrypt = require('bcryptjs');


//Function to check if userid matching urlId
function checkPermission(urlDatabase, userId, shortUrl) { //%added parameters
  
  if (!urlDatabase[shortUrl]) {
    return {
      data: null,
      error: 'URL does not exist.'
    }
  } 
    if (userId !== urlDatabase[shortUrl].userID) {
    return {
      data: null,
      error: "You do not have permission."
    }
  }
  return {
    data: shortUrl,
    error: null,
  }
};

//Generates random string for assigning userid and shorturls
function generateRandomString() { 
  const sampleString = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let shortString = '';
  for (let i = 0; i < 6; i++) {
    shortString += sampleString.charAt(Math.floor(Math.random() * 62));
  } return shortString;
}

//Finds user by email checks if user present already
const findUserByEmail = function(users, email) {
  for (let user in users) {
    const userId = users[user];
    // console.log(userId.email)
    if (userId['email'] === email) {
      return userId;
    }
  } return false;
};

//Check password function
const authenticateUser = function(email, password, users) {
  const user = findUserByEmail(users, email);
  
  if (user.id === "userRandomID" || user.id === "user2RandomID") {
    if (user.password === password) {
      return user;
    }
  }
  if (user && bcrypt.compareSync(password, user["password"])) {
    return user;
  } return false;
};


//Check Sessions cookie presence function:
function ensureAuthenticated(req, res, next) {
  const user = req.session.user_id;
  if (user) {
    next();
  } else {
    return res.send(`Kindly login to access this page <a href='/login'>here</a>.`);
  }
}

function ensureAuthenticatedRedirect(req, res, next) {
  const user = req.session.user_id;
  if (user) {
    next();
  } else {
    res.redirect('/login');
  }
}


//Function to find urls out of Object database using key
const urlsForUser = function(id, obj) { //% added urlDatabase
  const tempObj = {};
  for (let i in obj) {
    if (obj[i]["userID"] === id) {
      tempObj[i] = obj[i]["longURL"];
    }
  }
  return tempObj;
};



module.exports = { generateRandomString, findUserByEmail, authenticateUser, ensureAuthenticated, ensureAuthenticatedRedirect, checkPermission, urlsForUser };