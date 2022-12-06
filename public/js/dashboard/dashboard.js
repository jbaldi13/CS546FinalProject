let hamburgerMenu = document.querySelector('.hamburgerMenu');
hamburgerMenu.removeAttribute('hidden');
let popup = document.querySelector('.popup');
let close = document.querySelector('.close');
let confetti2 = document.querySelector('#my-canvas');
let popupH2 = document.querySelector('#popupH2');
let popupMatchImg1 = document.querySelector('#popupMatchImg1');
let popupMatchImg2 = document.querySelector('#popupMatchImg2');

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
    const instructions = document.querySelector('.swipeInstructionDiv');


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
        let matchContainer = document.createElement('div');
        let a = document.createElement('a');
        let linkText = document.createTextNode(match.firstName);
        a.appendChild(linkText);
        a.href = "/match";
        a.addEventListener('click', getMatchPage);
        let matchId = document.createElement('p');
        matchId.innerHTML = match._id;
        matchId.hidden = true;
        const matchImg = document.createElement('img');
        matchImg.src = match.images.profilePic;
        matchContainer.appendChild(matchId);
        matchContainer.appendChild(a);
        matchContainer.appendChild(matchImg);

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
            const noUsers = document.createElement('div');
            noUsers.classList.add('card');
            const name = document.createElement('h3');
            name.innerHTML = "There's no one around you";
            noUsers.appendChild(name);
            swiper.append(noUsers);
            instructions.remove();
        }
    }
    await appendNewCard();
}
cards();






