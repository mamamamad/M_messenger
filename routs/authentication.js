const express = require('express')
const Router = express('roter')
const path = require("path")
const users = require("./../models/users.js")
const fs = require("fs")
const crypto = require("crypto");
const session = require('express-session');
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
const config = require("./../config.js");

Router.set('views', path.join(config.views_path,"views"));
Router.set("view engine" , "ejs")
Router.use(express.urlencoded({extended : false}))
Router.use(express.json());
Router.use(cors({ origin: config.domain, methods: ['GET', 'POST'], credentials: true }));

Router.use(session({
    secret: 'mysecretkey', // Used to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } 
}));

Router.get('/',(req,res)=>{ 
    res.render('authenthication.ejs')
})

Router.get('/users',(req,res)=>{ 
  if(!req.session.autotoken){
    console.log("faild")
    return res.status(403).redirect('/');
  }
  res.send(users)
})
Router.post("/", (req, res) => {

  const { username, password } = req.body; 
  
  const foundObject = findUser(username,password)
  
  if (foundObject) {
    req.session.autotoken = { id: 123, username: foundObject.username };
    localStorage.setItem("username", foundObject.username)
    res.redirect('/app1');

  } else {
    console.log("login Faild")
    res.redirect('/')   
  }
});
// Route for accessing the users list (requires login)
Router.get('/users', (req, res) => {
  if (!req.session.autotoken) {
    console.log("Failed");
    return res.status(403).redirect('/');
  }
  res.send(users);
});


function findUser(username,password) {
  
    return users.find(user => user.username === username && user.password === password);
}
module.exports = Router