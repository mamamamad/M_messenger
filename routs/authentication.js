const express = require('express')
const Router = express('roter')
const path = require("path")
const session = require('express-session');
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
const config = require("./../config.js");
const db_config = require("./../db_config.js");
const mysql = require('mysql');
const cors = require("cors")

var con = mysql.createConnection({
  host: db_config.host,
  user: db_config.user,
  password: db_config.password
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});



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




Router.get('/singup',(req,res)=>{ 
  res.render('authenthication.ejs')
})

Router.get('/',(req,res)=>{ 
  res.render('authenthication.ejs')
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


function findUser(username, password) {
  const query = "SELECT username, password FROM users WHERE username = ?";
  console.log("hi",username)
  con.query(query, [username], (err, results) => {
    if (err) {
      return (err, null);
    }
    
    if (results.length === 0) {
      console.log("not exist user.")
      resolve(false);
    }
    
    const user = results[0]; 
    console.log(user);
    if (user.password === password) {
      console.log("find user.")
      resolve(true);
    } else {
      console.log("error in pass or user.")
      resolve(false);
    }
  });
}
module.exports = Router