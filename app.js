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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

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
    password:String,
    googleId:String
 });
 userSchema.plugin(passportLocalMongoose);

 userSchema.plugin(encrypt, { secret: process.env.SECRET ,encryptedFields: ['password']});
 userSchema.plugin(findOrCreate);

 const User=mongoose.model("User",userSchema);
 


 passport.use(User.createStrategy());

//  passport.serializeUser(User.serializeUser());
//  passport.deserializeUser(User.deserializeUser());

 passport.serializeUser(function(user, done) {
    done(null, user);
  });
   
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

 passport.use(new GoogleStrategy({
    clientID: process.env.CLIENTID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


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

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

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
  