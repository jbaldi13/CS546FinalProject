const mongoCollections = require('../config/mongoCollections');
const {ObjectId} = require("mongodb");
const users = mongoCollections.users;
const helpers = require("../helpers");
const {checkFirstName, checkBirthday, checkInterests, getAge,
    checkGender,
    checkPronouns,
    checkAbout, checkFilters, checkShowOnProfile, checkImages, checkEmail, checkLocation, checkMatches, checkUsersSeen
} = require("../helpers");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const saltRounds = 16;
const requestIp = require('request-ip');
const ipInfo = require('ipinfo');
const haversine = require('haversine-distance');

const createUser = async (email, password) => {
    email = helpers.checkEmail(email);
    password = helpers.checkPassword(password);

    //check if email already exists in database
    const userCollection = await users();
    const userInDB = await userCollection.findOne({email: email});
    if (userInDB != null){
        throw {errorMessage: "Error: a user already exists with the email "+email, status: 400};
    }

    //hash the password
    const hashedPass = await bcrypt.hash(password, saltRounds);

    let newUser = {
        email: email,
        password: hashedPass,
        firstName: null,
        birthday: null,
        age: null,
        gender: null,
        showGender: null,
        pronouns: null,
        showPronouns: null,
        filters: {genderInterest: null, minAge: null, maxAge: null, maxDistance: null},
        location: {latitude: null, longitude: null, city: null, principalSubdiv: null},
        about: null,
        images: {profilePic: null, otherPics: []},
        interests: {},
        matches: [],
        usersSeen: {}
    };

    const usersCollection = await users();
    const INSERT_INFO = await usersCollection.insertOne(newUser);
    if (!INSERT_INFO.acknowledged || !INSERT_INFO.insertedId){
        throw {errorMessage: 'Error: Could not add user', status: 500};
    }
    
    const NEW_ID = INSERT_INFO.insertedId.toString();
    return await getUserById(NEW_ID);
};

const checkUser = async (email, password) => { 
    //convert email to lowercase
    email = String(email).toLowerCase();

    //check if email exists in database
    const userCollection = await users();
    const userInDB = await userCollection.findOne({email: email});
    
    //if the username exists, compare the passwords
    if (userInDB != null){
      let comparePasswords = false;
      comparePasswords = await bcrypt.compare(password, userInDB.password);

      if(comparePasswords){
        return {authenticatedUser: true};
      }
      else{
        throw {errorMessage: "Error: Either the username or password is invalid.", status: 400};
      }
    }
    else{
        throw {errorMessage: "Error: Either the username or password is invalid.", status: 400};
    }
};

const getUserById = async (userId) => {
    userId = helpers.checkId(userId, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({_id: ObjectId(userId)});
    if (user === null) throw {errorMessage: "Error: No user with that id", status: 404};

    user._id = user._id.toString();
    return user;
};

const getUserByEmail = async (email) => {
    email = checkEmail(email);
    const userCollection = await users();
    const user = await userCollection.findOne({email: email});
    if (user === null) throw {errorMessage: "Error: No user with that email", status: 404};

    user._id = user._id.toString();
    return user;
};


const getAllUsers = async () => {
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();

    if (!userList) throw {errorMessage: "Error: Could not get all users", status: 500};

    userList.forEach(user => {user._id = user._id.toString();});
    return userList;

};

const distanceBetweenUsers = (lat1, lon1, lat2, lon2) => {
    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    let R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2-lat1);  // deg2rad below
    let dLon = deg2rad(lon2-lon1);
    let a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c; // Distance in km
    d = d * 0.621371; // Distance in miles
    return d;
};

const getMutualInterests = (userInterests, matchInterests) => {
    let mutualInterests = {};
    const matchInterestsKeys = Object.keys(matchInterests);
    for (let userInterestKey in userInterests) {
        if (matchInterestsKeys.includes(userInterestKey)) {
            mutualInterests[userInterestKey] = userInterests[userInterestKey];
        }
    }
    return mutualInterests;
};

const getAllCompatibleUsers = async (user) => {
    const genderInterest = user.filters.genderInterest;
    let gender;
    const userCollection = await users();
    let userList;
    if (genderInterest === "everyone") {
        userList = await userCollection.find({}).toArray();
    }
    else {
        if (genderInterest === "women") gender = "woman";
        else {
            gender = "man";
        }
        userList = await userCollection.find({gender: gender}).toArray();
    }


    if (!userList) throw {errorMessage: "Error: Could not get compatible users", status: 500};

    userList.forEach(user => {user._id = user._id.toString();});


    userList = userList.filter(otherUser => {
        let distance = distanceBetweenUsers(
            user.location.latitude,
            user.location.longitude,
            otherUser.location.latitude,
            otherUser.location.longitude
        );

        const mutualInterestCount = Object.keys(getMutualInterests(user.interests, otherUser.interests)).length;

        let otherUserDislikedUser = false;
        if (Object.keys(otherUser.usersSeen).includes(user._id)) {
            if (otherUser.usersSeen[user._id] === 'disliked') otherUserDislikedUser = true;
        }

        let otherUserGenderInterest = otherUser.filters.genderInterest;
        if (otherUserGenderInterest === "men") {
            otherUserGenderInterest = 'man';
            if (user.gender !== otherUserGenderInterest) return false;
        }
        else if (otherUserGenderInterest === "women") {
            otherUserGenderInterest = 'woman';
            if (user.gender !== otherUserGenderInterest) return false;
        }

        let areAgePrefsSatisfied = false;
        if (otherUser.age >= user.filters.minAge && otherUser.age <= user.filters.maxAge &&
        user.age >= otherUser.filters.minAge && user.age <= otherUser.filters.maxAge) {
            areAgePrefsSatisfied = true;
        }

        return ((distance <= user.filters.maxDistance && distance <= otherUser.filters.maxDistance) &&
            mutualInterestCount >= 3 && !user.matches.includes(otherUser._id) && otherUser._id !== user._id) &&
            !Object.keys(user.usersSeen).includes(otherUser._id) && otherUserDislikedUser === false &&
            areAgePrefsSatisfied === true;
    });

    return userList;
};

const removeUser = async (userId) => {
    userId = helpers.checkId(userId, "userId");
    const userCollection = await users();
    const deletionInfo = await userCollection.deleteOne({_id: ObjectId(userId)});
    if (deletionInfo.deletedCount === 0) {
        throw {errorMessage: `Error: Could not delete movie with id: ${userId}`, status: 500};
    }

    return `User with id, ${userId}, has been successfully deleted`;
};

const updateUser = async (userId, updatedUser) => {
    userId = helpers.checkId(userId, "userId");

    if (updatedUser.firstName) {
        checkFirstName(updatedUser.firstName);
    }
    if (updatedUser.birthday) {
        checkBirthday(updatedUser.birthday);
        updatedUser.age = getAge(updatedUser.birthday);
    }

    if (updatedUser.gender) {
        checkGender(updatedUser.gender);
    }
    if (updatedUser.showGender) {
        checkShowOnProfile(updatedUser.showGender, "Show gender");
    }
    if (updatedUser.pronouns) {
        checkPronouns(updatedUser.pronouns);
    }
    if (updatedUser.showPronouns) {
        checkShowOnProfile(updatedUser.showPronouns, "Show pronouns");
    }
    if (updatedUser.about !== undefined) {
        checkAbout(updatedUser.about);
    }
    if (updatedUser.interests) {
        checkInterests(updatedUser.interests);
    }
    if (updatedUser.filters) {
        checkFilters(updatedUser.filters);
    }
    if (updatedUser.images) {
        checkImages(updatedUser.images);
    }
    if (updatedUser.matches) {
        checkMatches(updatedUser.matches);
    }
    if (updatedUser.usersSeen) {
        checkUsersSeen(updatedUser.usersSeen);
    }


    const userCollection = await users();
    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(userId)},
        {$set: updatedUser}
    );


    if (updatedInfo.modifiedCount === 0) {
        throw {errorMessage: 'Error: Could not update any information about the user', status: 500};
    }

    return await getUserById(userId);
};

const validateOtherUserData = async(email) => {
    //Validates all userdata besides email & password (handled by checkUser)

    //Gets the user based on their email
    email = checkEmail(email);
    const userInDB = await getUserByEmail(email);
    try{
        checkFirstName(userInDB.firstName); 
        checkBirthday(userInDB.birthday);
        checkGender(userInDB.gender);
        checkPronouns(userInDB.pronouns);
        checkAbout(userInDB.about);
        checkInterests(userInDB.interests);
        checkShowOnProfile(userInDB.showGender, "Show gender");
        checkShowOnProfile(userInDB.showPronouns, "Show pronouns");
    }catch(e){
        throw {errorMessage: "Error: General info for the user is invalid or undefined", status: 400};
    }
    if(userInDB.age === null || userInDB.showGender === null || userInDB.showPronouns === null){
        throw {errorMessage: "Error: General info for the user is invalid or undefined", status: 400};
    }
    try{
        checkLocation(userInDB.location);
    }catch(e){
        throw {errorMessage: "Error: Location is invalid or undefined", status: 400};
    }
    try{
        checkFilters(userInDB.filters);
    }catch(e){
        throw {errorMessage: "Error: Filters for the user are invalid or undefined", status: 400};
    }
    if(typeof userInDB.filters.minAge !== "number" || typeof userInDB.filters.maxAge !== "number" || typeof userInDB.filters.maxDistance !== "number"){
        throw {errorMessage: "Error: Filters for the user are invalid or undefined", status: 400};
    }
    try{
        checkImages(userInDB.images);
    }catch(e){
        throw {errorMessage: "Error: Images for the user are invalid or undefined", status: 400};
    }
};

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}


function getMidpoint(lat1, lng1, lat2, lng2) {
    // // Calculate the great-circle distance between the two coordinates
    // // using the Haversine formula
    // const distance = haversine({latitude: lat1, longitude: lng1}, {latitude: lat2, longitude: lng2});
    // console.log(distance);
    //
    // // Calculate the bearing between the two coordinates
    // const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
    // const x = Math.cos(lat1) * Math.sin(lat2) -
    //     Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
    // const bearing = Math.atan2(y, x);
    //
    // // Calculate the midpoint using the distance and bearing
    // const lat3 = Math.asin(Math.sin(lat1) * Math.cos(distance / 2) +
    //     Math.cos(lat1) * Math.sin(distance / 2) * Math.cos(bearing));
    // const lng3 = lng1 + Math.atan2(Math.sin(bearing) * Math.sin(distance / 2) * Math.cos(lat1),
    //     Math.cos(distance / 2) - Math.sin(lat1) * Math.sin(lat3));
    //
    // return [lat3, lng3];
    // Convert latitude and longitude to radians
    lat1 = lat1 * (Math.PI / 180);
    lng1 = lng1 * (Math.PI / 180);
    lat2 = lat2 * (Math.PI / 180);
    lng2 = lng2 * (Math.PI / 180);

    // Calculate the delta values for latitude and longitude
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    // Calculate the midpoint using the Haversine formula
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = 6371 * c;

    const lat3 = lat1 + (dLat / 2);
    const lng3 = lng1 + (dLng / 2);

    // Convert the midpoint from radians back to degrees
    return [lat3 * (180 / Math.PI), lng3 * (180 / Math.PI)];

}



const getDateSpots = async (userInterests, matchInterests, userLat, userLon,
                            matchLat, matchLon) => {
    let dateSpots = [];
    const config = {
        headers: { Authorization: `Bearer ETLfinv9BVg1mjN7Afn4VCXWjFruJIHItswAdyRJEEHhyCvEFoD5ghgr016hD0FpZ3Gpm0R-HiOY64MFbOOFlnye0yTfRXPHfUGNii7RwhY8iHAhaih-n4v_YMBtY3Yx` }
    };

    const mutualInterests = getMutualInterests(userInterests, matchInterests);
    const midpoint = getMidpoint(userLat, userLon, matchLat, matchLon);
    // console.log(midpoint);
    const lat = midpoint[0];
    const lon = midpoint[1];

    for (let mutualInterest in mutualInterests) {
        const {data} = await axios.get(`https://api.yelp.com/v3/businesses/search?categories=${mutualInterests[mutualInterest]}&latitude=${lat}&longitude=${lon}`, config);
        dateSpots.push({interestCategory: mutualInterest, businesses: data});
    }

    return dateSpots;
};

async function getLocation() {
    // Make a GET request to the API endpoint, passing in the IP address as a query parameter
    const response = await fetch(`http://api.ipapi.com/96.225.87.238?access_key=ee331d210a776af89a3b7ed188fcf77e`);

    // Parse the JSON response
    const data = await response.json();

    return {
        location: {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            principalSubdiv: data.region_name
        }
    };
}


module.exports = {getLocation, getDateSpots, createUser, checkUser, getUserById, getUserByEmail, getAllUsers, getAllCompatibleUsers, removeUser, updateUser, validateOtherUserData};