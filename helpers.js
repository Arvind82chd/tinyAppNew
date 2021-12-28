const bcrypt = require('bcryptjs');

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

//Generates random string for assigning userid and shorturls
function generateRandomString() { //picked this technique from a mentor last time
  const sampleString = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let shortString = '';
  for (let i = 0; i < 6; i++) {
    shortString += sampleString.charAt(Math.floor(Math.random() * 62));
  } return shortString;
}

//Finds user by email checks if user present already
const findUserByKey = function(users, email) {
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
  const user = findUserByKey(users, email);
  
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
    //return false;
    return res.send(`Kindly login to access this page <a href='/login'>here</a>.`);
    //res.redirect('/login');
  }
}




module.exports = { generateRandomString, findUserByKey, authenticateUser, ensureAuthenticated,  };