const express = require('express')
const Router = express('roter')
const path = require("path")
const config = require("./config.js");

 

Router.set('views', path.join(config.views_path,"views"));
Router.set("view engine" , "ejs")
Router.use(express.urlencoded({extended : false}))
Router.use(cors({ origin: config.domain, methods: ['GET', 'POST'], credentials: true }));

Router.get('/',(req,res)=>{
    if(!req.session.autotoken){
      console.log("faild")
      return res.status(403).redirect('/');
    }
    res.render("app1");

  });


module.exports = Router