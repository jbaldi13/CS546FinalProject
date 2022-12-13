const errorContainer = document.getElementById('error-container');
const errorTextElement = errorContainer.getElementsByClassName(
    'text-goes-here'
)[0];

const loader = document.getElementById('loader');
loader.hidden = true;

window.addEventListener( "pageshow", function ( event ) {
    let historyTraversal = event.persisted ||
        ( typeof window.performance != "undefined" &&
            window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
        // Handle page restore.
        loader.hidden = true;
    }
});

async function getLocation() {
    loader.hidden = false;
    errorContainer.classList.add('hidden');

    const success = async (position) => {

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;


        const geoApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

        let locationData = await fetch(geoApiUrl);
        locationData = locationData.json();
        locationData = await locationData.then();
        console.log(locationData);

        let city = locationData.locality;
        let principalSubdiv = locationData.principalSubdivision;
        const newData = {
            location: {latitude: latitude, longitude: longitude, city: city, principalSubdiv: principalSubdiv}
        };

        try {
            const res = await axios.patch(`/users/onboarding`, newData);
            window.location.href = `/users/onboarding/filters`;
        }
        catch (e) {
            loader.hidden = true;
            errorTextElement.textContent = `Error: Could not get user location`;
            errorContainer.classList.remove('hidden');
        }

    };

    const error = () => {
        loader.hidden = true;
        errorTextElement.textContent = `Error: Unable to retrieve your location`;
        errorContainer.classList.remove('hidden');
    };

    navigator.geolocation.getCurrentPosition(success, error);
}
