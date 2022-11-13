const staticForm = document.getElementById('signupForm');
console.log(staticForm);



if (staticForm) {

    const errorContainer = document.getElementById('error-container');
    const errorTextElement = errorContainer.getElementsByClassName(
        'text-goes-here'
    )[0];

    staticForm.addEventListener('submit', (event) => {
        event.preventDefault();
        try {
            let email = document.getElementById('userEmail');
            let password = document.getElementById('userPassword').value;

            console.log(email)
            console.log(password)

            // hide error container
            errorContainer.classList.add('hidden');

            firstName = firstName.value;
            firstName = checkFirstName(firstName);

            staticForm.submit();
        }
        catch (e) {
            const message = typeof e === 'string' ? e : e.message;
            errorTextElement.textContent = `Error: ${message}`;
            errorContainer.classList.remove('hidden');

        }
    });
}