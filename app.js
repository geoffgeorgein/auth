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




app.use(session({
    secret:"Our Secret",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

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
});

app.get('/secrets',(req,res)=>{

    if(req.isAuthenticated()){
        res.render('secrets.ejs');
    }
    else{
        res.redirect('/login');
    }
});

app.get('/logout',(req,res)=>{

    req.logout((err)=>{

        if(err){
            console.log(err);
        }
        else{
            res.redirect('/');
        }

    });
    
})

app.post('/register',(req,res)=>{

    const username=req.body.username;
    const pass=(req.body.password);

    User.register({username:username},pass,(err,user)=>{

        if(err){

            console.log(err);
            res.redirect('/register');
        }
        else{
            passport.authenticate("local")(req,res,()=>{

                res.redirect('/secrets');
            })
        }

    })


   
})

app.post('/login',(req,res)=>{

    const username=req.body.username;
    const pass=(req.body.password);

    const user=new User({
        username:username,
        password:pass
    });

    req.login(user,(err)=>{

        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,()=>{

                res.redirect('/secrets');
            });
        }
    })
})


app.listen(3000, function() {
    console.log("Server started on port ");
  })
  