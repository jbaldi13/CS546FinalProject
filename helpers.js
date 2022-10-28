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

module.exports = {checkId};