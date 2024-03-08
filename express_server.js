const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");

const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

const findUser = function(userEmail) {
  for (const userId in users) {
    const user = users[userId];
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


app.get("/", (req, res) => {
  res.redirect("/login");
});


app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send('Error 403: Login required!');
  }

  const userId = req.cookies.user_id;
  const user = users[userId];
  const userUrls = urlsForUser(userId)
  console.log(userUrls)
  const templateVars = { urls: userUrls, user };

  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send('Error 403: Login required!');
  }

  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    return res.redirect("/login");
  }

  const userId = req.cookies.user_id;
  const user = users[userId];

  const templateVars = { user };

  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  
  const userId = req.cookies.user_id;
  const user = users[userId];

  if (!urlDatabase[req.params.id] || urlDatabase[req.params.id].userID !== userId) {
    return res.status(403).send('Error 403: URL belongs to another user!');
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };

  res.render("urls_show", templateVars);
});



//Add URL
app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send('Error 403: Please login to add URLs!');
  }

  console.log(req.body); // Log the POST request body to the console

  const longURLObject = req.body;
  const id = generateRandomString();
  const userID = req.cookies.user_id;

  console.log(`Short URL string connected to ${longURLObject.longURL}: ${id}`);

  urlDatabase[id] = { longURL: longURLObject.longURL, userID };

  res.redirect(`/urls/${id}`);
});



app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    return res.status(400).send('Error 400: No email/password entered!' );
  }
  if (findUser(userEmail)) {
    return res.status(400).send('Error 400: Email already exists!' );
  }

  const newId = generateRandomString();
  const newUser = {
    id: newId,
    email: userEmail,
    password: bcrypt.hashSync(userPassword, 10)
  };

  users[newId] = newUser;

  res.cookie('user_id', newId);

  console.log(`Added new User: ${JSON.stringify(newUser)}`);
  res.redirect("/urls");
});



//Update URL
app.post('/urls/:id', (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send('Error 403: Login required!');
  }

  const { id } = req.params;
  const { longURL } = req.body;
  
  if (urlDatabase[id].userID === req.cookies.user_id) {
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

  if (!req.cookies.user_id) {
    return res.status(403).send('Error 403: Login required!');
  }
  if (urlDatabase[id].userID === req.cookies.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls`);
  } else {
    res.sendStatus(403);
  }
});


app.post("/login", (req, res) => {

  const userEmail = req.body.email;
  const userPassword = req.body.password;

  const user = findUser(userEmail);
  if(!user) {
    return res.status(403).send('Error 403: User not found!' );
  }
  if (user.email === userEmail && bcrypt.compareSync(userPassword, user.password) === true) {
    res.cookie('user_id', user.id);
    return res.redirect('/urls');
  } else {
    return res.status(403).send('Error 403: Invalid login!' );
  }
});


//logout and delete cookies
app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.cookies.user_id);
  console.log("deleted cookies");
  res.redirect('/login');
});



app.get("/u/:id", (req, res) => {
 
  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];

  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = { user };

  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];

  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = { user };

  res.render("login", templateVars);
});

