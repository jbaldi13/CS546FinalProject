const express = require('express');
const session = require('express-session');
const app = express();
const static = express.static(__dirname + '/public');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const mongoCollections = require('./config/mongoCollections');
const Multer = require("multer");
// const http = require("http");
// const httpServer = http.createServer(app);
// let socketIo = require('socket.io');
// socketIo = socketIo.Server;
// const client = new socketIo(httpServer);
const http = require('http').Server(app);
const io = require('socket.io')(http);
const messages = mongoCollections.messages;
const xss = require('xss');


// Connect to Socket.io
io.on('connection', async function (socket) {

    // Create function to send status
    let sendStatus = function (s) {
       socket.emit('status', s);
    };

    // Get chats from mongo collection
    const messagesCollection = await messages();
    messagesCollection.find().limit(100).sort({_id: 1}).toArray(function (err, res) {
        if (err) {
            throw err;
        }

        // Emit the messages
        socket.emit('output', res);
    });

    // Handle input events
    socket.on('input', function (data) {
        let name = xss(data.name);
        let message = xss(data.message);
        let fromUserId = data.fromUserId;
        let toUserId = data.toUserId;

        // Check for name and message
        if (message === '') {
            // Send error status
            sendStatus('No message was entered');
        } else {
            // Insert message
            messagesCollection.insertOne({name: name, fromUserId: fromUserId,
                toUserId: toUserId, message: message}, function () {
                io.emit('output', [data]);

                // Send status object
                sendStatus({
                    message: 'Message sent'
                });
            });
        }
    });
});


const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === 'number')
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

            return new Handlebars.SafeString(JSON.stringify(obj));
        },
        showOnProfile: function (value) {
            return value === 'on';
        },
        aboutExists: function (value) {
            return value !== '';
        },
        stringifyObject: function (value) {
            value = Object.keys(value);
            value = value.join(', ');
            return value;
        },
        radioChecked: function (variableName, value) {
            return variableName === value ? 'checked' : '';
        },
        checkboxChecked: function (value) {
            return value === 'on';
        },
        selectChecked: function (value, options) {

        }

    }
});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    // let the next middleware run:
    next();
};


app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);

app.use(session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: true
}));

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

configRoutes(app);

http.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000/');
});
