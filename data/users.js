const mongoCollections = require('../config/mongoCollections');
const {ObjectId} = require("mongodb");
const users = mongoCollections.users;
const helpers = require("../helpers");
const {checkFirstName, checkBirthday, checkInterests, getAge,
    checkGender,
    checkShowOnProfile,
    checkPronouns,
    checkAbout, checkLocation, checkFilters
} = require("../helpers");
const bcrypt = require("bcryptjs")
const saltRounds = 16

const createUser = async (email, password) => {
    //input error checking (TODO...)
    //email = helpers.checkEmail(email) make sure to convert to lowercase
    password = helpers.checkPassword(password)

    //check if email already exists in database
    const userCollection = await users()
    const userInDB = await userCollection.findOne({email: email});
    if (userInDB != null){
        throw "Error: a user already exists with the email "+email
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
        location: {latitude: null, longitude: null, locality: null, principalSubdiv: null},
        about: null,
        images: {profilePic: null, otherPics: []},
        interests: [],
        matches: [],
    };

    const usersCollection = await users();
    const INSERT_INFO = await usersCollection.insertOne(newUser);
    if (!INSERT_INFO.acknowledged || !INSERT_INFO.insertedId){
        throw 'Could not add user';
    }
    
    const NEW_ID = INSERT_INFO.insertedId.toString();
    return await getUserById(NEW_ID);

    
};

const checkUser = async (email, password) => { 
    //check inputs for errors and convert email to lowercase
    //email = helpers.checkEmail(email)
    password = helpers.checkPassword(password)
  
    //check if email exists in database
    const userCollection = await users()
    const userInDB = await userCollection.findOne({email: email});
    
    //if the username exists, compare the passwords
    if (userInDB != null){
      let comparePasswords = false
      comparePasswords = await bcrypt.compare(password, userInDB.password);
  
      if(comparePasswords){
        return {authenticatedUser: true}
      }
      else{
        throw "Error: Either the username or password is invalid."
      }
    }
    else{
      throw "Error: Either the username or password is invalid."
    }
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
        updatedUser.about = checkAbout(updatedUser.about);
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

module.exports = {createUser, checkUser, getUserById, getAllUsers, removeUser, updateUser};