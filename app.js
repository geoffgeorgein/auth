//jshint esversion:6

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");

var encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

 mongoose.connect('mongodb://localhost:27017/Secretsdb',{useNewUrlParser:true});







 const userSchema=new mongoose.Schema({
    name:String,
    password:String
 });

 userSchema.plugin(encrypt, { secret: process.env.SECRET ,encryptedFields: ['password']});

 const User=mongoose.model("User",userSchema);

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
    const pass=req.body.password;

    const user1=new User({
        name:username,
        password:pass
    })

    user1.save((err)=>{

        if(!err){
            res.render('secrets.ejs');
        }
    })
})

app.post('/login',(req,res)=>{

    const username=req.body.username;
    const pass=req.body.password;

    User.findOne({name:username},(err,fuser)=>{

        if(err){
            console.log(err);
        }
        else{

            if(pass==fuser.password){

                console.log("logged in successfully");
                res.render("secrets.ejs");
            }
            else{
                console.log('Wrong password');
            }
        }
    })
})


app.listen(3000, function() {
    console.log("Server started on port ");
  })
  