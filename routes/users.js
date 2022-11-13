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

// get onboarding page
router.get('/onboarding', async (req, res) => {
    try {
        res.render('users/onboarding', {title : "Create an Account"});

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

router.put('/onboarding', async (req, res) => {
    try {
       
        //need to get user ID from recently created user that has only email and password
        //update that user with the information provided on onboarding page

        /*console.log("here")
        let firstName = req.body.firstName;
        let birthday = req.body.bDay;
        let gender = req.body.gender;
        let showGender = req.body.showGender;
        let genderInterest = req.body.genderInterest;
        let aboutMe = req.body.about;
        let profilePic = req.body.proPic;
        let interests = req.body.interests;

        const updatedUser = await userData.updateUser(firstName)


        res.json(updatedUser);*/

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

router.post('/onboarding', async (req, res) => {
    try {
        //need to check if email already exists and redirect to log in page
        let firstName = null
        let email = req.body.userEmail;
        let password = req.body.userPassword;
        location = null
        dobDay = null
        dobMonth = null
        dobYear = null
        gender = null
        showGender = null
        sexualOrientation = null
        proPic = null
        otherPic1 = null
        otherPic2 = null
        otherPic3 = null
        about = null
        matches = null
        placeSubcategories = null
        eventSubcategories = null
        
        const newUser = await userData.createUser(firstName,
        email,
        password,
        location,
        dobDay,
        dobMonth,
        dobYear,
        gender,
        showGender,
        sexualOrientation,
        proPic,
        otherPic1,
        otherPic2,
        otherPic3,
        about,
        matches,
        placeSubcategories,
        eventSubcategories);

        res.render('users/onboarding', {title : "Create an Account"});
    }
    catch(e){
        return res.status(500).render('errors/error', {title : "Error", error : e.toString()});
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

// Update user after signup to have all onboarding/dating preference info
// router.put('/onboarding', async (req, res) => {
//     const userData = req.body;
//     let errors = [];
//
//     if(!userData.firstName){
//         errors.push('No first name provided.');
//     }
//     if(!userData.email){
//         errors.push('No email provided.');
//     }
//     if(!userData.location){
//         errors.push('No location provided.');
//     }
//     if(!userData.dobDay){
//         errors.push('No day provided.');
//     }
//     if(!userData.dobMonth){
//         errors.push('No month provided.');
//     }
//     if(!userData.dobYear){
//         errors.push('No year provided.');
//     }
//     if(!userData.gender){
//         errors.push('No gender provided.');
//     }
//     if(!userData.sexualOrientation){
//         errors.push('No orientation provided.');
//     }
//
//     if (errors.length > 0) {
//         res.render('onboarding', {errors: errors, hasErrors: true, userData : userData, title: "Create an Account"});
//         return;
//     }
//
//     try{
//         const {firstName,
//             email,
//             password,
//             location,
//             dobDay,
//             dobMonth,
//             dobYear,
//             gender,
//             showGender,
//             sexualOrientation,
//             proPic,
//             otherPic1,
//             otherPic2,
//             otherPic3,
//             about,
//             matches,
//             placeSubcategories,
//             eventSubcategories} = userData;
//         const newUser = await userData.createUser(firstName,
//             email,
//             password,
//             location,
//             dobDay,
//             dobMonth,
//             dobYear,
//             gender,
//             showGender,
//             sexualOrientation,
//             proPic,
//             otherPic1,
//             otherPic2,
//             otherPic3,
//             about,
//             matches,
//             placeSubcategories,
//             eventSubcategories);
//     }
//     catch (e) {
//         return res.status(500).render('error', {title : "Error", error : e.toString()});
//     }
//     try {
//         const userList = await userData.getAllUsers();
//         res.render('allUsers', {title : "All Users", users : userList});
//     }
//     catch (e) {
//         res.status().render('error', {title : "Error", error : e.toString()});
//     }
//
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
//
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
// router.put('/:id', async (req, res) => {
//     const updatedUserData = req.body;
//     try {
//         req.params.userId = helpers.checkId(req.params.userId, "Id URL Param");
//     }
//     catch (e) {
//         return res.status(400).render('error', {title : "Error", error : e.toString()});
//     }
//     try {
//         await userData.getUserById(req.params.userId);
//     }
//     catch (e) {
//         return res.status(404).render('userNotFound', {title : "Not Found", error : e.toString()});
//     }
//     try {
//         const updatedUser = await userData.updateUser(
//             req.params.userId,
//             updatedUserData.firstName,
//             updatedUserData.email,
//             updatedUserData.password,
//             updatedUserData.location,
//             updatedUserData.dobDay,
//             updatedUserData.dobMonth,
//             updatedUserData.dobYear,
//             updatedUserData.gender,
//             updatedUserData.showGender,
//             updatedUserData.sexualOrientation,
//             updatedUserData.proPic,
//             updatedUserData.otherPic1,
//             updatedUserData.otherPic2,
//             updatedUserData.otherPic3,
//             updatedUserData.about,
//             updatedUserData.matches,
//             updatedUserData.placeSubcategories,
//             updatedUserData.eventSubcategories
//         );
//         res.json(updatedUser);
//     }
//     catch (e) {
//         res.status(500).render('error', {title : "Error", error : e.toString()});
//     }
// });


    


module.exports = router;