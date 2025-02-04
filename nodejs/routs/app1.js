const express = require('express')
const Router = express('roter')
const path = require("path")
const cookieParser = require("cookie-parser")
 

Router.set('views', path.join("/Users/mohamad/mamad/owasp/train/app1/first_messenger/nodejs","views"));
Router.set("view engine" , "ejs")
Router.use(express.urlencoded({extended : false}))


Router.get('/',(req,res)=>{
    if(!req.session.autotoken){
      console.log("faild")
      return res.status(403).redirect('/');
    }
    res.render("app1");

  });





module.exports = Router