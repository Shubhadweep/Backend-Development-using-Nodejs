require('dotenv').config();
const express = require('express');
const server = express();
const Path = require('path');
// cookie :
const cookieParser = require ('cookie-parser');

const systemModel = require('./Model/authModel');
const mongoose = require('mongoose');
const router = require('./Router/authRouter');
const Port = process.env.PORT || 5900;
//Flash
const flash = require('connect-flash');
//Session
const session = require('express-session');
const mongodb_Session = require('connect-mongodb-session')(session);

server.set('view engine','ejs');
server.set('views','View');
server.use(express.urlencoded({extended:true}));
server.use(express.static(Path.join(__dirname,'Public')));
//flash use: 
server.use(flash());
//Session Work
const session_Storage = new mongodb_Session({
    uri:process.env.DATABASE_URL,
    collection:'Auth_Session'
})
server.use(session({
    secret:'project-secret-key',
    resave:false,
    saveUninitialized:false,
    store:session_Storage
}))
server.use(async(req,res,next)=>{
    if(!req.session.user){
        return next();
    }else{
        let userValue = await systemModel.findById(req.session.user._id);
        if(userValue){
            req.user = userValue;
            next();
        }else{
            console.log("User not Found");
        }
    }
})

server.use(cookieParser());
server.use(router);
mongoose.connect(process.env.DATABASE_URL)
.then(()=>{
    console.log("The Database Connected Successfully");
    server.listen(Port,()=>{
        console.log(`The Server is Running at ${Port}`);
    })
}).catch(error=>{
    console.log("The Databse is not Connected Successfully",error);
})

