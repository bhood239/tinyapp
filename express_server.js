const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const { findUser } = require("./helpers");

const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {};

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


app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.status(302).redirect("/login");
  } else {
    res.redirect("/urls");
  }
});


app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('Error 403: Login required!');
  }

  const userId = req.session.user_id;
  const user = users[userId];
  console.log(user);
  const userUrls = urlsForUser(userId)
  console.log(userUrls)
  const templateVars = { urls: userUrls, user };

  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('Error 403: Login required!');
  }

  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.status(302).redirect("/login");
  }

  const userId = req.session.user_id;
  const user = users[userId];

  const templateVars = { user };

  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Error 404: URL does not exist!');
  }

  if (urlDatabase[req.params.id].userID !== userId) {
    return res.status(403).send('Error 403: Unauthorized access!');
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };

  res.render("urls_show", templateVars);
});


//Add URL
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('Error 403: Please login to add URLs!');
  }

  console.log(req.body); // Log the POST request body to the console

  const longURLObject = req.body;
  const id = generateRandomString();
  const userID = req.session.user_id;

  console.log(`Short URL string connected to ${longURLObject.longURL}: ${id}`);

  urlDatabase[id] = { longURL: longURLObject.longURL, userID };

  res.redirect(`/urls/${id}`);
});



app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (!userEmail || !userPassword) {
    return res.status(400).send('Error 400: No email/password entered!' );
  }
  if (findUser(userEmail, users)) {
    return res.status(400).send('Error 400: Email already exists!' );
  }

  const newId = generateRandomString();
  const newUser = {
    id: newId,
    email: userEmail,
    password: hashedPassword
  };

  users[newId] = newUser;

  req.session.user_id = newId;

  console.log(`Added new User: ${JSON.stringify(newUser)}`);
  res.redirect("/urls");
});



//Update URL
app.post('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('Error 403: Login required!');
  }

  const { id } = req.params;
  const { longURL } = req.body;
  
  if (urlDatabase[id].userID === req.session.user_id) {
    urlDatabase[id].longURL = longURL;
    console.log(`Updated url connected to ${id} to ${longURL}`);
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});


//Delete URL
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;

  if (!req.session.user_id) {
    return res.status(403).send('Error 403: Login required!');
  }
  if (urlDatabase[id].userID === req.session.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls`);
  } else {
    res.sendStatus(403);
  }
});


app.post("/login", (req, res) => {

  const userEmail = req.body.email;
  const userPassword = req.body.password;

  const user = findUser(userEmail, users);
  if(!user) {
    return res.status(403).send('Error 403: User not found!' );
  }
  if (user.email === userEmail && bcrypt.compareSync(userPassword, user.password)) {
    req.session.user_id = user.id;
    return res.redirect('/urls');
  } else {
    return res.status(403).send('Error 403: Invalid login!' );
  }
});


//logout and delete cookies
app.post("/logout", (req, res) => {
  req.session = null;
  console.log("deleted cookies");
  res.redirect('/login');
});



app.get("/u/:id", (req, res) => {
 
  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    return res.status(400)
  }
  res.redirect(longURL);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = { user };

  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = { user };

  res.render("login", templateVars);
});

