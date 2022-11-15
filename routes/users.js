const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const helpers = require("../helpers");



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
        res.render('users/location', {title : "Location"});

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
        let firstName = null;
        let birthday = null;
        let gender = null;
        let showGender = null;
        let pronouns = null;
        let showPronouns = null;
        let genderInterest = null;
        let location = {latitude: null, longitude: null, locality: null, principalSubdiv: null};
        let about = null;
        let images = {profilePic: null, otherPics: []};
        let interests = [];
        let matches = [];



        const newUser = await userData.createUser(
            email,
            password,
            firstName,
            birthday,
            gender,
            showGender,
            pronouns,
            showPronouns,
            genderInterest,
            location,
            about,
            images,
            interests,
            matches);

        const userId = newUser._id;

        res.redirect(`/users/onboarding/${userId}`);
    }
    catch(e){
        return res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

// Update user after they onboard
router.put('/onboarding/:id', async (req, res) => {
    try {
       
        // //need to get user ID from recently created user that has only email and password
        // //update that user with the information provided on onboarding page
        //
        // let firstName = req.body.firstName;
        // let birthday = req.body.birthday;
        // let gender = req.body.gender;
        // let showGender = req.body.showGender;
        // let genderInterest = req.body.genderInterest;
        // let aboutMe = req.body.about;
        // let profilePic = req.body.proPic;
        // let interests = req.body.interests;
        //
        // const updatedUser = await userData.updateUser(firstName);
        //
        //
        // res.json(updatedUser);
        res.redirect(`/users/onboarding/location/${req.params.id}`);

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
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