const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const Handler = require('handlebars')
const mongoose = require('mongoose');

const collection_user = require('../model/user');
const collection_date = require('../model/date');

const collection_reservation = require('../model/reservation');
const collection_reservation2 = require('../model/tworeservation');
const collection_reservation3 = require('../model/threereservation');
const collection_reservation4 = require('../model/fourreservation');
const collection_reservation5 = require('../model/fivereservation');

const collection_lab = require('../model/reservation');

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

Handler.registerHelper('add', function (num1, num2) {
    return num1 + num2;
});

Handler.registerHelper('subtract', function (num1, num2) {
    return num1 - num2;
});


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
            acctype: req.body.acctype,
            phone: req.body.phone
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




server.post("/main", async (req, res) => {
    const action = req.body.action;

    if (action === "nextPage") {


        res.redirect('/main2');
        
    } else if (action === "prevPage") {
        res.redirect('/main');
    } else if (action === "reserve") {
        const reservation_data = {
            labnum: req.body.labnum,
            seatnum: req.body.seatnum,

        } 
    } else {
        res.status(400).send("Invalid action");
    }
});

server.post("/main2", async (req, res) => {
    const action = req.body.action;

    if (action === "nextPage") {


        res.redirect('/main3');
        
    } else if (action === "prevPage") {
        res.redirect('/main');
        
    } else if (action === "reserve") {
        const reservation_data = {
            labnum: req.body.labnum,
            seatnum: req.body.seatnum,

        } 
    } else {
        res.status(400).send("Invalid action");
    }
});

server.post("/main3", async (req, res) => {
    const action = req.body.action;

    if (action === "nextPage") {


        res.redirect('/main4');
        
    } else if (action === "prevPage") {
        res.redirect('/main2');
    } else if (action === "reserve") {
        const reservation_data = {
            labnum: req.body.labnum,
            seatnum: req.body.seatnum,

        } 
    } else {
        res.status(400).send("Invalid action");
    }
});

server.post("/main4", async (req, res) => {
    const action = req.body.action;

    if (action === "nextPage") {


        res.redirect('/main5');
        
    } else if (action === "prevPage") {
        res.redirect('/main3');
        
    } else if (action === "reserve") {
        const reservation_data = {
            labnum: req.body.labnum,
            seatnum: req.body.seatnum,

        } 
    } else {
        res.status(400).send("Invalid action");
    }
});

server.post("/main5", async (req, res) => {
    const action = req.body.action;

    if (action === "nextPage") {


        res.redirect('/main5');
        
    } else if (action === "prevPage") {
        res.redirect('/main4');
        
    } else if (action === "reserve") {
        const reservation_data = {
            labnum: req.body.labnum,
            seatnum: req.body.seatnum,

        } 
    } else {
        res.status(400).send("Invalid action");
    }
});




// Main page (student view)
server.get('/main', async function(req, resp){
    const user = req.session.user;
    const searchQuery = {};
    const totalSeats = 27;
    
    try {
        // Fetch reservation counts
        const result = await collection_reservation.aggregate([
            { $match: { status: "reserved" } }, // Filter documents where status is "reserved"
            { $group: { _id: null, count: { $sum: 1 } } } // Count the filtered documents
        ]).exec();

        // Extract reserved count from the result
        const reservedCount = result.length > 0 ? result[0].count : 0;
        const vacantCount = result.length > 0 ? totalSeats - result[0].count : totalSeats;

        // Get current date
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
        });

        // Fetch reservations
        const post_reservations = await collection_reservation.find(searchQuery).lean();
        const labs = await collection_lab.find(searchQuery).lean();

        // Render the main page with counts and reservations
        resp.render('mainpage', {
            layout: 'main',
            user: user,
            reservation: post_reservations,
            currentDate: currentDate,
            labs: labs, // Pass the lab data to the template
            reservedCount: reservedCount,
            vacantCount: vacantCount
        });
    } catch (error) {
        console.error('Error rendering main page:', error);
        resp.status(500).send('Internal Server Error');
    }
});

// Main page2 (student view)
server.get('/main2', async function(req, resp){
    const user = req.session.user;
    const searchQuery = {};
    const totalSeats = 27;
    
    try {
        // Fetch reservation counts
        const result = await collection_reservation2.aggregate([
            { $match: { status: "reserved" } }, // Filter documents where status is "reserved"
            { $group: { _id: null, count: { $sum: 1 } } } // Count the filtered documents
        ]).exec();

        // Extract reserved count from the result
        const reservedCount = result.length > 0 ? result[0].count : 0;
        const vacantCount = result.length > 0 ? totalSeats - result[0].count : totalSeats;

        // Get current date
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
        });

        // Fetch reservations
        const post_reservations = await collection_reservation2.find(searchQuery).lean();
        const labs = await collection_lab.find(searchQuery).lean();

        // Render the main page with counts and reservations
        resp.render('mainpage2', {
            layout: 'main',
            user: user,
            reservation: post_reservations,
            currentDate: currentDate,
            labs: labs, // Pass the lab data to the template
            reservedCount: reservedCount,
            vacantCount: vacantCount
        });
    } catch (error) {
        console.error('Error rendering main page:', error);
        resp.status(500).send('Internal Server Error');
    }
});

// Main page3 (student view)
server.get('/main3', async function(req, resp){
    const user = req.session.user;
    const searchQuery = {};
    const totalSeats = 27;
    
    try {
        // Fetch reservation counts
        const result = await collection_reservation3.aggregate([
            { $match: { status: "reserved" } }, // Filter documents where status is "reserved"
            { $group: { _id: null, count: { $sum: 1 } } } // Count the filtered documents
        ]).exec();

        // Extract reserved count from the result
        const reservedCount = result.length > 0 ? result[0].count : 0;
        const vacantCount = result.length > 0 ? totalSeats - result[0].count : totalSeats;

        // Get current date
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
        });

        // Fetch reservations
        const post_reservations = await collection_reservation3.find(searchQuery).lean();
        const labs = await collection_lab.find(searchQuery).lean();

        // Render the main page with counts and reservations
        resp.render('mainpage3', {
            layout: 'main',
            user: user,
            reservation: post_reservations,
            currentDate: currentDate,
            labs: labs, // Pass the lab data to the template
            reservedCount: reservedCount,
            vacantCount: vacantCount
        });
    } catch (error) {
        console.error('Error rendering main page:', error);
        resp.status(500).send('Internal Server Error');
    }
});

// Main page4 (student view)
server.get('/main4', async function(req, resp){
    const user = req.session.user;
    const searchQuery = {};
    const totalSeats = 27;
    
    try {
        // Fetch reservation counts
        const result = await collection_reservation4.aggregate([
            { $match: { status: "reserved" } }, // Filter documents where status is "reserved"
            { $group: { _id: null, count: { $sum: 1 } } } // Count the filtered documents
        ]).exec();

        // Extract reserved count from the result
        const reservedCount = result.length > 0 ? result[0].count : 0;
        const vacantCount = result.length > 0 ? totalSeats - result[0].count : totalSeats;

        // Get current date
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
        });

        // Fetch reservations
        const post_reservations = await collection_reservation4.find(searchQuery).lean();
        const labs = await collection_lab.find(searchQuery).lean();

        // Render the main page with counts and reservations
        resp.render('mainpage4', {
            layout: 'main',
            user: user,
            reservation: post_reservations,
            currentDate: currentDate,
            labs: labs, // Pass the lab data to the template
            reservedCount: reservedCount,
            vacantCount: vacantCount
        });
    } catch (error) {
        console.error('Error rendering main page:', error);
        resp.status(500).send('Internal Server Error');
    }
});

// Main page5 (student view)
server.get('/main5', async function(req, resp){
    const user = req.session.user;
    const searchQuery = {};
    const totalSeats = 27;
    
    try {
        // Fetch reservation counts
        const result = await collection_reservation5.aggregate([
            { $match: { status: "reserved" } }, // Filter documents where status is "reserved"
            { $group: { _id: null, count: { $sum: 1 } } } // Count the filtered documents
        ]).exec();

        // Extract reserved count from the result
        const reservedCount = result.length > 0 ? result[0].count : 0;
        const vacantCount = result.length > 0 ? totalSeats - result[0].count : totalSeats;

        // Get current date
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
        });

        // Fetch reservations
        const post_reservations = await collection_reservation5.find(searchQuery).lean();
        const labs = await collection_lab.find(searchQuery).lean();

        // Render the main page with counts and reservations
        resp.render('mainpage5', {
            layout: 'main',
            user: user,
            reservation: post_reservations,
            currentDate: currentDate,
            labs: labs, // Pass the lab data to the template
            reservedCount: reservedCount,
            vacantCount: vacantCount
        });
    } catch (error) {
        console.error('Error rendering main page:', error);
        resp.status(500).send('Internal Server Error');
    }
});


// tech page (admin view)
server.get('/admin', async function(req, resp){
    const searchQuery = {};
    const user = req.session.user;
    const totalSeats = 27;

    try {
        // Fetch reservation counts
        const result = await collection_reservation.aggregate([
            { $match: { status: "reserved" } }, // Filter documents where status is "reserved"
            { $group: { _id: null, count: { $sum: 1 } } } // Count the filtered documents
        ]).exec();
        
        // Extract reserved count from the result
        const reservedCount = result.length > 0 ? result[0].count : 0;
        const vacantCount = result.length > 0 ? totalSeats - result[0].count : totalSeats;

        // Get current date
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
        });

    if (!user) {
        return resp.status(401).send("Unauthorized");
    }

    const post_reservations = await collection_reservation.find(searchQuery).lean();
    resp.render('techpage',{
        layout: 'main',
        user: user,
        reservation: post_reservations,
        currentDate: currentDate,
        reservedCount: reservedCount,
        vacantCount: vacantCount

    });

    } catch (error) {
        console.error('Error rendering main page:', error);
        resp.status(500).send('Internal Server Error');
    }
});

// profile page 
server.get('/profile', function(req, resp){
    const user = req.session.user;
    resp.render('profilepage',{
        layout: 'profile',
        user: user

    });
});

// profile edit page 
server.get('/profile_edit', function(req, resp){
    const user = req.session.user;
    resp.render('profile_edit',{
        layout: 'profile',
        user: user
    });
});



const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});

module.exports = server;
