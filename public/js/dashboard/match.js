let hamburgerMenu = document.querySelector('.hamburgerMenu');
hamburgerMenu.removeAttribute('hidden');

async function match () {
    const swiper = new Swiper('.swiper', {
        // Optional parameters
        direction: 'vertical',
        loop: true,

        // If we need pagination
        pagination: {
            el: '.swiper-pagination',
        },

        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        // And if we need scrollbar
        scrollbar: {
            el: '.swiper-scrollbar',
        },
    });


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
    let arrows = document.getElementsByClassName('arrow');
    let businessDivDiv = document.getElementsByClassName('businessDivDiv');
    let matchId = element('matchId').textContent;

    for (let i = 0; i < arrows.length; i++) {
        arrows[i].addEventListener('click', function() {
            if (arrows[i].classList.contains('right')) {
                arrows[i].classList.remove('right');
                arrows[i].classList.add('down');
                businessDivDiv[i].style.display = 'block';
            }
            else {
                arrows[i].classList.remove('down');
                arrows[i].classList.add('right');
                businessDivDiv[i].style.display = 'none';
            }
        });
    }

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
                    if ((data[x].fromUserId === matchId && data[x].toUserId === user._id) ||
                        (data[x].fromUserId === user._id && data[x].toUserId === matchId)) {
                        let message = document.createElement('div');
                        message.setAttribute('class', 'chat-message');
                        message.textContent = data[x].name + ": " + data[x].message;
                        if (data[x].fromUserId === matchId && data[x].toUserId === user._id) {
                            message.style.textAlign = 'left';
                            message.style.marginLeft = '10px';
                            message.style.marginRight = '30%';
                        }
                        else  {
                            message.style.textAlign = 'right';
                            message.style.marginRight = '10px';
                            message.style.marginLeft = '30%';
                        }
                        message.style.marginTop = '5px';
                        message.style.overflowWrap = 'break-word';
                        messages.appendChild(message);
                    }
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
                    fromUserId: user._id,
                    toUserId: matchId,
                    message: textarea.value,
                });

                event.preventDefault();

                textarea.value = "";
            }
        });
    }
}
match();