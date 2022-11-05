const express = require("express");
const app = express();
const configRoutes = require('./routes');
const static = express.static(__dirname + '/public');
const exphbs = require('express-handlebars');

app.use(express.json());
app.use('/public', static);
app.use(express.urlencoded({extended: true})); // allows you to get form data in routes

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});