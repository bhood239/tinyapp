const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

const generateRandomString = function() {
  const randomString = Math.random().toString(36).slice(2, 8);
  return randomString;
};

const findUser = function(userEmail) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === userEmail) {
      return user;
    }
  }
  return null; // Return null if user is not found
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user: user };

  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];

  const templateVars = { user: user };

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: user };

  res.render("urls_show", templateVars);
});

//Add URL
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  const longURLObject = req.body;
  const id = generateRandomString();

  console.log(`Short URL string connected to ${longURLObject.longURL}: ${id}`);

  urlDatabase[id] = longURLObject.longURL;

  res.redirect(`/urls/${id}`);
});

app.post("/register", (req, res) => {
  // Retrieve user inputs
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    return res.status(400).send({ message: 'Error 400: No email entered!' });
  }
  if (findUser(userEmail)) {
    return res.status(400).send({ message: 'Error 400: Email already exists!' });
  }
  const newId = generateRandomString();
  const newUser = {
    id: newId,
    email: userEmail,
    password: userPassword
  };

  users[newId] = newUser;

  res.cookie('user_id', newId);

  console.log(`Added new User: ${JSON.stringify(newUser)}`);
  res.redirect("/urls");
});

//Update URL
app.post('/urls/:id', (req, res) => {
  const { id } = req.params;
  const { longURL } = req.body;
  
  if (urlDatabase[id]) {
    urlDatabase[id] = longURL;
    console.log(`Updated url connected to ${id} to ${longURL}`);
    res.redirect('/urls');
  } else {
    res.sendStatus(404);
  }
});

//Delete URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];

  res.redirect(`/urls`);
});

//Create a cookie
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);

  res.redirect('/urls');
});

//logout and delete cookies
app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.cookies.user_id);
  console.log("deleted cookies");
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];

  const templateVars = { user: user };

  res.render("register", templateVars);
});


