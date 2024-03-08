
const generateRandomString = function() {
  const randomString = Math.random().toString(36).slice(2, 8);
  return randomString;
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

const urlsForUser = function(id) {
  const userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

module.exports = { generateRandomString, findUser, urlsForUser };