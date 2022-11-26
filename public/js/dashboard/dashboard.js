function goToLogout() {
    window.location.href = "/users/logout";
}


async function cards () {
    // DOM
    const swiper = document.querySelector('#swiper');
    // const urls = [
//     {url: 'https://source.unsplash.com/random/1000x1000/?sky', name: 'Emily'},
//     {url: 'https://source.unsplash.com/random/1000x1000/?landscape', name: 'Sydney'},
//     {url: 'https://source.unsplash.com/random/1000x1000/?ocean', name: 'Alexa'},
//     {url: 'https://source.unsplash.com/random/1000x1000/?moutain', name: 'Anjali'},
//     {url: 'https://source.unsplash.com/random/1000x1000/?forest', name: 'Brooke'}
// ];

    let user = await axios.get('/users/user');
    user = user.data;


    let compatibleUsers = await axios.get(`/users/compatibleUsers`);
    compatibleUsers = compatibleUsers.data;
    console.log(compatibleUsers);


    // variables
    let cardCount = 0;

// functions
    function appendNewCard() {
        let card;
        if (compatibleUsers.length > 0) {
            card = new Card({
                imageUrl: "https://source.unsplash.com/random/1000x1000/?sky",
                name: compatibleUsers[cardCount % compatibleUsers.length].firstName,
                onDismiss: appendNewCard,
                onLike: async () => {
                    // let a = document.createElement('a');
                    // let linkText = document.createTextNode(this.name);
                    // a.appendChild(linkText);
                    let updatedMatches = user.matches;
                    updatedMatches.push(compatibleUsers[cardCount % compatibleUsers.length]._id.toString());
                    // console.log(updatedMatches);
                    let newData = {matches: updatedMatches};
                    let li = document.createElement('li');
                    li.innerHTML = compatibleUsers[cardCount % compatibleUsers.length].firstName;
                    matchesList.appendChild(li);
                    await axios.patch(`/users/onboarding`, newData);
                }
            });
        }
        else {
            card = new Card({
                imageUrl: "https://thisinterestsme.com/wp-content/uploads/2017/02/tinder-no-one-new-around-yo.jpg",
                name: "Error",
                onDismiss: appendNewCard,
            });
        }

        swiper.append(card.element);
        cardCount++;

        const cards = swiper.querySelectorAll('.card:not(.dismissing)');
        cards.forEach((card, index) => {
            card.style.setProperty('--i', index);
        });
    }

    appendNewCard();

// first 5 cards
// for (let i = 0; i < 5; i++) {
//     appendNewCard();
// }
}
cards();






