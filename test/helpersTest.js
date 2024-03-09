const { assert } = require('chai');

const { findUser } = require('../helpers.js');

const testUsers = {
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

describe('findUser', function() {
  it('should return a user with valid email', function() {
    const user = findUser("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return null if email is not in database', function() {
    const user = findUser("user3@example.com", testUsers);
    assert.strictEqual(user, null);
  });
});