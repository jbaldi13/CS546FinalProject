const {ObjectId} = require("mongodb");

function checkId(arg, argName) {
    if (typeof arg === 'undefined') throw `Error: The ${argName} was not provided`;
    if (typeof arg !== "string") throw `Error: The ${argName} is of the ${typeof arg} type; it should be of the string type`;
    if (arg === "") throw `Error: The ${argName}t is an empty string`;
    if (arg.trim() === '') throw `Error: The ${argName} is a string that only contains spaces`;

    arg = arg.trim();
    if (!ObjectId.isValid(arg)) throw `Error: The ${argName} is not a valid Object ID`;

    return arg;
}

function checkStringErrors(arg, argName) {
    if (typeof arg === 'undefined') throw `\"${argName}\" was not provided`;
    if (typeof arg !== "string") throw `\"${argName}\" is of the ${typeof arg} type; it should be of the string type`;
    if (arg === "") throw `\"${argName}\" is an empty string`;
    if (arg.trim() === '') throw `\"${argName}\" is a string that only contains spaces`;

    arg = arg.trim();
    return arg;
}

function checkFirstName(firstName){
    firstName = checkStringErrors(firstName, '\"First Name\"');

    for (let i = 0; i < firstName.length; i++) {
        if (!(/^[A-Za-z'-]/g.test(firstName[i]))) throw `The first name must only contain letters a-z or A-Z, an apostrophe, or a hyphen`;
    }
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

function checkGender(gender) {
    checkStringErrors(gender, 'Gender');
}

function checkPronouns(pronouns) {
    checkStringErrors(pronouns, 'Pronouns');
}

function checkShowOnProfile(arg, argName) {
    if (Array.isArray(arg)) return arg[1];
    else {
        if (!arg) throw `\"${argName}\" checkbox malfunction`;
    }
    return arg;
}

function checkAbout(about) {
    if (about !== "") {
        if (about.trim() === "") throw "\'About me\' can't contain only spaces";
    }
}

function checkInterests(interests) {
    if (Array.isArray(interests)) {
        if (interests.length > 10) throw "You must only select up to 10 interests";
    }
}

function checkEmail(email){
    if(!email) throw "You must provide an email.";
    email = String(email).toLowerCase()
    const res = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!res.test(email)){
        throw "Error: you must enter a valid email address."
    }
    return email
}

function checkLocation(location) {
    if (!location.latitude || !location.longitude ||
        !location.locality || !location.principalSubdiv) throw "Could not get user location";

}

function checkFilters(filters) {
    checkStringErrors(filters.genderInterest, "Gender Interest");
    if (filters.genderInterest === "Select Gender") throw `You must select what gender you're interested in`;
    if (filters.maxAge < filters.minAge) throw 'The Max Age must be greater than or equal to the Min Age';
}

function checkPassword(password){
    //check if password is provided
    if(!password){
        throw "Error: you must provide a password."
    }
    
    //trim password and check length if length is atleast 6
    if(password.trim().length < 6){
        throw "Error: password must be atleast 6 characters long."
    }

    //check if password has any spaces
    var checkpass = password.replace(/\s/g,"")
    if(checkpass != password){
        throw "Error: password cannot have any spaces."
    }

    //check if password has atleast one uppercase character
    if(!checkForUpperCaseLetter(password)){
        throw "Error: password must contain atleast one uppercase letter."
    }

    //check if password has atleast one number
    if(!checkForNumber(password)){
        throw "Error: password must contain atleast one number."
    }

    //check if password has atleast one special character
    if(!checkForSpecialChar(password)){
        throw "Error: password must contain atleast one special character."
    }

    //return password as inputted
    return password
}

function checkForUpperCaseLetter(string){
    for (i = 0; i < string.length; i++){
        if (string.charAt(i) == string.charAt(i).toUpperCase() && string.charAt(i).match(/[a-zA-Z]/i)){
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
    var regex = /[!.,?`~@#$%^&*()_|+\-=;:<>\{\}\[\]\\\/]/i
    for (i = 0; i < string.length; i++){
        if (string.charAt(i).match(regex)){
          return true;
        }
    }
    return false;
}



module.exports = {checkFilters, 
    checkLocation, 
    checkShowOnProfile, 
    checkId, 
    checkFirstName, 
    checkBirthday, 
    checkGender, 
    checkPronouns, 
    checkAbout, 
    checkEmail, 
    checkInterests,
    checkPassword, 
    getAge};