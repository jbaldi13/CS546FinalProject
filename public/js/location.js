const userId = document.getElementById("id").innerText;

async function getLocation() {
    const errorContainer = document.getElementById('error-container');
    const errorTextElement = errorContainer.getElementsByClassName(
        'text-goes-here'
    )[0];

    const success = async (position) => {
        console.log(position);
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const geoApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

        let locationData = await fetch(geoApiUrl);
        locationData = locationData.json();
        locationData = await locationData.then();

        let locality = locationData.locality;
        let principalSubdiv = locationData.principalSubdivision;
        const newData = {
            location: {latitude: latitude, longitude: longitude, locality: locality, principalSubdiv: principalSubdiv}
        };

        const res = await axios.patch(`/users/onboarding/${userId}`, newData);
        window.location.href = `/users/onboarding/filters/${userId}`;

    };

    const error = () => {
        errorTextElement.textContent = `Error: Unable to retrieve your location`;
        errorContainer.classList.remove('hidden');
    };

    navigator.geolocation.getCurrentPosition(success, error);

}

document.querySelector('#locationButton').addEventListener('click', getLocation);