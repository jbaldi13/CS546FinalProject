const mongoCollections = require('../config/mongoCollections');
const {ObjectId} = require("mongodb");
const users = mongoCollections.users;
const helpers = require("../helpers");

const createUser = async (
    firstName,
    email,
    password,
    location,
    dobDay,
    dobMonth,
    dobYear,
    gender,
    showGender,
    sexualOrientation,
    proPic,
    otherPic1,
    otherPic2,
    otherPic3,
    about,
    matches,
    placeSubcategories,
    eventSubcategories
) => {
    //input error checking (NOT COMPLETE)
    helpers.checkFirstName(firstName);
    helpers.checkEmail(email);
    helpers.checkLocation(location);
    helpers.checkBDay(dobDay);
    helpers.checkBMon(dobMonth);
    helpers.checkBYear(dobYear);
    helpers.checkGender(gender);
    helpers.checkOrientation(sexualOrientation);

    let newUser = {
        firstName: firstName,
        email: email,
        password: password,
        location: location,
        dobDay: dobDay,
        dobMonth: dobMonth,
        dobYear: dobYear,
        gender: gender,
        showGender: showGender,
        sexualOrientation: sexualOrientation,
        proPic: proPic,
        otherPic1: otherPic1,
        otherPic2: otherPic2,
        otherPic3: otherPic3,
        about: about,
        matches: matches,
        placeSubcategories: placeSubcategories,
        eventSubcategories: eventSubcategories
    };

    const usersCollection = await users();
    const INSERT_INFO = await usersCollection.insertOne(newUser);
    if (!INSERT_INFO.acknowledged || !INSERT_INFO.insertedId)
        throw 'Could not add user';

    const NEW_ID = INSERT_INFO.insertedId.toString();
    return await getUserById(NEW_ID);
};

const getUserById = async (userId) => {
    userId = helpers.checkId(userId, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({_id: ObjectId(userId)});
    if (user === null) throw "Error: No user with that id";

    user._id = user._id.toString();
    return user;
};

const getAllUsers = async () => {
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();

    if (!userList) throw "Error: Could not get all users";

    userList.forEach(user => {user._id = user._id.toString();});
    return userList;

};

const removeUser = async (userId) => {
    userId = helpers.checkId(userId, "userId");
    const userCollection = await users();
    const deletionInfo = await userCollection.deleteOne({_id: ObjectId(userId)});
    if (deletionInfo.deletedCount === 0) {
        throw `Error: Could not delete movie with id: ${userId}`;
    }

    return `User with id, ${userId}, has been successfully deleted`;
};

const updateUser = async (
    userId,
    firstName,
    email,
    password,
    location,
    dobDay,
    dobMonth,
    dobYear,
    gender,
    showGender,
    sexualOrientation,
    proPic,
    otherPic1,
    otherPic2,
    otherPic3,
    about,
    matches,
    placeSubcategories,
    eventSubcategories
) => {
    userId = helpers.checkId(userId, "userId");

    const updatedUserData = {};

    updatedUserData.firstName = firstName;
    updatedUserData.email = email;
    updatedUserData.password = password;
    updatedUserData.location = location;
    updatedUserData.dobDay = dobDay;
    updatedUserData.dobMonth = dobMonth;
    updatedUserData.dobYear = dobYear;
    updatedUserData.gender = gender;
    updatedUserData.showGender = showGender;
    updatedUserData.sexualOrientation = sexualOrientation;
    updatedUserData.proPic = proPic;
    updatedUserData.otherPic1 = otherPic1;
    updatedUserData.otherPic2 = otherPic2;
    updatedUserData.otherPic3 = otherPic3;
    updatedUserData.about = about;
    updatedUserData.matches = matches;
    updatedUserData.placeSubcategories = placeSubcategories;
    updatedUserData.eventSubcategories = eventSubcategories;


    const userCollection = await users();
    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(userId)},
        {$set: updatedUserData}
    );

    if (updatedInfo.modifiedCount === 0) {
        throw 'Error: Could not updated any information about the user';
    }

    return await getUserById(userId);
};

module.exports = {createUser, getUserById, getAllUsers, removeUser, updateUser};