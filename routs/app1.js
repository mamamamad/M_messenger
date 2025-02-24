const express = require('express')
const Router = express('roter')
const path = require("path")
const config = require("./../config.js");
const cors = require("cors")
const mysql = require('mysql2');
const db_config = require("./../db_config.js");



 

Router.set('views', path.join(config.views_path,"views"));
Router.set("view engine" , "ejs")
Router.use(express.urlencoded({extended : false}))
Router.use(cors({ origin: config.domain, methods: ['GET', 'POST'], credentials: true }));

var con = mysql.createConnection({
  host: db_config.host,
  user: db_config.user,
  password: db_config.password,
  database : db_config.database
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

async function fetchData() {
  return new Promise((resolve, reject) => {
    const query = "SELECT username FROM users";  // Query to fetch user usernames
    con.query(query, (err, results) => {
      if (err) {
        console.log("Error fetching users: ", err);
        reject(err);  // Reject the Promise if there's an error
      } else {
        resolve(results);  // Resolve the Promise with the results
      }
    });
  });
}


Router.get('/', async (req, res) => {
  // Check if the session has the autotoken
  if (!req.session.autotoken) {
    console.log("Failed to authenticate");
    return res.status(403).redirect('/');
  }

  try {
    // Fetch the users data
    const users = await fetchData(); // Wait for the users to be fetched
    res.render("app1", { users }); // Pass the users to the EJS template
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users.");
  }
});


module.exports = Router