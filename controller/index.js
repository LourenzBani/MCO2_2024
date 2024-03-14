const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');

const collection_user = require('../model/user');
const collection_date = require('../model/date');

const server = express();

server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({ extname: 'hbs' }));
server.use(express.static('public'));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

// Database connection
const connect = mongoose.connect("mongodb://localhost:27017/MCO2");

connect.then(() => {
    console.log("Database connected successfully");
})
.catch(() => {
    console.log("Database cannot be connected");
});

function errorFn(err) {
    console.log('Error found. Please trace!');
    console.error(err);
}

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

function goToPreviousDay() {
    const currentDateObj = new Date(currentDate);
    const previousDate = new Date(currentDateObj.getTime() - 24 * 60 * 60 * 1000);
    updateCurrentDate(previousDate);
}

function goToNextDay() {
    const currentDateObj = new Date(currentDate);
    const nextDate = new Date(currentDateObj.getTime() + 24 * 60 * 60 * 1000);
    updateCurrentDate(nextDate);
}

function updateCurrentDate(newDate) {
    // Update the global currentDate variable
    currentDate = newDate.toISOString().split('T')[0];
    
    // Update the current date displayed on the main page
    document.getElementById('currentDate').innerText = 'Current Date: ' + newDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Redirect to the main page with the updated date
    window.location.href = '/main?date=' + currentDate;
}

server.post("/main", async (req, res) => {
    const action = req.body.action;

    if (action === "nextDay") {
        goToNextDay();
    } else if (action === "prevDay") {
        goToPreviousDay();
    } else if (action === "reserve") {
        
    } else {
        res.status(400).send("Invalid action");
    }
});

// Main page (student view)
server.get('/main', function(req, resp){
    const user = req.session.user;
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
    });
    const date = req.session.date;
    
    if (!user) {
        return resp.status(401).send("Unauthorized");
    }
    resp.render('mainpage',{
        layout: 'main',
        user: user,
        date: date,
        currentDate: currentDate
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

module.exports = server;
