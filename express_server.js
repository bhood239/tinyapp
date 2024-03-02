const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

var cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const randomString = Math.random().toString(36).slice(2, 8);
  return randomString;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies.username };
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

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


