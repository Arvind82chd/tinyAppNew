const bcrypt = require('bcryptjs');

// const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//   "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
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
};


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
}

const findUserByKey = function(email) {
  for (let user in users) {
    const userId = users[user];
    // console.log(userId.email)
    if (userId.email === email) {
      return userId;
    }
  } return false;
};

//Check password function
const authenticateUser = function(email, password) {
  const user = findUserByKey(email);
  console.log(user[0], user[1]);
  if (user.id === "userRandomID" || user.id === "user2RandomID") {
    if (user.password === password) {
      return user;
    }
  }
  if (user && bcrypt.compareSync(password, user["password"])) {
    return user;
  } return false;
};

console.log(authenticateUser('user@example.com', '1234'));



//Check Permissions function:

function ensureAuthenticated(req, res, next) {
  const user = req.session.user_id;
  if (user) {
    next();
  } else {
    res.redirect('/login');
  }
}

//Check if user permited to change:

function checkPermission(req) {
  const userId = req.session.user_id;
  const shortUrl = req.params.shortURL;
  if (!urlDatabase[shortUrl]) {
    return {
      data: null,
      error: 'URL does not exist.'
    };
  } else if (urlDatabase[shortUrl]['userId'] !== userId) {
    console.log(urlDatabase[shortUrl], userId);
    return {
      data: null,
      error: "You do not have permission."
    };
  }
  return {
    data: shortUrl,
    error: null,
  };
}

//Function to find urls out of database
const urlsForUser = function(id, obj) {
  const tempObj = {};
  for (let i in obj) {
    if (obj[i]["userID"] === id) {
      tempObj[i] = urlDatabase[i]["longURL"];
    }
  }
  return tempObj;
};

module.exports = { generateRandomString, findUserByKey, authenticateUser, ensureAuthenticated, checkPermission, urlsForUser };