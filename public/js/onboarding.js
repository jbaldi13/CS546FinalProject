function checkStringErrors(arg, argName) {
    if (typeof arg === 'undefined') throw `The ${argName} was not provided`;
    if (typeof arg !== "string") throw `The ${argName} is of the ${typeof arg} type; it should be of the string type`;
    if (arg === "") throw `The ${argName} is an empty string`;
    if (arg.trim() === '') throw `The ${argName} is a string that only contains spaces`;

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

function checkBirthday(bDay) {
    bDay = checkStringErrors(bDay, 'birthday');
    let daysInEachMonth = {
        '01': 31,
        '02': 28,
        '03': 31,
        '04': 30,
        '05': 31,
        '06': 30,
        '07': 31,
        '08': 31,
        '09': 30,
        '10': 31,
        '11': 30,
        '12': 31
    };
    let monthNames = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
    };
    if (bDay.length !== 10) throw "Birthday must be in the form: mm/dd/yyyy";

    let month = Number(bDay.slice(0, 2));
    let day = Number(bDay.slice(3, 5));
    let year = Number(bDay.slice(6));
    if (isNaN(month) || isNaN(day) || isNaN(year)) throw "The month, day, and year must be digits";
    if (bDay[2] !== '/' || bDay[5] !== '/') throw "Birthday must be in the form: mm/dd/yyyy";
    if (day > daysInEachMonth[month]) throw `Regarding the birthday input, there are not ${day} days in ${monthNames[month]}`;
    if (month < 1 || month > 12) throw `Regarding the birthday input, ${month} is not a valid month`;
    return bDay;
}

function getAge(bDay) {
    let today = new Date();
    let birthDate = new Date(bDay);
    let age = today.getFullYear() - birthDate.getFullYear();
    let month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 18) throw "You must be at least 18 years old to use this app";
    return age;
}

function checkInterests(interests) {
   if (interests.length > 10) throw "You must only select up to 10 interests";
}

const staticForm = document.getElementById('onboardingForm');


if (staticForm) {

    const errorContainer = document.getElementById('error-container');
    const errorTextElement = errorContainer.getElementsByClassName(
        'text-goes-here'
    )[0];

    let firstName = document.getElementById('firstName');
    let birthday = document.getElementById('birthday');
    let interests = document.getElementById('interests');

    staticForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // hide error container
        errorContainer.classList.add('hidden');
        try {
            let firstNameValue = firstName.value;
            checkFirstName(firstNameValue);
        }
        catch (e) {
            const message = typeof e === 'string' ? e : e.message;
            errorTextElement.textContent = `Error: ${message}`;
            errorContainer.classList.remove('hidden');
            firstName.focus();
            firstName.value = firstName.defaultValue;
            return;
        }
        try {
            let birthdayValue = birthday.value;
            birthdayValue = checkBirthday(birthdayValue);
            getAge(birthdayValue);
        }
        catch (e) {
            const message = typeof e === 'string' ? e : e.message;
            errorTextElement.textContent = `Error: ${message}`;
            errorContainer.classList.remove('hidden');
            birthday.focus();
            birthday.value = birthday.defaultValue;
            return;
        }
        try {
            let interestsValue = [...interests.selectedOptions]
                .map(option => option.value);
            checkInterests(interestsValue);
            staticForm.submit();
        }
        catch (e) {
            const message = typeof e === 'string' ? e : e.message;
            errorTextElement.textContent = `Error: ${message}`;
            errorContainer.classList.remove('hidden');
            interests.focus();
            interests.value = interests.defaultValue;
        }
    });
}




