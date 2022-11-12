const {checkFirstName} = require("../../helpers");



function formErrorCheck() {
    const staticForm = document.getElementById('onboardingForm');

    if (staticForm) {
        let firstName = document.getElementById('firstName').value;
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

                firstName = checkFirstName(firstName);
                let li = document.createElement('li');
                li.innerHTML = firstName;
                staticForm.appendChild(li);
            }
            catch (e) {
                const message = typeof e === 'string' ? e : e.message;
                errorTextElement.textContent = `Error: ${message}`;
                errorContainer.classList.remove('hidden');
                staticForm.reset();
            }
        });

    }
}

formErrorCheck();

