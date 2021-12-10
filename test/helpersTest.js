const { assert } = require('chai');

const { findUserByKey } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByKey', function() {
  it('should return a user with valid email', function() {
    const user = findUserByKey("user@example.com", users);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
  });

  it('should return a user with valid email', function() {
    const user = findUserByKey("user2@example.com", users);
    const expectedUserID = "user2RandomID";
    // Write your assert statement here
  });

  
});