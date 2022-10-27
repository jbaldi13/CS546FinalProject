const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

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
        sexualOrientation: sexualOrientation.sexualOrientation,
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
    // return await getUserById(NEW_ID);
};

module.exports = {createUser};