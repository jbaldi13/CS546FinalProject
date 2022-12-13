const staticForm = document.getElementById('signupForm');
console.log(staticForm);

function checkEmail(email){
    console.log(email);
    if(!email) throw {errorMessage: "You must provide an email.", status: 400};
    email = String(email).toLowerCase();
    const res = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!res.test(email)){
        throw {errorMessage: "Error: you must enter a valid email address.", status: 400};
    }
    return email;
}

function checkForUpperCaseLetter(string){
    for (i = 0; i < string.length; i++){
        if (string.charAt(i) === string.charAt(i).toUpperCase() && string.charAt(i).match(/[a-zA-Z]/i)){
          return true;
        }
    }
    return false;
}

function checkForNumber(string){
    for (i = 0; i < string.length; i++){
        if (string.charAt(i).match(/[0-9]/i)){
          return true;
        }
    }
    return false;
}

function checkForSpecialChar(string){
    var regex = /[!.,?`~@#$%^&*()_|+\-=;:<>\{\}\[\]\\\/]/i;
    for (i = 0; i < string.length; i++){
        if (string.charAt(i).match(regex)){
          return true;
        }
    }
    return false;
}

function checkPassword(password){
    //check if password is provided
    if(!password){
        throw {errorMessage: "Error: you must provide a password.", status: 400};
    }
    
    //trim password and check length if length is at least 6
    if(password.trim().length < 6){
        throw {errorMessage: "Error: password must be at least 6 characters long.", status: 400};
    }

    //check if password has any spaces
    var checkpass = password.replace(/\s/g,"");
    if(checkpass !== password){
        throw {errorMessage: "Error: password cannot have any spaces.", status: 400};
    }

    //check if password has at least one uppercase character
    if(!checkForUpperCaseLetter(password)){
        throw {errorMessage: "Error: password must contain at least one uppercase letter.", status: 400};
    }

    //check if password has at least one number
    if(!checkForNumber(password)){
        throw {errorMessage: "Error: password must contain at least one number.", status: 400};
    }

    //check if password has at least one special character
    if(!checkForSpecialChar(password)){
        throw {errorMessage: "Error: password must contain at least one special character.", status: 400};
    }

    //return password as inputted
    return password;
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
            let confirmPassword = document.getElementById('confirmPassword');

            email = checkEmail(email.value);
            password = checkPassword(password.value);
            
            if(password != confirmPassword.value){
                throw {errorMessage: "Error: your passwords do not match", status: 400};
            }

            console.log(email);
            console.log(password);

            // hide error container
            errorContainer.classList.add('hidden');


            staticForm.submit();
        }
        catch (e) {
            const message = typeof e === 'string' ? e : e.errorMessage;
            errorTextElement.textContent = `${message}`;
            errorContainer.classList.remove('hidden');
        }
    });
}