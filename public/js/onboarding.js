function checkStringErrors(arg, argName) {
    if (typeof arg === 'undefined') throw `The ${argName} argument was not provided`;
    if (typeof arg !== "string") throw `The ${argName} argument is of the ${typeof arg} type; it should be of the string type`;
    if (arg === "") throw `The ${argName} argument is an empty string`;
    if (arg.trim() === '') throw `The ${argName} argument is a string that only contains spaces`;

    arg = arg.trim();
    return arg;
}

function checkFirstName(firstName){
    firstName = checkStringErrors(firstName, '\"First Name\"');

    for (let i = 0; i < firstName.length; i++) {
        if (!(/^[A-Za-z'-]/g.test(firstName[i]))) throw `The first name must only contain letters a-z or A-Z, an apostrophe, or a hyphen`;
    }

    return firstName;
}


const staticForm = document.getElementById('onboardingForm');
console.log(staticForm);



if (staticForm) {
    let firstName = document.getElementById('firstName');
    let birthday = document.getElementById('bDay').value;

    const errorContainer = document.getElementById('error-container');
    const errorTextElement = errorContainer.getElementsByClassName(
        'text-goes-here'
    )[0];

    staticForm.addEventListener('submit', (event) => {
        event.preventDefault();
        try {

            // hide error container
            errorContainer.classList.add('hidden');

            firstName = firstName.value;
            firstName = checkFirstName(firstName);

            staticForm.reset();
        }
        catch (e) {
            const message = typeof e === 'string' ? e : e.message;
            errorTextElement.textContent = `Error: ${message}`;
            errorContainer.classList.remove('hidden');
            staticForm.reset();
        }
    });
}




