let hamburgerMenu = document.querySelector('.hamburgerMenu');
hamburgerMenu.removeAttribute('hidden');
let popup = document.querySelector('.popup');
let close = document.querySelector('.close');
let confetti2 = document.querySelector('#my-canvas');
let popupH2 = document.querySelector('#popupH2');
let popupMatchImg1 = document.querySelector('#popupMatchImg1');
let popupMatchImg2 = document.querySelector('#popupMatchImg2');
let like = document.querySelector('#like');
let dislike = document.querySelector('#dislike');


function goToLogout() {
    window.location.href = "/users/logout";
}

close.onclick = function() {
    popup.classList.remove('active');
    confetti2.classList.remove('active');
    popupMatchImg1.style.animationName = 'slide-back-left';
    popupMatchImg1.style.animationDuration = '0';
    popupMatchImg2.style.animationName = 'slide-back-right';
    popupMatchImg2.style.animationDuration = '0';
};

let confettiSettings = { target: 'my-canvas' };
let confetti = new ConfettiGenerator(confettiSettings);
confetti.render();


async function cards () {
    const swiper = document.querySelector('#swiper');


    let user;
    try {
        user = await axios.get('/users/user');
        user = user.data;
    }
    catch (e) {
        console.log(e);
    }
    const matchedUserIds = user?.matches;
    const usersSeen = user?.usersSeen;
    let match;

    function addMatchToPage(match) {
        let matchMatches = match.matches;
        let newData;
        let index;
        let matchContainer = document.createElement('div');
        let a = document.createElement('a');
        let linkText = document.createTextNode(match.firstName);
        a.appendChild(linkText);
        a.href = "/match";
        a.addEventListener('click', getMatchPage);
        a.draggable = false;
        let matchId = document.createElement('p');
        matchId.innerHTML = match._id;
        matchId.hidden = true;
        const matchImg = document.createElement('img');
        matchImg.src = match.images.profilePic;
        matchImg.draggable = false;
        let unmatchButton = document.createElement('button');
        unmatchButton.innerHTML = 'Unmatch';
        unmatchButton.style.display = 'none';
        matchContainer.appendChild(matchId);
        matchContainer.appendChild(a);
        matchContainer.appendChild(matchImg);
        matchContainer.appendChild(unmatchButton);


        let startX;
        function onMouseMove(event) {
            // Check if the matchContainer has been moved to the left by at least 50 pixels
            if (event.pageX < startX - 50) {
                // If it has, reveal the unmatchButton
                unmatchButton.style.display = 'block';
            }
            else if (event.pageX > startX + 50) {
                unmatchButton.style.display = 'none';
            }
        }


        // Add event listener for mousedown event on the matchContainer
        matchContainer.addEventListener('mousedown', (event) => {
            // Store the starting position of the matchContainer
            startX = event.pageX;


            matchContainer.addEventListener('mousemove', onMouseMove);
        });

        document.addEventListener('mouseup', (event) => {
            matchContainer.removeEventListener('mousemove', onMouseMove);
        });

        unmatchButton.addEventListener('click', async (event) => {
            let result = confirm(`Are you sure you want to unmatch with ${match.firstName}?`);

            if (result === true) {
                let parentMatchContainer = unmatchButton.parentElement;
                matchesListUl.removeChild(parentMatchContainer);

                index = matchedUserIds.indexOf(match._id);
                if (index !== -1) {
                    matchedUserIds.splice(index, 1);
                }

                index = matchMatches.indexOf(user._id);
                console.log(matchMatches);
                if (index !== -1) {
                    matchMatches.splice(index, 1);
                }

                newData = {
                    userMatches: matchedUserIds,
                    currCompatUserId: match._id,
                    currCompatUserMatches: matchMatches,
                };

                console.log(matchedUserIds);
                console.log(match._id);
                console.log(matchMatches);

                try {
                    await axios.patch(`/users/onboarding`, newData);
                }
                catch (e) {
                    console.log(e.toString());
                }
            }
            else {
                unmatchButton.style.display = 'none';
            }
        });




        matchesListUl.appendChild(matchContainer);
    }

    if (matchedUserIds.length > 0) {
        let match;
        for (let i = 0; i < matchedUserIds.length; i++) {
            const matchId = matchedUserIds[i];
            let {data} = await axios.get(`/users/user/${matchId}`);
            match = data;
            addMatchToPage(match);
        }
    }

    async function getMatchPage(event) {
        event.preventDefault();
        try {
            const matchId = event.target.parentElement.firstChild.textContent;
            let {data} = await axios.get(`/users/user/${matchId}`);
            match = data;
            let reqBody = {
                matchInterests: match.interests,
                firstName: match.firstName
            };

            window.location.href = `/users/dashboard/${matchId}`;
        }
        catch (e) {
            console.log(e);
        }
    }

    let compatibleUsers;
    try {
        compatibleUsers = await axios.get(`/users/compatibleUsers`);
        compatibleUsers = compatibleUsers.data;
        // console.log(compatibleUsers);
    }
    catch (e) {
        console.log(e);
    }

    async function appendNewCard() {
        if (compatibleUsers.length > 0) {
            like.style.visibility = 'visible';
            dislike.style.visibility = 'visible';
            let card;
            const currCompatUser = compatibleUsers[0];
            let currCompatUserMatches = currCompatUser.matches;
            let currCompatUserId = currCompatUser._id;
            let newData;
            card = new Card({
                imageUrl: currCompatUser.images.profilePic,
                name: currCompatUser.firstName,
                onDismiss: appendNewCard,
                onLike: async () => {
                    like.style.animationPlayState = 'running';
                    like.classList.toggle('trigger');

                    compatibleUsers = compatibleUsers.slice(1);

                    usersSeen[currCompatUserId] = "liked";
                    if (Object.keys(currCompatUser.usersSeen).includes(user._id) &&
                    currCompatUser.usersSeen[user._id] === 'liked') {
                        popupH2.innerHTML = `You and ${currCompatUser.firstName} matched!`;
                        popupMatchImg2.src = currCompatUser.images.profilePic;
                        popupMatchImg1.style.animationName = 'slide-right';
                        popupMatchImg2.style.animationName = 'slide-left';
                        popup.classList.add('active');
                        confetti2.classList.add('active');
                        addMatchToPage(currCompatUser);
                        matchedUserIds.push(currCompatUserId);
                        currCompatUserMatches.push(user._id);
                        newData = {
                            userMatches: matchedUserIds,
                            currCompatUserId: currCompatUserId,
                            currCompatUserMatches: currCompatUserMatches,
                            usersSeen: usersSeen
                        };
                    }
                    else {
                        newData = {usersSeen: usersSeen};
                    }

                    await axios.patch(`/users/onboarding`, newData);
                },
                onDislike: async () => {
                    dislike.style.animationPlayState = 'running';
                    dislike.classList.toggle('trigger');

                    compatibleUsers = compatibleUsers.slice(1);

                    usersSeen[currCompatUserId] = "disliked";
                    newData = {usersSeen: usersSeen};
                    await axios.patch(`/users/onboarding`, newData);
                }
            });
            swiper.append(card.element);

            const cards = swiper.querySelectorAll('.card:not(.dismissing)');
            cards.forEach((card, index) => {
                card.style.setProperty('--i', index);
            });
        }
        else {
            like.style.visibility = 'hidden';
            dislike.style.visibility = 'hidden';
            const noUsers = document.createElement('div');
            noUsers.classList.add('card');
            const name = document.createElement('h3');
            name.innerHTML = "There's no one around you";
            noUsers.appendChild(name);
            swiper.append(noUsers);
        }
    }
    await appendNewCard();
}
cards();






