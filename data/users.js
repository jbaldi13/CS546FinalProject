const mongoCollections = require('../config/mongoCollections');
const {ObjectId} = require("mongodb");
const users = mongoCollections.users;
const {checkId} = require("../helpers");

const createUser = async (
    password,
    firstName,
    location,
    dobDay,
    dobMonth,
    dobYear,
    showGender,
    gender,
    sexualOrientation,
    email,
    proPic,
    otherPic1,
    otherPic2,
    otherPic3,
    about,
    matches,
    placeSubcategories,
    eventSubcategories
) => {
    let newUser = {
        password: password,
        firstName: firstName,
        location: location,
        dobDay: dobDay,
        dobMonth: dobMonth,
        dobYear: dobYear,
        showGender: showGender,
        gender: gender,
        sexualOrientation: sexualOrientation,
        email: email,
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
    userId = checkId(userId, "userId");
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
    userId = checkId(userId, "userId");
    const userCollection = await users();
    const deletionInfo = await userCollection.deleteOne({_id: ObjectId(userId)});
    if (deletionInfo.deletedCount === 0) {
        throw `Error: Could not delete movie with id: ${userId}`;
    }

    return `User with id, ${userId}, has been successfully deleted`;
};

const updateUser = async (
    userId,
    password,
    firstName,
    location,
    dobDay,
    dobMonth,
    dobYear,
    showGender,
    gender,
    sexualOrientation,
    email,
    proPic,
    otherPic1,
    otherPic2,
    otherPic3,
    about,
    matches,
    placeSubcategories,
    eventSubcategories
) => {
    userId = checkId(userId, "userId");

    const updatedUserData = {};

    updatedUserData.password = password;
    updatedUserData.firstName = firstName;
    updatedUserData.location = location;
    updatedUserData.dobDay = dobDay;
    updatedUserData.dobMonth = dobMonth;
    updatedUserData.dobYear = dobYear;
    updatedUserData.showGender = showGender;
    updatedUserData.gender = gender;
    updatedUserData.sexualOrientation = sexualOrientation;
    updatedUserData.email = email;
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