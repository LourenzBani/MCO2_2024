const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const Handler = require('handlebars')
const mongoose = require('mongoose');

const collection_user = require('../model/user');
const collection_date = require('../model/date');
const seatDisplays = require('../model/seatDisplay');
const collection_reservation = require('../model/reservation');

const collection_lab = require('../model/reservation');

const server = express();

server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({ extname: 'hbs' }));
server.use(express.static('public'));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));



const uri = "mongodb+srv://admin:12345@appdevmco3.dahyyoq.mongodb.net/?retryWrites=true&w=majority&appName=APPDEVMCO3";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    // You can start defining your Mongoose models and performing database operations here
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });


function errorFn(err) {
    console.log('Error found. Please trace!');
    console.error(err);
}

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

server.post('/main', async (req, res) => {
    try {
        const action = req.body.action;

        if (action === "nextPage") {
            // Redirect to the next page
            res.redirect('/main2');
        } else if (action === "prevPage") {
            // Redirect to the previous page
            res.redirect('/main');
        } else if (action === "reserve") {
            // Retrieve user details from the session
            const { _id, name } = req.session.user;

            // Generate reservation data
            const labnum = '1';
            const seatnum = req.body.seatnum;
            const currentDate = new Date();
            const currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const slotReservationTime = new Date(currentDate);
            slotReservationTime.setMinutes(currentDate.getMinutes() + 30); // Adding 30 minutes
            const timereserved = currentTime; // Use the current time
            const slotreserverd = req.body.slotreserverd;
            const datereserved = req.body.selectedDateInput;
            const order = '1';
            const status = 'reserved';
            const istaken = 1;

            // Create a new reservation document
            const newReservation = new collection_reservation({
                labnum,
                seatnum,
                timereserved,
                slotreserverd,
                datereserved,
                reservedby: name,
                reservedbyid: _id,
                order,
                status,
                istaken
            });

            // Save the reservation to the database
            await newReservation.save();

            // Redirect to the main page after successful reservation
            res.redirect('/main');
        } else {
            res.status(400).send("Invalid action");
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
});




server.post('/main2', async (req, res) => {
    try {
        const action = req.body.action;

        if (action === "nextPage") {
            // Redirect to the next page
            res.redirect('/main3');
        } else if (action === "prevPage") {
            // Redirect to the previous page
            res.redirect('/main');
        } else if (action === "reserve") {
            // Generate reservation data\
            const labnum = '2';
            const seatnum = req.body.seatnum;
            const currentDate = new Date();
            const currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const slotReservationTime = new Date(currentDate);
            slotReservationTime.setMinutes(currentDate.getMinutes() + 30); // Adding 30 minutes
            const timereserved = currentTime; // Use the current time
            const slotreserverd = req.body.slotreserverd;
            const datereserved = req.body.selectedDateInput;
            const reservedby = req.body.name;
            const order = '1';
            const status = 'reserved';
            const istaken = 1;
           
            // Create a new reservation document
            const newReservation = new collection_reservation({
                    labnum,
                    seatnum,
                    timereserved,
                    slotreserverd,
                    datereserved,
                    reservedby,
                    order,
                    status,
                    istaken
            });

            // Save the reservation to the database
            await newReservation.save();

            // Redirect to the main page after successful reservation
            res.redirect('/main2');
        } else {
            res.status(400).send("Invalid action");
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
});

server.post('/main3', async (req, res) => {
    try {
        const action = req.body.action;

        if (action === "nextPage") {
            // Redirect to the next page
            res.redirect('/main4');
        } else if (action === "prevPage") {
            // Redirect to the previous page
            res.redirect('/main2');
        } else if (action === "reserve") {
            // Generate reservation data\
            const labnum = '3';
            const seatnum = req.body.seatnum;
            const currentDate = new Date();
            const currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const slotReservationTime = new Date(currentDate);
            slotReservationTime.setMinutes(currentDate.getMinutes() + 30); // Adding 30 minutes
            const timereserved = currentTime; // Use the current time
            const slotreserverd = req.body.slotreserverd;
            const datereserved = req.body.selectedDateInput;
            const reservedby = req.body.name;
            const order = '1';
            const status = 'reserved';
            const istaken = 1;
           
            // Create a new reservation document
            const newReservation = new collection_reservation({
                    labnum,
                    seatnum,
                    timereserved,
                    slotreserverd,
                    datereserved,
                    reservedby,
                    order,
                    status,
                    istaken
            });

            // Save the reservation to the database
            await newReservation.save();

            // Redirect to the main page after successful reservation
            res.redirect('/main3');
        } else {
            res.status(400).send("Invalid action");
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
});

server.post('/main4', async (req, res) => {
    try {
        const action = req.body.action;

        if (action === "nextPage") {
            // Redirect to the next page
            res.redirect('/main5');
        } else if (action === "prevPage") {
            // Redirect to the previous page
            res.redirect('/main3');
        } else if (action === "reserve") {
            // Generate reservation data\
            const labnum = '4';
            const seatnum = req.body.seatnum;
            const currentDate = new Date();
            const currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const slotReservationTime = new Date(currentDate);
            slotReservationTime.setMinutes(currentDate.getMinutes() + 30); // Adding 30 minutes
            const timereserved = currentTime; // Use the current time
            const slotreserverd = req.body.slotreserverd;
            const datereserved = req.body.selectedDateInput;
            const reservedby = req.body.name;
            const order = '1';
            const status = 'reserved';
            const istaken = 1;
           
            // Create a new reservation document
            const newReservation = new collection_reservation({
                    labnum,
                    seatnum,
                    timereserved,
                    slotreserverd,
                    datereserved,
                    reservedby,
                    order,
                    status,
                    istaken
            });

            // Save the reservation to the database
            await newReservation.save();

            // Redirect to the main page after successful reservation
            res.redirect('/main4');
        } else {
            res.status(400).send("Invalid action");
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
});

server.post('/main5', async (req, res) => {
    try {
        const action = req.body.action;

        if (action === "nextPage") {
            // Redirect to the next page
            res.redirect('/main5');
        } else if (action === "prevPage") {
            // Redirect to the previous page
            res.redirect('/main4');
        } else if (action === "reserve") {
            // Generate reservation data\
            const labnum = '5';
            const seatnum = req.body.seatnum;
            const currentDate = new Date();
            const currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const slotReservationTime = new Date(currentDate);
            slotReservationTime.setMinutes(currentDate.getMinutes() + 30); // Adding 30 minutes
            const timereserved = currentTime; // Use the current time
            const slotreserverd = req.body.slotreserverd;
            const datereserved = req.body.selectedDateInput;
            const reservedby = req.body.name;
            const order = '1';
            const status = 'reserved';
            const istaken = 1;
           
            // Create a new reservation document
            const newReservation = new collection_reservation({
                    labnum,
                    seatnum,
                    timereserved,
                    slotreserverd,
                    datereserved,
                    reservedby,
                    order,
                    status,
                    istaken
            });

            // Save the reservation to the database
            await newReservation.save();

            // Redirect to the main page after successful reservation
            res.redirect('/main5');
        } else {
            res.status(400).send("Invalid action");
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
});

server.post('/updateSeatDisplays', async function(req, resp) {
    try {
        const selectedTime = req.body.slotreserverd;
        const selectedLab = req.body.labnum; // Retrieve selected lab number
        const selectedDate = req.body.selectedDate; // Retrieve selected date
        console.log(selectedTime);
        console.log(selectedLab);
        console.log(selectedDate); // Check if selected date is received

        // Fetch reservations for the selected date, time, and lab
        const reservations = await collection_reservation.find({ slotreserverd: selectedTime, labnum: selectedLab, datereserved: selectedDate }).lean();
        console.log('Retrieved reservations:', reservations);

        // Define an array to hold all seat numbers from 'A1' to 'I3'
        const allSeatNumbers = [];
        for (let letterCode = 65; letterCode <= 73; letterCode++) {
            const letter = String.fromCharCode(letterCode);
            for (let number = 1; number <= 3; number++) {
                allSeatNumbers.push(letter + number);
            }
        }

        console.log(allSeatNumbers);

        // Update seatDisplays based on reservations for the selected date, time, and lab
        await Promise.all(allSeatNumbers.map(async (seatnum) => {
            // Check if there's a reservation for this seat at the selected date, time, and lab
            const reservation = reservations.find(reservation => reservation.seatnum === seatnum);
            
            // Update seatDisplays based on the presence of reservation
            if (reservation) {
                // Seat is reserved
                await seatDisplays.updateOne(
                    { seatnum: seatnum },
                    { $set: {reservedby: reservation.reservedby,status: "reserved", istaken: 1 } }
                );
            } else {
                // Seat is vacant
                await seatDisplays.updateOne(
                    { seatnum: seatnum },
                    { $set: {reservedby:"vacant",status: "vacant", istaken: 0 } }
                );
            }
        }));

        // Fetch updated reservations for rendering
        const searchQuery = {};
        const post_reservations = await seatDisplays.find(searchQuery).lean();

        // Send JSON response with updated seat data
        resp.json(post_reservations);

    } catch (error) {
        console.error('Error updating seat displays:', error);
        resp.status(500).json({ error: 'Internal Server Error' });
    }
});




// Main page (student view)
server.get('/main', async function(req, resp){
    const user = req.session.user;
    const searchQuery = {};
    const totalSeats = 27;
    
    try {
        // Fetch reservation counts
        const result = await seatDisplays.aggregate([
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

        const timeSlots = [
            "09:00 - 09:30 AM",
            "09:30 - 10:00 AM",
            "10:00 - 10:30 AM",
            "10:30 - 11:00 AM",
            "11:00 - 11:30 AM",
            "11:30 - 12:00 PM",
            "12:00 - 12:30 PM",
            "12:30 - 01:00 PM",
            "01:00 - 01:30 PM",
            "01:30 - 02:00 PM"
        ];

        // Fetch reservations
        const post_reservations = await seatDisplays.find(searchQuery).lean();
        const labs = await collection_lab.find(searchQuery).lean();

        // Render the main page with counts and reservations
        resp.render('mainpage', {
            layout: 'main',
            user: user,
            reservation: post_reservations,
            currentDate: currentDate,
            labs: labs, // Pass the lab data to the template
            reservedCount: reservedCount,
            vacantCount: vacantCount,
            timeSlots: timeSlots
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
        const result = await seatDisplays.aggregate([
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

        const timeSlots = [
            "09:00 - 09:30 AM",
            "09:30 - 10:00 AM",
            "10:00 - 10:30 AM",
            "10:30 - 11:00 AM",
            "11:00 - 11:30 AM",
            "11:30 - 12:00 PM",
            "12:00 - 12:30 PM",
            "12:30 - 01:00 PM",
            "01:00 - 01:30 PM",
            "01:30 - 02:00 PM"
        ];

        // Fetch reservations
        const post_reservations = await seatDisplays.find(searchQuery).lean();
        const labs = await collection_lab.find(searchQuery).lean();

        // Render the main page with counts and reservations
        resp.render('mainpage2', {
            layout: 'main',
            user: user,
            reservation: post_reservations,
            currentDate: currentDate,
            labs: labs, // Pass the lab data to the template
            reservedCount: reservedCount,
            vacantCount: vacantCount,
            timeSlots: timeSlots
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
        const result = await seatDisplays.aggregate([
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

        const timeSlots = [
            "09:00 - 09:30 AM",
            "09:30 - 10:00 AM",
            "10:00 - 10:30 AM",
            "10:30 - 11:00 AM",
            "11:00 - 11:30 AM",
            "11:30 - 12:00 PM",
            "12:00 - 12:30 PM",
            "12:30 - 01:00 PM",
            "01:00 - 01:30 PM",
            "01:30 - 02:00 PM"
        ];

        // Fetch reservations
        const post_reservations = await seatDisplays.find(searchQuery).lean();
        const labs = await collection_lab.find(searchQuery).lean();

        // Render the main page with counts and reservations
        resp.render('mainpage3', {
            layout: 'main',
            user: user,
            reservation: post_reservations,
            currentDate: currentDate,
            labs: labs, // Pass the lab data to the template
            reservedCount: reservedCount,
            vacantCount: vacantCount,
            timeSlots: timeSlots
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
        const result = await seatDisplays.aggregate([
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

        const timeSlots = [
            "09:00 - 09:30 AM",
            "09:30 - 10:00 AM",
            "10:00 - 10:30 AM",
            "10:30 - 11:00 AM",
            "11:00 - 11:30 AM",
            "11:30 - 12:00 PM",
            "12:00 - 12:30 PM",
            "12:30 - 01:00 PM",
            "01:00 - 01:30 PM",
            "01:30 - 02:00 PM"
        ];

        // Fetch reservations
        const post_reservations = await seatDisplays.find(searchQuery).lean();
        const labs = await collection_lab.find(searchQuery).lean();

        // Render the main page with counts and reservations
        resp.render('mainpage4', {
            layout: 'main',
            user: user,
            reservation: post_reservations,
            currentDate: currentDate,
            labs: labs, // Pass the lab data to the template
            reservedCount: reservedCount,
            vacantCount: vacantCount,
            timeSlots: timeSlots
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
        const result = await seatDisplays.aggregate([
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

        const timeSlots = [
            "09:00 - 09:30 AM",
            "09:30 - 10:00 AM",
            "10:00 - 10:30 AM",
            "10:30 - 11:00 AM",
            "11:00 - 11:30 AM",
            "11:30 - 12:00 PM",
            "12:00 - 12:30 PM",
            "12:30 - 01:00 PM",
            "01:00 - 01:30 PM",
            "01:30 - 02:00 PM"
        ];

        // Fetch reservations
        const post_reservations = await seatDisplays.find(searchQuery).lean();
        const labs = await collection_lab.find(searchQuery).lean();

        // Render the main page with counts and reservations
        resp.render('mainpage5', {
            layout: 'main',
            user: user,
            reservation: post_reservations,
            currentDate: currentDate,
            labs: labs, // Pass the lab data to the template
            reservedCount: reservedCount,
            vacantCount: vacantCount,
            timeSlots: timeSlots
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

    try {
        

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

    });

    } catch (error) {
        console.error('Error rendering main page:', error);
        resp.status(500).send('Internal Server Error');
    }
});

server.delete('/reservation/:id', async (req, res) => {
    const reservationId = req.params.id;

    try {
        // Find the reservation by ID and delete it
        await collection_reservation.findByIdAndDelete(reservationId);
        res.status(204).send(); // Respond with 204 No Content on success
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// profile page 
server.get('/profile', async (req, res) => {
    try {
        // Retrieve the user's _id from the session
        const userId = req.session.user._id;

        // Find the reservations associated with the user's _id
        const userReservations = await collection_reservation.find({ reservedbyid: userId });

        // Extract only the necessary reservation data
        const formattedReservations = userReservations.map(reservation => ({
            labnum: reservation.labnum,
            seatnum: reservation.seatnum,
            timereserved: reservation.timereserved,
            slotreserverd: reservation.slotreserverd,
            datereserved: reservation.datereserved
        }));

        // Render the profile page with user data and formatted reservations
        res.render('profilepage', { 
            layout: 'profile', 
            user: req.session.user, 
            reservations: formattedReservations 
        });
    } catch (error) {
        console.error('Error retrieving user reservations:', error);
        res.status(500).send('Internal Server Error');
    }
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
