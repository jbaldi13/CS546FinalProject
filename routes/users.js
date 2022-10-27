const express = require('express');
const router = express.Router();
const {createUser} = require("../data/users");

router
    .route('/')
    .post(async (req, res) => {
    const userData = req.body;
    try {
        const {password,
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
            eventSubcategories} = userData;
        await createUser(password,
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
            eventSubcategories);
        res.json("Need to create getUser function to display here");
    }
    catch (e) {
        res.status(500).json({error: e.toString()});
    }
});

module.exports = router;