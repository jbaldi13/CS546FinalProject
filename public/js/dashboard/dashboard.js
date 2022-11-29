function goToLogout() {
    window.location.href = "/users/logout";
}


const swiper = document.querySelector('#swiper');
const instructions = document.querySelector('.swipeInstructionDiv');
async function cards () {

    let user = await axios.get('/users/user');
    user = user.data;
    let match;


    let compatibleUsers;
    try {
        compatibleUsers = await axios.get(`/users/compatibleUsers`);
        compatibleUsers = compatibleUsers.data;
        // console.log(compatibleUsers);
    }
    catch (e) {
        console.log(e);
    }


    // let cardCount = 0;

    const matchedUserIds = user?.matches;
    // console.log(matchedUserIds);

    async function appendNewCard() {
        let card;
        // console.log(compatibleUsers.length);
        if (compatibleUsers.length > 0) {
            card = new Card({
                imageUrl: compatibleUsers[0].images.profilePic,
                name: compatibleUsers[0].firstName,
                onDismiss: appendNewCard,
                onLike: async () => {
                    matchedUserIds.push(compatibleUsers[0]._id.toString());
                    let newData = {matches: matchedUserIds};
                    let matchContainer = document.createElement('div');
                    let a = document.createElement('a');
                    let linkText = document.createTextNode(compatibleUsers[0].firstName);
                    a.appendChild(linkText);
                    a.href = "/match";
                    a.addEventListener('click', async(event) => {
                        event.preventDefault();
                        try {
                            const matchId = a.parentElement.firstChild.textContent;
                            let {data} = await axios.get(`/users/compatibleUser/${matchId}`);
                            match = data;
                            let reqBody = {
                                matchInterests: match.interests,
                                firstName: match.firstName
                            };
                            // window.location.href = `/users/dashboard/match`;

                            let dateSpots = await axios.post(`/users/dashboard/match`, reqBody);
                            dateSpots = dateSpots.data;
                            console.log(`Date spots for you and ${match.firstName}:`);
                            for (let i = 0; i < dateSpots.length; i++) {
                                console.log(`Because you both like ${dateSpots[i].interestCategory}...`);
                                console.log(dateSpots[i].businesses.businesses);
                            }

                        }
                        catch (e) {
                            console.log(e);
                        }
                    });
                    let matchId = document.createElement('p');
                    matchId.innerHTML = compatibleUsers[0]._id;
                    matchId.hidden = true;
                    const matchImg = document.createElement('img');
                    matchImg.src = compatibleUsers[0].images.profilePic;
                    matchContainer.appendChild(matchId);
                    matchContainer.appendChild(a);
                    matchContainer.appendChild(matchImg);
                    matchesListUl.appendChild(matchContainer);

                    compatibleUsers = compatibleUsers?.filter(compatibleUser => {
                        // console.log(compatibleUser._id);
                        return !matchedUserIds.includes(compatibleUser._id);
                    });
                    // console.log(compatibleUsers);
                    // console.log(matchedUserIds);
                    await axios.patch(`/users/onboarding`, newData);
                },
                onDislike: async () => {
                    compatibleUsers = compatibleUsers.slice(1);
                }
            });
            swiper.append(card.element);
            // cardCount++;

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
            // card = new Card({
            //     imageUrl: "https://thisinterestsme.com/wp-content/uploads/2017/02/tinder-no-one-new-around-yo.jpg",
            //     name: "Error",
            //     onDismiss: appendNewCard,
            // });
        }

    }

    // first 5 cards
    // for (let i = 0; i < compatibleUsers.length; i++) {
    //     await appendNewCard();
    // }
    await appendNewCard();
}
cards();






