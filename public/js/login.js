const staticForm = document.getElementById('loginForm');
console.log(staticForm);

function checkInputs(arg, argName) {
    if (typeof arg === 'undefined') throw {errorMessage: `\"${argName}\" was not provided`, status: 400};
    if (typeof arg !== "string") throw {errorMessage: `\"${argName}\" is of the ${typeof arg} type; it should be of the string type`, status: 400};
    if (arg === "") throw {errorMessage: `\"${argName}\" is an empty string`, status: 400};

    arg = arg.trim();
    return arg;
}

if (staticForm) {

    const errorContainer = document.getElementById('error-container');
    const errorTextElement = errorContainer.getElementsByClassName(
        'text-goes-here'
    )[0];

    staticForm.addEventListener('submit', (event) => {
        event.preventDefault();
        try {
            let email = document.getElementById('email');
            let password = document.getElementById('password');
            
            email = checkInputs(email.value, "Email");
            password = checkInputs(password.value, "Password");

            console.log(email);
            console.log(password);

            // hide error container
            errorContainer.classList.add('hidden');


            staticForm.submit();
        }
        catch (e) {
            const message = typeof e === 'string' ? e : e.errorMessage;
            errorTextElement.textContent = `Error: ${message}`;
            errorContainer.classList.remove('hidden');
        }
    });
}