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
    if (typeof arg === 'undefined') throw `Error: The ${argName} argument was not provided`;
    if (typeof arg !== "string") throw `Error: The ${argName} argument is of the ${typeof arg} type; it should be of the string type`;
    if (arg === "") throw `Error: The ${argName} argument is an empty string`;
    if (arg.trim() === '') throw `Error: The ${argName} argument is a string that only contains spaces`;

    arg = arg.trim();
    return arg;
}

function checkFirstName(firstName){
    firstName = checkStringErrors(firstName, 'firstName');

    for (let i = 0; i < firstName.length; i++) {
        if (!(/^[A-Za-z'-]/g.test(firstName[i]))) throw `The first name must only contain letters a-z or A-Z, an apostrophe, or a hyphen`;
    }

    return firstName;
}

function checkEmail(email){
    if(!email) throw "Error: You must provide an email.";
}
function checkLocation(location){
    if(!location) throw "Error: You must provide a location.";
}
function checkBDay(day){
    if(!day) throw "Error: You must provide a day.";
}
function checkBMon(mon){
    if(!mon) throw "Error: You must provide a month.";
}
function checkBYear(year){
    if(!year) throw "Error: You must provide a year.";
}
function checkGender(gender){
    if(!gender) throw "Error: You must provide a gender.";
}
function checkOrientation(orient){
    if(!orient) throw "Error: You must provide a first name.";
}

module.exports = {checkId, checkFirstName, checkEmail, checkLocation, checkBDay, checkBMon, checkBYear, checkGender, checkOrientation};