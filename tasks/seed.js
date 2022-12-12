const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const {updateUser} = require("../data/users");
const users = data.users;

async function main() {
    // const db = await dbConnection.dbConnection();
    // await db.dropDatabase();
    console.log("Starting seeding the database. This may take a bit.");
    try {
        let mainUser = await users.createUser(
            "stevensstudent@gmail.com",
            "Ilovecoding123!"
        );

        let newUser1 = await users.createUser(
            "testUser1@gmail.com",
            "Iloveflowers123!"
        );

        let newUser2 = await users.createUser(
            "testUser2@gmail.com",
            "Ilovefood123!"
        );

        let newUser3 = await users.createUser(
            "testUser3@gmail.com",
            "Ilovecandy123!"
        );
        let newUser4 = await users.createUser(
            "testUser4@gmail.com",
            "Iloveapples123!"
        );
        let newUser5 = await users.createUser(
            "testUser5@gmail.com",
            "Iloveanime123!"
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
                profilePic: "https://storage.googleapis.com/datespot_image_storage/Insta%20Pro%20Pic.JPG",
                otherPics: [
                    "https://storage.googleapis.com/datespot_image_storage/me.jpeg",
                    "",
                    ""
                ]
            },
            interests: {"Lakes": "lakes", "Rock Climbing": "rock_climbing",
                "Italian": "italian", "Coffee & Tea": "coffee", "Bars": "bars",
                "Comedy Clubs": "comedyclubs", "Brazilian": "brazilian"},
            matches: [],
            usersSeen: {}
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
                profilePic: 'https://storage.googleapis.com/datespot_image_storage/IMG_5365.jpg',
                otherPics: [
                    "https://storage.googleapis.com/datespot_image_storage/IMG_5367.jpg",
                    "https://storage.googleapis.com/datespot_image_storage/IMG_5366.jpg",
                    ""
                ]
            },
            interests: {"Lakes": "lakes", "Bars": "bars", "Rock Climbing": "rock_climbing", "Italian": "italian"},
            matches: [],
            usersSeen: {}
        };


        await users.updateUser(newUser1._id, updatedUser);

        let obj = {};
        obj[mainUser._id] = 'liked';
        await updateUser(newUser1._id, {usersSeen: obj});

        updatedUser = {
            firstName: "Jessica",
            birthday: "06/02/1992",
            age: 23,
            gender: "woman",
            showGender: "off",
            pronouns: "she/her",
            showPronouns: "off",
            filters: {
                genderInterest: "men",
                minAge: 18,
                maxAge: 25,
                maxDistance: 15
            },
            location: {
                latitude: 40.7085,
                longitude: -73.9520,
                city: "Brooklyn",
                principalSubdiv: "New York",
            },
            about: "",
            images: {
                profilePic: "https://storage.googleapis.com/datespot_image_storage/Jessica_1.jpg",
                otherPics: [
                    "https://storage.googleapis.com/datespot_image_storage/Jessica_2.jpg",
                    "https://storage.googleapis.com/datespot_image_storage/Jessica_3.jpg",
                    "https://storage.googleapis.com/datespot_image_storage/Jessica_4.jpg"
                ]
            },
            interests: {"Coffee & Tea": "coffee", "Lakes": "lakes", "Bars": "bars", "Italian": "italian"},
            matches: [],
            usersSeen: {}
        };

        await users.updateUser(newUser2._id, updatedUser);

        // obj = {};
        // obj[mainUser._id] = 'liked';
        // await updateUser(newUser2._id, {usersSeen: obj});

        updatedUser = {
            firstName: "Luna",
            birthday: "06/02/1992",
            age: 24,
            gender: "woman",
            showGender: "off",
            pronouns: "she/her",
            showPronouns: "off",
            filters: {
                genderInterest: "men",
                minAge: 18,
                maxAge: 25,
                maxDistance: 15
            },
            location: {
                latitude: 40.745255,
                longitude: -74.034775,
                city: "Hoboken",
                principalSubdiv: "New Jersey",
            },
            about: "",
            images: {
                profilePic: "https://storage.googleapis.com/datespot_image_storage/Luna_1.jpg",
                otherPics: [
                    "https://storage.googleapis.com/datespot_image_storage/Luna_2.jpg",
                    "https://storage.googleapis.com/datespot_image_storage/Luna_3.jpg",
                    ""
                ]
            },
            interests: {"Coffee & Tea": "coffee", "Brazilian": "brazilian", "Comedy Clubs": "comedyclubs"},
            matches: [],
            usersSeen: {}
        };

        await users.updateUser(newUser3._id, updatedUser);

        obj = {};
        obj[mainUser._id] = 'liked';
        await updateUser(newUser3._id, {usersSeen: obj});

        updatedUser = {
            firstName: "Jackie",
            birthday: "06/02/1992",
            age: 27,
            gender: "woman",
            showGender: "off",
            pronouns: "she/her",
            showPronouns: "off",
            filters: {
                genderInterest: "men",
                minAge: 18,
                maxAge: 25,
                maxDistance: 15
            },
            location: {
                latitude: 40.745255,
                longitude: -74.034775,
                city: "Hoboken",
                principalSubdiv: "New Jersey",
            },
            about: "",
            images: {
                profilePic: "https://storage.googleapis.com/datespot_image_storage/Jackie_1.jpg",
                otherPics: [
                    "https://storage.googleapis.com/datespot_image_storage/Jackie_2.jpg",
                    "https://storage.googleapis.com/datespot_image_storage/Jackie_3.jpg",
                    ""
                ]
            },
            interests: {"Coffee & Tea": "coffee", "Brazilian": "brazilian", "Comedy Clubs": "comedyclubs"},
            matches: [],
            usersSeen: {}
        };

        await users.updateUser(newUser4._id, updatedUser);

        // obj = {};
        // obj[mainUser._id] = 'liked';
        // await updateUser(newUser4._id, {usersSeen: obj});

        updatedUser = {
            firstName: "Alexa",
            birthday: "06/02/1992",
            age: 21,
            gender: "woman",
            showGender: "off",
            pronouns: "she/her",
            showPronouns: "off",
            filters: {
                genderInterest: "men",
                minAge: 18,
                maxAge: 25,
                maxDistance: 15
            },
            location: {
                latitude: 40.745255,
                longitude: -74.034775,
                city: "Hoboken",
                principalSubdiv: "New Jersey",
            },
            about: "",
            images: {
                profilePic: "https://storage.googleapis.com/datespot_image_storage/alexa_1.jpg",
                otherPics: [
                    "https://storage.googleapis.com/datespot_image_storage/alexa_2.jpg",
                    "https://storage.googleapis.com/datespot_image_storage/alexa_3.jpg",
                    ""
                ]
            },
            interests: {"Coffee & Tea": "coffee", "Brazilian": "brazilian", "Comedy Clubs": "comedyclubs"},
            matches: [],
            usersSeen: {}
        };

        await users.updateUser(newUser5._id, updatedUser);

        obj = {};
        obj[mainUser._id] = 'liked';
        await updateUser(newUser5._id, {usersSeen: obj});
    }
    catch (e) {
        console.log(e);
    }
    console.log("Done seeding");

    // await dbConnection.closeConnection();
}
main();