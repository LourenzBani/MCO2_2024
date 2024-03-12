const express = require('express');
const server = express();
const port = 3000;

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
}));

server.use(express.static('public'));



server.get('/', function(req, resp){
    resp.render('main',{
        layout: 'index' 
    });
});

server.listen(port, () => {
    console.log(`App is listening to port ${port}`)
});

