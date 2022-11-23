function goToLogout() {
    window.location.href = "/users/logout";
}

// DOM
const swiper = document.querySelector('#swiper');
const like = document.querySelector('#like');
const dislike = document.querySelector('#dislike');

// constants
const urls = [
    {url: 'https://source.unsplash.com/random/1000x1000/?sky', name: 'Emily'},
    {url: 'https://source.unsplash.com/random/1000x1000/?landscape', name: 'Sydney'},
    {url: 'https://source.unsplash.com/random/1000x1000/?ocean', name: 'Alexa'},
    {url: 'https://source.unsplash.com/random/1000x1000/?moutain', name: 'Anjali'},
    {url: 'https://source.unsplash.com/random/1000x1000/?forest', name: 'Brooke'}
];

// variables
let cardCount = 0;

// functions
function appendNewCard() {
    const card = new Card({
        imageUrl: urls[cardCount % 5].url,
        name: urls[cardCount % 5].name,
        onDismiss: appendNewCard,
        onLike: () => {
            like.style.animationPlayState = 'running';
            like.classList.toggle('trigger');
        },
        onDislike: () => {
            dislike.style.animationPlayState = 'running';
            dislike.classList.toggle('trigger');
        }
    });
    swiper.append(card.element);
    cardCount++;

    const cards = swiper.querySelectorAll('.card:not(.dismissing)');
    cards.forEach((card, index) => {
        card.style.setProperty('--i', index);
    });
}

// first 5 cards
// for (let i = 0; i < 5; i++) {
//     appendNewCard();
// }
appendNewCard();


