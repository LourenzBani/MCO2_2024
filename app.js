const express = require('express');
const server = express();


const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
}));

server.use(express.static('public'));


// Login Page
server.get('/', function(req, resp){
    resp.render('login',{
        layout: 'index' 
    });
});

// Main page (student view)
server.get('/main', function(req, resp){
    resp.render('mainpage',{
        layout: 'main' 
    });
});

// tech page (admin view)
server.get('/admin', function(req, resp){
    resp.render('techpage',{
        layout: 'main' 
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


const port = process.env.PORT | 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
