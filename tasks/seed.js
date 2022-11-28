const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;

async function main() {
    // const db = await dbConnection.dbConnection();
    // await db.dropDatabase();

    let mainUser = await users.createUser(
        "stevensstudent@gmail.com",
        "ILoveCoding123!"
    );

    let newUser1 = await users.createUser(
        "testUser1@gmail.com",
        "IlikeFlowers22!"
    );

    let newUser2 = await users.createUser(
        "testUser2@gmail.com",
        "IlikeFood22!"
    );

    let updatedUser = {
        firstName: "Michael",
        birthday: "07/10/1997",
        age: 25,
        gender: "man",
        showGender: "on",
        pronouns: "he/him",
        showPronouns: "off",
        filters: {
            genderInterest: "women",
            minAge: 21,
            maxAge: 35,
            maxDistance: 15
        },
        location: {
            latitude: 40.766371,
            longitude: -74.025372,
            city: "Weehawken",
            principalSubdiv: "New Jersey",
        },
        about: "Hi, I'm Mike",
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

    mainUser = await users.updateUser(mainUser._id, updatedUser);


    updatedUser = {
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
            profilePic: "https://www.muscleandfitness.com/wp-content/uploads/2017/04/woman-beach-1280.jpg?quality=86&strip=all",
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
            profilePic: "https://parade.com/.image/ar_16:9%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTkzMTUwNTkxMDU1MTc3Mjk2/jessica-chastain-ftr.jpg",
            otherPics: {
                other1: "",
                other2: "",
                other3: ""
            }
        },
        interests: ["musicvenues", "comedyclubs", "pizza", "fondue", "icecream", "paintandsip", "hauntedhouses", "arcades", "bars"],
        matches: []
    };

    newUser2 = await users.updateUser(newUser2._id, updatedUser);

    // await dbConnection.closeConnection();
}
main();