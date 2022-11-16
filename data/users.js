const mongoCollections = require('../config/mongoCollections');
const {ObjectId} = require("mongodb");
const users = mongoCollections.users;
const helpers = require("../helpers");
const {checkFirstName, checkBirthday, checkInterests} = require("../helpers");

const createUser = async (
    email,
    password,
    firstName,
    birthday,
    gender,
    showGender,
    pronouns,
    showPronouns,
    filters,
    location,
    about,
    images,
    interests,
    matches
) => {
    //input error checking (TODO...)


    let newUser = {
        email: email,
        password: password,
        firstName: firstName,
        birthday: birthday,
        gender: gender,
        showGender: showGender,
        pronouns: pronouns,
        showPronouns: showPronouns,
        filters: filters,
        location: location,
        about: about,
        images: images,
        interests: interests,
        matches: matches,
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

const updateUser = async (userId, updatedUser) => {
    userId = helpers.checkId(userId, "userId");

    if (updatedUser.firstName) {
        updatedUser.firstName = checkFirstName(updatedUser.firstName);
    }
    if (updatedUser.birthday) {
        updatedUser.birthday = checkBirthday(updatedUser.birthday);
    }
    if (updatedUser.interests) {
        checkInterests(updatedUser.interests);
    }

    const userCollection = await users();
    const updatedInfo = await userCollection.updateOne(
        {_id: ObjectId(userId)},
        {$set: updatedUser}
    );

    if (updatedInfo.modifiedCount === 0) {
        throw 'Error: Could not update any information about the user';
    }

    return await getUserById(userId);
};

module.exports = {createUser, getUserById, getAllUsers, removeUser, updateUser};