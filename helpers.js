const {ObjectId} = require("mongodb");

function checkId(arg, argName) {
    if (typeof arg === 'undefined') throw {errorMessage: `Error: The ${argName} was not provided`, status: 400};
    if (typeof arg !== "string") throw {errorMessage: `Error: The ${argName} is of the ${typeof arg} type; it should be of the string type`, status: 400};
    if (arg === "") throw {errorMessage: `Error: The ${argName}t is an empty string`, status: 400};
    if (arg.trim() === '') throw {errorMessage: `Error: The ${argName} is a string that only contains spaces`, status: 400};

    arg = arg.trim();
    if (!ObjectId.isValid(arg)) throw {errorMessage: `Error: The ${argName} is not a valid Object ID`, status: 400};

    return arg;
}

function checkStringErrors(arg, argName) {
    if (typeof arg === 'undefined') throw {errorMessage: `\"${argName}\" was not provided`, status: 400};
    if (typeof arg !== "string") throw {errorMessage: `\"${argName}\" is of the ${typeof arg} type; it should be of the string type`, status: 400};
    if (arg === "") throw {errorMessage: `\"${argName}\" is an empty string`, status: 400};
    if (arg.trim() === '') throw {errorMessage: `\"${argName}\" is a string that only contains spaces`, status: 400};

    arg = arg.trim();
    return arg;
}

function checkFirstName(firstName){
    firstName = checkStringErrors(firstName, '\"First Name\"');

    for (let i = 0; i < firstName.length; i++) {
        if (!(/^[A-Za-z'-]/g.test(firstName[i]))) throw {errorMessage: `The first name must only contain letters a-z or A-Z, an apostrophe, or a hyphen`, status: 400};
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
    if (bDay.length !== 10) throw {errorMessage: "Birthday must be in the form: mm/dd/yyyy", status: 400};

    let month = Number(bDay.slice(0, 2));
    let day = Number(bDay.slice(3, 5));
    let year = Number(bDay.slice(6));
    if (isNaN(month) || isNaN(day) || isNaN(year)) throw {errorMessage: "The month, day, and year must be digits", status: 400};
    if (bDay[2] !== '/' || bDay[5] !== '/') throw {errorMessage: "Birthday must be in the form: mm/dd/yyyy", status: 400};
    if (day > daysInEachMonth[month]) throw {errorMessage: `Regarding the birthday input, there are not ${day} days in ${monthNames[month]}`, status: 400};
    if (month < 1 || month > 12) throw {errorMessage: `Regarding the birthday input, ${month} is not a valid month`, status: 400};
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

    if (age < 18) throw {errorMessage: "You must be at least 18 years old to use this app", status: 400};
    return age;
}

function checkGender(gender) {
    return checkStringErrors(gender, 'Gender');
}

function checkPronouns(pronouns) {
    return checkStringErrors(pronouns, 'Pronouns');
}

function checkShowOnProfile(arg, argName) {
    if (Array.isArray(arg)) return arg[1];
    else {
        if (!arg) throw {errorMessage: `\"${argName}\" checkbox malfunction`, status: 400};
    }
    return arg;
}

function checkAbout(about) {
    if (about !== "") {
        if (about.trim() === "") throw {errorMessage: "\'About me\' can't contain only spaces", status: 400};
    }
    return about;
}

function checkInterests(interests) {
    if (typeof interests === "undefined") throw {errorMessage: "Interests doesn't exists", status: 400};
    if (!Array.isArray(interests)) throw {errorMessage: "Interests should be an array", status: 400};
    if (interests.length < 3 || interests.length > 10) throw {errorMessage: "You must select 3-10 interests", status: 400};
    return interests;
}

function checkEmail(email){
    if(!email) throw {errorMessage: "You must provide an email.", status: 400};
    email = String(email).toLowerCase();
    const res = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!res.test(email)){
        throw {errorMessage: "Error: you must enter a valid email address.", status: 400};
    }
    return email;
}

function checkLocation(location) {
    if (!location || !location.latitude || !location.longitude ||
        !location.city || !location.principalSubdiv) throw {errorMessage: "Could not get user location", status: 400};
    return location;
}

function checkFilters(filters) {
    checkStringErrors(filters.genderInterest, "Gender Interest");
    if (filters.genderInterest === "Select Gender") throw {errorMessage:`You must select what gender you're interested in`, status: 400};
    if (filters.maxAge < filters.minAge) throw {errorMessage: 'The Max Age must be greater than or equal to the Min Age', status: 400};
    return filters;
}

function checkImages(images) {
    if (typeof images !== "object") throw {errorMessage:'Images should be an object', status: 400};
    if (typeof images.profilePic !== 'string') throw {errorMessage:'Error in images format: profile pic should be string', status: 400};
    if (typeof images.otherPics !== 'object') throw {errorMessage:'Error in images format: other pics field should be an object', status: 400};
    return images;
}

function checkPassword(password){
    //check if password is provided
    if(!password){
        throw {errorMessage: "Error: you must provide a password.", status: 400};
    }
    
    //trim password and check length if length is atleast 6
    if(password.trim().length < 6){
        throw {errorMessage: "Error: password must be atleast 6 characters long.", status: 400};
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

function checkMatches(matches) {
    if (typeof matches === "undefined") throw {errorMessage: 'Matches doesn\'t exist', status: 400};
    if (!Array.isArray(matches)) throw {errorMessage: 'Matches should be an array', status: 400};
}
function checkUsersSeen(usersSeen) {
    if (typeof usersSeen === "undefined") throw {errorMessage: 'usersSeen doesn\'t exist', status: 400};
    if (typeof usersSeen !== 'object') throw {errorMessage: 'usersSeen should be an object', status: 400};
    if (typeof usersSeen === 'function') throw {errorMessage: 'usersSeen should be an object', status: 400};
    if (Array.isArray(usersSeen)) throw {errorMessage: 'usersSeen should be an object', status: 400};
}

module.exports = {
    checkUsersSeen,
    checkMatches,
    checkFilters,
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
    checkPassword, checkImages,
    getAge};