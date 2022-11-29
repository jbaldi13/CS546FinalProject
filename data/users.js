const mongoCollections = require('../config/mongoCollections');
const {ObjectId} = require("mongodb");
const users = mongoCollections.users;
const helpers = require("../helpers");
const {checkFirstName, checkBirthday, checkInterests, getAge,
    checkGender,
    checkPronouns,
    checkAbout, checkFilters, checkShowOnProfile, checkImages, checkEmail, checkLocation, checkMatches
} = require("../helpers");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const saltRounds = 16;

const createUser = async (email, password) => {
    //input error checking (TODO...)
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
        interests: [],
        matches: [],
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
    //check inputs for errors and convert email to lowercase

    email = helpers.checkEmail(email);
    password = helpers.checkPassword(password);

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

const getMutualInterestCount = (user1Interests, user2Interests) => {
    const matchesArr = user1Interests.filter(e => {
        return user2Interests.includes(e);
    });

    return matchesArr.length;
};

const getAllCompatibleUsers = async (user) => {
    const genderInterest = user.filters.genderInterest;
    let gender;
    if (genderInterest === "women") gender = "woman";
    else {
        gender = "man";
    }
    const userCollection = await users();
    let userList = await userCollection.find({gender: gender}).toArray();

    if (!userList) throw {errorMessage: "Error: Could not get compatible users", status: 500};

    userList.forEach(user => {user._id = user._id.toString();});


    userList = userList.filter(otherUser => {
        let distance = distanceBetweenUsers(
            user.location.latitude,
            user.location.longitude,
            otherUser.location.latitude,
            otherUser.location.longitude
        );

        const mutualInterestCount = getMutualInterestCount(user.interests, otherUser.interests);



        return ((distance <= user.filters.maxDistance && distance <= otherUser.filters.maxDistance) &&
            mutualInterestCount >= 3 && !user.matches.includes(otherUser._id) && otherUser._id !== user._id) &&
            user.gender[0] === otherUser.filters.genderInterest[0];
    });

    return userList;
};

const getMatches = async (user) => {
    const matches = user.matches;

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
    try{
        checkImages(userInDB.images);
    }catch(e){
        throw {errorMessage: "Error: Images for the user are invalid or undefined", status: 400};
    }
};

const getMutualInterests = (userInterests, matchInterests) => {
    return userInterests.filter(userInterest => {
        return matchInterests.includes(userInterest);
    });
};

const getDateSpots = async (userInterests, matchInterests, latitude, longitude, maxDistance) => {
    let dateSpots = [];
    const config = {
        headers: { Authorization: `Bearer ETLfinv9BVg1mjN7Afn4VCXWjFruJIHItswAdyRJEEHhyCvEFoD5ghgr016hD0FpZ3Gpm0R-HiOY64MFbOOFlnye0yTfRXPHfUGNii7RwhY8iHAhaih-n4v_YMBtY3Yx` }
    };
    // console.log([userInterests, matchInterests, latitude, longitude, maxDistance]);
    const mutualInterests = getMutualInterests(userInterests, matchInterests);
    maxDistance = maxDistance * 1608.344; // convert miles to meters for radius parameter
    maxDistance = parseInt(maxDistance); // convert radius to whole number bc yelp requires whole # for radius
    for (let i = 0; i < mutualInterests.length; i++) {
        const {data} = await axios.get(`https://api.yelp.com/v3/businesses/search?categories=${mutualInterests[i]}&latitude=${latitude}&longitude=${longitude}&radius=${maxDistance}`, config);
        dateSpots.push({interestCategory: mutualInterests[i], businesses: data});
    }

    return dateSpots;
};

module.exports = {getDateSpots, createUser, checkUser, getUserById, getUserByEmail, getAllUsers, getAllCompatibleUsers, removeUser, updateUser, validateOtherUserData};