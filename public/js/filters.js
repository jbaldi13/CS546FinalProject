let hamburgerMenu = document.querySelector('.hamburgerMenu');
let submitButton = document.querySelector('.homepage-buttons');
let h2 = document.querySelector('.neon');
let filtersH2 = document.querySelector('#filtersH2');
let user;

async function filters () {
    try {
        user = await axios.get('/users/user');
        user = user.data;
    }
    catch (e) {
        console.log(e);
    }


    if (user.filters.minAge !== null && user.images.profilePic !== null) {
        hamburgerMenu.removeAttribute('hidden');
        submitButton.innerHTML = "Save Changes";
        h2.innerHTML = "UPDATE FILTERS";
        filtersH2.remove();
    }


    let minAge = document.getElementById("minAge");
    let maxAge = document.getElementById("maxAge");
    let maxDistance = document.getElementById("maxDistance");
    let genderInterest = document.getElementById('genderInterest');

    let minAgeLabel = document.getElementById("minAgeLabel");
    let maxAgeLabel = document.getElementById("maxAgeLabel");
    let maxDistanceLabel = document.getElementById("maxDistanceLabel");

    minAgeLabel.innerHTML = minAge.value; // Display the default slider value
    maxAgeLabel.innerHTML = maxAge.value;
    maxDistanceLabel.innerHTML = `${maxDistance.value} miles`;

    // Pre-populate values of filters
    for (let option of genderInterest.options) {
        if (user.filters.genderInterest !== null) {
            if (user.filters.genderInterest === option.value) {
                option.selected = true;
            }
            minAge.value = user.filters.minAge;
            minAgeLabel.innerHTML = user.filters.minAge;
            maxAge.value = user.filters.maxAge;
            maxAgeLabel.innerHTML = user.filters.maxAge;
            maxDistance.value = user.filters.maxDistance;
            maxDistanceLabel.innerHTML = `${user.filters.maxDistance} miles`;
        }

    }

    // Update the current slider value (each time you drag the slider handle)
    minAge.oninput = function() {
        minAgeLabel.innerHTML = this.value;
    };

    maxAge.oninput = function() {
        maxAgeLabel.innerHTML = this.value;
    };

    maxDistance.oninput = function() {
        maxDistanceLabel.innerHTML = `${this.value} miles`;
    };

    function checkAgeRange(minAge, maxAge) {
        if (maxAge < minAge) throw 'The Max Age must be greater than or equal to the Min Age';
    }

    function checkGenderInterest(genderInterest) {
        if (genderInterest === "Select Gender") throw `You must select what gender you're interested in`;
    }

    const staticForm = document.getElementById('filtersForm');

    if (staticForm) {

        const errorContainer = document.getElementById('error-container');
        const errorTextElement = errorContainer.getElementsByClassName(
            'text-goes-here'
        )[0];


        staticForm.addEventListener('submit', async(event) => {
            event.preventDefault();

            // hide error container
            errorContainer.classList.add('hidden');

            const newData = {filters: {}};
            try {
                checkGenderInterest(genderInterest.value);
                newData.filters.genderInterest = genderInterest.value;

            } catch (e) {
                const message = typeof e === 'string' ? e : e.message;
                errorTextElement.textContent = `Error: ${message}`;
                errorContainer.classList.remove('hidden');
                return;
            }
            try {
                let minAgeValue = parseInt(minAge.value);
                let maxAgeValue = parseInt(maxAge.value);
                let maxDistanceValue = parseInt(maxDistance.value);
                checkAgeRange(minAge.value, maxAge.value);
                newData.filters.minAge = minAgeValue;
                newData.filters.maxAge = maxAgeValue;
                newData.filters.maxDistance = maxDistanceValue;

            } catch (e) {
                const message = typeof e === 'string' ? e : e.message;
                errorTextElement.textContent = `Error: ${message}`;
                errorContainer.classList.remove('hidden');
                maxAge.focus();
                minAge.value = minAge.defaultValue;
                minAgeLabel.innerHTML = minAge.value;
                maxAge.value = maxAge.defaultValue;
                maxAgeLabel.innerHTML = maxAge.value;
                return;
            }
            try {
                let res = await axios.patch(`/users/onboarding`, newData);
                if (submitButton.innerHTML === "Save Changes") {
                    window.location.href = '/users/dashboard';
                }
                else {
                    window.location.href = `/users/onboarding/images`;
                }

            }
            catch (e) {
                errorTextElement.textContent = `Error: No fields have been changed from their initial values, so no update has occurred`;
                errorContainer.classList.remove('hidden');
            }
        });

    }
}
filters();



