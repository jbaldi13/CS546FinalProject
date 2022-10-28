const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;

async function main() {
    const db = await dbConnection.dbConnection();
    await db.dropDatabase();

    const newUser1 = await users.createUser(
        null,
        "Joe",
        null,
        7,
        10,
        1997,
        true,
        "male",
        "heterosexual",
        "joeshmo@gmail.com",
        "https://www.elitesingles.com/wp-content/uploads/sites/85/2020/06/2b_en_ta_teaser_sp1-350x264.png",
        null,
        null,
        null,
        "I have two dogs, love the outdoors, and love to play basketball",
        [
            {"user_id": "this user's will be here"},
            {"user_id": "this user's id will be here"},
            {"user_id": "this user's id will be here"}
        ],
        ["Hiking", "Cinema", "Silent Disco", "Coffeeshops", "Bars"],
        ["Hip Hop/Rap", "Dance", "Comedy", "Drawing/Painting"]
    );

    await dbConnection.closeConnection();
}
main();