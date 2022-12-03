const express = require('express');
const session = require('express-session');
const app = express();
const static = express.static(__dirname + '/public');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const mongoCollections = require('./config/mongoCollections');
// const http = require("http");
// const httpServer = http.createServer(app);
// let socketIo = require('socket.io');
// socketIo = socketIo.Server;
// const client = new socketIo(httpServer);
const http = require('http').Server(app);
const io = require('socket.io')(http);
const messages = mongoCollections.messages;

io.on('connection', (socket) => {
    console.log('yooo');
});


// Connect to Socket.io
io.on('connection', async function (socket) {
    console.log('yurr');

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
        console.log('yoo');
        let name = data.name;
        let message = data.message;

        // Check for name and message
        if (message === '') {
            // Send error status
            sendStatus('Please enter a name and message');
        } else {
            // Insert message
            messagesCollection.insert({name: name, message: message}, function () {
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
