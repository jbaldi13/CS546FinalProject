const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;

async function main() {
    // const db = await dbConnection.dbConnection();
    // await db.dropDatabase();

    let newUser1 = await users.createUser(
        "testUser1@gmail.com",
        "IlikeFlowers22!",
    );

    let newUser2 = await users.createUser(
        "testUser2@gmail.com",
        "IlikeFood22!",
    );

    let updatedUser = {
        firstName: "Sydney",
        birthday: "06/02/1996",
        age: 26,
        gender: "woman",
        showGender: "off",
        pronouns: "she/her",
        showPronouns: "off",
        filters: {
            genderInterest: "men",
            minAge: 21,
            maxAge: 29,
            maxDistance: 10
        },
        location: {
            latitude: 40.745255,
            longitude: -74.034775,
            city: "Hoboken",
            principalSubdiv: "New Jersey",
        },
        about: "",
        images: {
            profilePic: "",
            otherPics: {
                other1: "",
                other2: "",
                other3: ""
            }
        },
        interests: ["musicvenues", "comedyclubs", "pizza", "fondue", "icecream", "paintandsip", "hauntedhouses", "arcades", "bars"],
        matches: []
    };
    newUser1 = await users.updateUser(newUser1._id, updatedUser);

    updatedUser = {
        firstName: "Jessica",
        birthday: "06/02/1992",
        age: 30,
        gender: "woman",
        showGender: "off",
        pronouns: "she/her",
        showPronouns: "off",
        filters: {
            genderInterest: "men",
            minAge: 18,
            maxAge: 25,
            maxDistance: 5
        },
        location: {
            latitude: 40.7085,
            longitude: -73.9520,
            city: "Brooklyn",
            principalSubdiv: "New York",
        },
        about: "",
        images: {
            profilePic: "",
            otherPics: {
                other1: "",
                other2: "",
                other3: ""
            }
        },
        interests: ["musicvenues", "comedyclubs"],
        matches: []
    };

    newUser2 = await users.updateUser(newUser2._id, updatedUser);

    // await dbConnection.closeConnection();
}
main();