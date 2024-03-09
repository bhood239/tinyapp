const {urlDatabase, users} = require("./data/databases");

//helper functions
const generateRandomString = function() {
  const randomString = Math.random().toString(36).slice(2, 8);
  return randomString;
};

const urlsForUser = function(id) {
  const userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

const findUser = function(userEmail, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === userEmail) {
      return user;
    }
  }
  return null; // Return null if user is not found
};

module.exports = { findUser, generateRandomString, urlsForUser };