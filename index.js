const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const favicon = require('serve-favicon');
const path = require('path');
require('dotenv').config();
const methodOverride = require('method-override'); //Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn’t support it.
const app = express();
const checkAuthenticated = require('./checkAuthenticated');

const fs = require('fs'); // delete me!

let PORT = 3000 || process.env.PORT;
const login = require('./login');
const signup = require('./signup');
const addWords = require('./add-words');
const editWords = require('./edit-words');
const getWords = require('./get-words');
const about = require('./about');
const settings = require('./settings');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(favicon(path.join(__dirname, 'public', 'assets', 'favicon.ico')));
app.use(express.json({ limit: '1mb' })); // FIX LIMIT!
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({ secret: process.env.SESSION_SECRET, saveUninitialized: false, resave: false, failureFlash: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use('/login', login);
app.use('/signup', signup);
app.use('/add-words', addWords);
app.use('/edit-sets', editWords);
app.use('/get-words', getWords);
app.use('/about', about);
app.use('/settings', settings);

app.get('/', checkAuthenticated, (req, res) => {
  console.log(req.user);
  console.log(req.session.passport);
  let userInfo = req.user;
  delete userInfo.password;
  const getGreeting = () => {
    let date = new Date();
    let time = date.getHours();
    if (time >= 4 && time < 7) {
      return `朝早いですね、${userInfo.username}さん!☀️`;
    } else if (time >= 7 && time <= 10) {
      return `おはようございます、${userInfo.username}さん!☀️`;
    } else if (time > 10 && time <= 17) {
      return `こんにちは、${userInfo.username}さん!💪`;
    } else if (time > 17) {
      return `こんばんは、${userInfo.username}さん!🌙✨`;
    } else {
      return `もう寝なさい、${userInfo.username}さん!🌙✨💤`;
    }
  };
  greeting = getGreeting();
  console.log(greeting);
  res.render('index', { userInfo: userInfo, greeting: greeting });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.post('/send-jason', (req, res) => {
  const data = req.body;
  const jason = JSON.stringify(data);
  console.log(req.body);
  fs.writeFile('jason.txt', jason, function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.send({ message: 'received' });
});
app.listen(PORT);
