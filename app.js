const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const server = express();


const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({extended:false}));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
}));




server.use(express.static('public'));

// Database connection
const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/MCO2");

connect.then(() =>{
    console.log("Database connected successfully")
})
.catch(() =>{
    console.log("Database cannot be connected")
});

function errorFn(err){
    console.log('Error fond. Please trace!');
    console.error(err);
}

//Schema for signup
const signupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    acctype: {
        type: String,
        required: true
    }
});

// collection model for users
const collection_user = mongoose.model("users", signupSchema);

// configure session 
const secretKey = crypto.randomBytes(64).toString('hex');
server.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));

server.use(bodyParser.urlencoded({ extended: true }));

server.post("/", async (req, res) => {
    const action = req.body.action;

    if (action === "signup") {
        // Handle signup
        const data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            acctype: req.body.acctype
        };

        const existUser = await collection_user.findOne({email: data.email});
        if(existUser){
            res.send("Email already exists. Please use a different email.");
        } 
        else {
            const userdata = await collection_user.insertMany(data);
            console.log(userdata);
            res.redirect('/');
        }

    } else if (action === "login") {
        const email = req.body.email;
    
        try {
            // Check if the user exists
            const user = await collection_user.findOne({ email: email });
            if (!user) {
                return res.status(404).send("User not found");
            }
        
            // Compare the provided password with the password stored in the database
            if (user.password !== req.body.password) {
                return res.status(401).send("Incorrect password");
            }

            // Store user information in the session
            req.session.user = user;
        
            // Authentication successful
            if(user.acctype === 'student'){
                res.redirect('/main');
            }
            else if (user.acctype === 'admin'){
                res.redirect('/admin');
            }
            
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal server error");
        }        
    } else {
        res.status(400).send("Invalid action");
    }
});

// Login Page
server.get('/', function(req, resp){
    resp.render('login',{
        layout: 'index' 
    });
});

// Main page (student view)
server.get('/main', function(req, resp){

    const user = req.session.user;
    if (!user) {
        return resp.status(401).send("Unauthorized");
    }
    resp.render('mainpage',{
        layout: 'main',
        user: user
    });
});

// tech page (admin view)
server.get('/admin', function(req, resp){

    const user = req.session.user;
    if (!user) {
        return resp.status(401).send("Unauthorized");
    }

    resp.render('techpage',{
        layout: 'main',
        user: user
    });
});

// profile page 
server.get('/profile', function(req, resp){
    resp.render('profilepage',{
        layout: 'profile' 
    });
});

// profile page 
server.get('/profile_edit', function(req, resp){
    resp.render('profile_edit',{
        layout: 'profile' 
    });
});

const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
