//jshint esversion:6

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const md5 = require('md5');
const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.use(passport.initialize());
app.use(passport.session());

app.use(session({
    secret:"Our Secret",
    resave:false,
    saveUninitialized:false
}));

 mongoose.connect('mongodb://localhost:27017/Secretsdb');

 


 const userSchema=new mongoose.Schema({
    name:String,
    password:String
 });
 userSchema.plugin(passportLocalMongoose);

 userSchema.plugin(encrypt, { secret: process.env.SECRET ,encryptedFields: ['password']});

 const User=mongoose.model("User",userSchema);
 


 passport.use(User.createStrategy());

 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());


app.get('/',(req,res)=>{

    res.render("home.ejs");
})

app.get('/login',(req,res)=>{

    res.render("login.ejs");
})

app.get('/register',(req,res)=>{

    res.render("register.ejs");
})

app.post('/register',(req,res)=>{

    const username=req.body.username;
    const pass=(req.body.password);

    bcrypt.hash(pass, saltRounds, function(err, hash) {
        // Store hash in your password DB.

        const user1=new User({
            name:username,
            password:hash
        })
    
        user1.save((err)=>{
    
            if(!err){
                res.render('secrets.ejs');
            }
        })
    });

   
})

app.post('/login',(req,res)=>{

    const username=req.body.username;
    const pass=(req.body.password);

    User.findOne({name:username},(err,fuser)=>{

        if(err){
            console.log(err);
        }
        else{

            bcrypt.compare(pass, fuser.password, function(err, result) {
                // result == true
                if(result){

                    console.log("logged in successfully");
                    res.render("secrets.ejs");
                    
                }
                else{
                    console.log('Wrong password');
                }
            });

           
            
        }
    })
})


app.listen(3000, function() {
    console.log("Server started on port ");
  })
  