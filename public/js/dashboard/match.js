let hamburgerMenu = document.querySelector('.hamburgerMenu');
hamburgerMenu.removeAttribute('hidden');

async function match () {

    let user;
    try {
        user = await axios.get('/users/user');
        user = user.data;
    }
    catch (e) {
        console.log(e);
    }

    console.log(user.firstName);




    let element = function(id) {
        return document.getElementById(id);
    };

    // Get Elements
    let status = element('status');
    let messages = element('messages');
    let textarea = element('textarea');
    let username = element('username');
    let messageButton = element('messageButton');
    let profileCardInfo = document.querySelector('.profile-card-info');
    let chatContainer = document.querySelector('.chatContainer');
    let back = document.querySelector('.back');


    messageButton.addEventListener('click',  (event) => {
        profileCardInfo.replaceWith(chatContainer);
        chatContainer.removeAttribute('hidden');
    });

    back.addEventListener('click',  (event) => {
        chatContainer.replaceWith(profileCardInfo);
    });

    // Set default status
    let statusDefault = status.textContent;

    let setStatus = function (s) {
        // Set status
        status.textContent = s;

        if (s !== statusDefault) {
            let delay = setTimeout(function () {
                setStatus(statusDefault);
            }, 4000);
        }
    };

    // Connect to socket.io
    let socket = io({transports: ['websocket'], upgrade: false});

    // Check for connection
    if (socket !== undefined) {
        console.log('Connected to socket...');

        // Handle output
        socket.on('output', function (data) {
            if (data.length) {
                for (let x = 0; x < data.length; x++) {
                    // Build out message div
                    let message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].name + ": " + data[x].message;
                    messages.appendChild(message);
                }
            }
        });

        // Get Status From Server
        socket.on('status', function (data) {
            // get message status
            setStatus((typeof data === 'object')? data.message : data);
        });

        // Handle Input
        textarea.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && event.shiftKey === false) {
                // Emit to serve input
                console.log(textarea.value);
                socket.emit('input', {
                    name: user.firstName,
                    message: textarea.value
                });

                event.preventDefault();

                textarea.value = "";
            }
        });
    }
}
match();