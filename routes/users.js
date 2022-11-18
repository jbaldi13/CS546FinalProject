const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const {checkId, checkFirstName, checkBirthday, checkInterests, checkGender, checkAbout, checkPronouns, checkShowOnProfile,
    checkLocation,
    checkFilters
} = require("../helpers");
const {getUserById, updateUser} = require("../data/users");



// // Get login page
// router.get('/login', async (req, res) => {
//   // TODO...
// });
//

// Get signup page
router.get('/signup', async (req, res) => {
    try {
        res.render('users/signup', {title : "Create an Account"});

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

// get main onboarding page
router.get('/onboarding/:id', async (req, res) => {
    try {
        res.render('users/onboarding', {title : "Create an Account", id: req.params.id});

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

// get onboarding/location page
router.get('/onboarding/location/:id', async (req, res) => {
    try {
        res.render('users/location', {title : "Location", id: req.params.id});

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

// get onboarding/filters page
router.get('/onboarding/filters/:id', async (req, res) => {
    try {
        res.render('users/filters', {title : "Filters", id: req.params.id});

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

// get onboarding/images page
router.get('/onboarding/images/:id', async (req, res) => {
    try {
        res.render('users/images', {title : "Images"});

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

// Create user after they sign up
router.post('/signup', async (req, res) => {
    try {
        //need to check if email already exists and redirect to log in page
        let email = req.body.userEmail;
        let password = req.body.userPassword;

        const newUser = await userData.createUser(email, password);

        const userId = newUser._id;

        res.redirect(`/users/onboarding/${userId}`);
    }
    catch(e){
        return res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

// Update user after they onboard
router.patch('/onboarding/:id', async (req, res) => {
    const requestBody = req.body;
    // console.log(requestBody);
    let updatedObject = {};
    try {
        req.params.movieId = checkId(req.params.id, "User Id");

        if (requestBody.firstName) {
            checkFirstName(requestBody.firstName);
        }
        if (requestBody.birthday) {
            checkBirthday(requestBody.birthday);
        }
        if (requestBody.gender) {
            checkGender(requestBody.gender);
        }
        if (requestBody.showGender) {
            requestBody.showGender = checkShowOnProfile(requestBody.showGender, "Show gender");
        }
        if (requestBody.pronouns) {
            checkPronouns(requestBody.pronouns);
        }
        if (requestBody.showPronouns) {
            requestBody.showPronouns = checkShowOnProfile(requestBody.showPronouns, "Show pronouns");
        }
        if (requestBody.about) {
            checkAbout(requestBody.about);
        }
        if (requestBody.interests) {
            checkInterests(requestBody.interests);
        }
        if (requestBody.location) {
            checkLocation(requestBody.location);
        }
        if (requestBody.filters) {
            checkFilters(requestBody.filters);
        }
    }
    catch (e) {
        return res.status(400).render('errors/error', {title : "Error", error : e.toString()});
    }
    try {
        const oldUser = await getUserById(req.params.id);
        if (requestBody.firstName && requestBody.firstName !== oldUser.firstName) {
            updatedObject.firstName = requestBody.firstName;
        }
        if (requestBody.birthday && requestBody.birthday !== oldUser.birthday) {
            updatedObject.birthday = requestBody.birthday;
        }
        if (requestBody.gender && requestBody.gender !== oldUser.gender) {
            updatedObject.gender = requestBody.gender;
        }

        if (requestBody.showGender && requestBody.showGender !== oldUser.showGender)  {
            updatedObject.showGender = requestBody.showGender;
        }

        if (requestBody.pronouns && requestBody.pronouns !== oldUser.pronouns) {
            updatedObject.pronouns = requestBody.pronouns;
        }
        if (requestBody.showPronouns && requestBody.showPronouns !== oldUser.showPronouns) {
            updatedObject.showPronouns = requestBody.showPronouns;
        }

        if (requestBody.about !== undefined && requestBody.about !== oldUser.about) {
            updatedObject.about = requestBody.about;
        }
        if (requestBody.interests && JSON.stringify(requestBody.interests) !== JSON.stringify(oldUser.interests)) {
            updatedObject.interests = requestBody.interests;
        }
        if (requestBody.location) {
            updatedObject.location = requestBody.location;
        }
        if (requestBody.filters && JSON.stringify(requestBody.filters) !== JSON.stringify(oldUser.filters)) {
            updatedObject.filters = requestBody.filters;
        }

    }
    catch (e) {
        return res.status(404).render('errors/error', {title : "User not Found", error : e.toString()});
    }
    // console.log(updatedObject);
    if (Object.keys(updatedObject).length !== 0) {
        try {
            const updatedUser = await updateUser(
                req.params.id,
                updatedObject
            );

            if (requestBody.firstName || requestBody.birthday || requestBody.gender ||
            requestBody.showPronouns || requestBody.pronouns || requestBody.showPronouns || requestBody.about || requestBody.interests) {
                res.redirect(`/users/onboarding/location/${updatedUser._id}`);
            }

        }
        catch (e) {
            return res.status(500).render('errors/error', {title : "Error", error : e.toString()});
        }
    }
    else {
        let errorMessage = "Error: 'No fields have been changed from their initial values, so no update has occurred";
        res.status(400).render('errors/error', {title : "Error", error: errorMessage});
    }

});


// router.get('/logout', async(req,res) =>{
//     req.session.destroy();
//     res.redirect('/');
// });

// // Post login
// router.post('/login', async (req, res) => {
//     // TODO...
// });



// // Get all users
// router.get('/', async (req, res) => {
//     try {
//         const userList = await userData.getAllUsers();
//
//         // res.render('users/allUserInfo', {title : "All Users", users : userList});
//     }
//     catch (e) {
//         res.status().render('error', {title : "Error", error : e.toString()});
//     }
// });

// Get single user
// router.get('/:userId', async (req, res) => {
//     try {
//         req.params.userId = helpers.checkId(req.params.userId, "Id URL Param");
//     }
//     catch (e) {
//         return res.status(400).render('error', {title : "Error", error : e.toString()});
//     }
//     try {
//         const user = await userData.getUserById(req.params.userId);
//         res.render('userFound', {title : "User Info", user : user});
//     }
//     catch (e) {
//         return res.status(404).render('userNotFound', {title : "Not Found", error : e.toString()});
//     }
// });

// Delete user
// router.delete('/:id', async (req, res) => {
//     try {
//         req.params.userId = helpers.checkId(req.params.userId, "Id URL Param");
//     }
//     catch (e) {
//         return res.status(400).render('error', {title : "Error", error : e.toString()});
//     }
//     try {
//         const user = await userData.getUserById(req.params.userId);
//         res.json(user);
//     }
//     catch (e) {
//         return res.status(404).render('userNotFound', {title : "Not Found", error : e.toString()});
//     }
//     try {
//         await userData.removeUser(req.params.userId);
//         res.status(200).json({"movieId": req.params.userId, "deleted": true});
//     }
//     catch (e) {
//         res.status(500).render('error', {title : "Error", error : e.toString()});
//     }
// });
//


module.exports = router;