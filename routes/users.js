const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const helpers = require("../helpers");
const axios = require("axios");
const {checkId, checkFirstName, checkBirthday, checkInterests, checkGender, checkAbout, checkPronouns, checkShowOnProfile,
    checkLocation,
    checkFilters,
    checkImages,
    checkMatches,
    checkUsersSeen
} = require("../helpers");
const {getUserById, updateUser, getUserByEmail, getDateSpots} = require("../data/users");
const {Storage} = require("@google-cloud/storage");
const Multer = require("multer");
const mongodb = require('mongodb');
const fs = require('fs');
const db = require('../config/mongoConnection');
const {GridFSBucket} = require("mongodb");
// Get and post login page
router
  .route('/login')
  .get(async (req, res) => {
    try{
        if(!req.session.user){
            res.render('users/login', {title: "Login", header: "Login"});
        }
        else{
            try{
                await userData.validateOtherUserData(req.session.user.email);
                res.redirect("/users/dashboard");
            }catch(e){
                let user = await userData.getUserByEmail(req.session.user.email);
                await userData.removeUser(user._id);
                req.session.destroy();
                return res.render('users/login', {title: "Login", header: "Login"});
            }
        }
    }catch(e){
        if(e.status === 404 && e.errorMessage){
            return res.status(404).render('errors/userNotFound', {title: "User not Found", error: e.errorMessage});
        }
        else if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }
    }
  })
  .post(async (req, res) => {
    try{
        //shouldnt do input error checking on log in for security reasons
        //let email = helpers.checkEmail(req.body.userEmail)
        //let password = helpers.checkPassword(req.body.userPassword)

        let email = req.body.userEmail.toLowerCase();
        let password = req.body.userPassword;
        let response = await userData.checkUser(email, password);
        if(response.authenticatedUser === true){
          req.session.user = {email: email};
          console.log(req.session.user);
          res.redirect("/users/dashboard");
        }
        else{
          //User is not authenticated, but checkUser didn't error so it's not because of bad input
          throw {errorMessage: "Error: Internal Server Error", status: 500};
        }
      }
      catch(e){
        if(e.status === 400 && e.errorMessage){
            return res.status(400).render('users/login', {title: "Login", error: e.errorMessage});
        }
        else if(e.status === 404 && e.errorMessage){
            return res.status(404).render('errors/userNotFound', {title: "User not Found", error: e.errorMessage});
        }
        else if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }
      }
  });

// Get and post signup page
router
  .route('/signup')
  .get(async (req, res) => {
    try {
        if(!req.session.user){
            res.render('users/signup', {title : "Create an Account"});
        }
        else{
            try{
                await userData.validateOtherUserData(req.session.user.email);
                res.redirect("/users/dashboard");
              }catch(e){
                id = await userData.getUserByEmail(req.session.user.email);
                await userData.removeUser(id._id);
                req.session.destroy();
                return res.render('users/signup', {title : "Create an Account"});
              }
        }
    }
    catch(e){
        if(e.status === 404 && e.errorMessage){
            return res.status(404).render('errors/userNotFound', {title: "User not Found", error: e.errorMessage});
        }
        else if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }      }
  })
  .post(async (req, res) => {
      try {
          let email = helpers.checkEmail(req.body.userEmail);
          let password = helpers.checkPassword(req.body.userPassword);
          let conPassword = helpers.checkPassword(req.body.conUserPassword);

          if(password !== conPassword){
              throw {errorMessage: "Error: your passwords do not match", status: 400};
          }

          const newUser = await userData.createUser(email, password);
          if(newUser != null){
              const userId = newUser._id;
              req.session.user = {email: email};
              res.redirect(`/users/onboarding`);
          }
          else{
              throw {errorMessage: "Error: Internal Server Error", status: 500};
          }
      }
      catch(e){
        if(e.status === 400 && e.errorMessage){
            return res.status(400).render('users/signup', {title: "Create an Account", error: e.errorMessage});
        }
        else if(e.status === 404 && e.errorMessage){
            return res.status(404).render('errors/userNotFound', {title: "User not Found", error: e.errorMessage});
        }
        else if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }
      }
  });

// get and patch main onboarding page
router
  .route('/onboarding')
  .get(async (req, res) => {
      try {
          let user = await userData.getUserByEmail(req.session.user.email);
          res.render('users/onboarding', {title : "Create an Account", name: user.firstName, userProPic: user.images.profilePic});
      }
      catch (e) {
          if(e.status === 404 && e.errorMessage){
              return res.status(404).render('errors/userNotFound', {title: "User not Found", error: e.errorMessage});
          }
          else if(e.status && e.errorMessage){
              return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
          }
          else{
              return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
          }
      }
  })
  .patch(async (req, res) => {
      const requestBody = req.body;
      // console.log(requestBody);
      let updatedObject = {};
      let userId = null;
      try{
        if(req.session.user){
            userId = helpers.checkEmail(req.session.user.email);
        }
        else{
            throw {errorMessage: "Error: Unable to verify user identity", status: 403};
        }
        userId = await getUserByEmail(userId);
        userId = userId._id;
        userId = checkId(userId, 'User ID');
        if (requestBody.firstName) {
            requestBody.firstName = checkFirstName(requestBody.firstName);
        }
        if (requestBody.birthday) {
            requestBody.birthday = checkBirthday(requestBody.birthday);
        }
        if (requestBody.gender) {
            requestBody.gender = checkGender(requestBody.gender);
        }
        if (requestBody.showGender) {
            requestBody.showGender = checkShowOnProfile(requestBody.showGender, "Show gender");
        }
        if (requestBody.pronouns) {
            requestBody.pronouns = checkPronouns(requestBody.pronouns);
        }
        if (requestBody.showPronouns) {
            requestBody.showPronouns = checkShowOnProfile(requestBody.showPronouns, "Show pronouns");
        }
        if (requestBody.about) {
            requestBody.about = checkAbout(requestBody.about);
        }
        if (requestBody.interests) {
            requestBody.interests = checkInterests(requestBody.interests);
        }
        if (requestBody.location) {
            requestBody.location = checkLocation(requestBody.location);
        }
        if (requestBody.filters) {
            requestBody.filters = checkFilters(requestBody.filters);
        }
        if (requestBody.images) {
            requestBody.images = checkImages(requestBody.images);
        }
        if (requestBody.userMatches) { //if userMatches in req body, then the req body also contains the following
            checkMatches(requestBody.userMatches);
            checkMatches(requestBody.currCompatUserMatches);
            requestBody.currCompatUserId = checkId(requestBody.currCompatUserId, 'currCompatUserId');
            checkUsersSeen(requestBody.usersSeen);
        }
        const oldUser = await getUserById(userId);
        if (requestBody.firstName && requestBody.firstName !== oldUser.firstName) {
            updatedObject.firstName = requestBody.firstName;
        }
        if (requestBody.birthday && requestBody.birthday !== oldUser.birthday) {
            updatedObject.birthday = requestBody.birthday;
        }
        if (requestBody.gender && requestBody.gender !== oldUser.gender) {
            updatedObject.gender = requestBody.gender;
        }

        if (requestBody.showGender && requestBody.showGender !== oldUser.showGender) {
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
        if (requestBody.images && JSON.stringify(requestBody.images) !== JSON.stringify(oldUser.images)) {
            updatedObject.images = requestBody.images;
        }
        if (requestBody.userMatches && JSON.stringify(requestBody.userMatches) !== JSON.stringify(oldUser.matches)) {
            updatedObject.matches = requestBody.userMatches;
        }
        if (requestBody.usersSeen && JSON.stringify(requestBody.usersSeen) !== JSON.stringify(oldUser.usersSeen)) {
            updatedObject.usersSeen = requestBody.usersSeen;
        }

        // console.log(updatedObject);
        if (Object.keys(updatedObject).length !== 0) {
            const updatedUser = await updateUser(
                userId,
                updatedObject
            );
            if (requestBody.userMatches) {
                const updatedMatchUser = await updateUser( // update match for other user as well
                    requestBody.currCompatUserId,
                    {matches: requestBody.currCompatUserMatches}
                );
            }
            res.send(updatedUser);
        }
        else {
            res.send('');
        }

      }
      catch(e){
            if(e.status === 404 && e.errorMessage){
                return res.status(404).render('errors/userNotFound', {title: "User not Found", error: e.errorMessage});
            }
            else if(e.status && e.errorMessage){
                return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
            }
            else{
                return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
            }
      }
  });



// get onboarding/location page
router.get('/onboarding/location', async (req, res) => {
    try {
        res.render('users/location', {title : "Location"});

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

// get onboarding/filters page
router.get('/onboarding/filters', async (req, res) => {
    try {
        let user = await userData.getUserByEmail(req.session.user.email);
        res.render('users/filters', {title : "Filters", name: user.firstName, userProPic: user.images.profilePic});
    }
    catch (e) {
        if(e.status === 404 && e.errorMessage){
            return res.status(404).render('errors/userNotFound', {title: "User not Found", error: e.errorMessage});
        }
        else if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }
    }
});

// get onboarding/images page
router.get('/onboarding/images', async (req, res) => {
    try {
        let user = await userData.getUserByEmail(req.session.user.email);
        res.render('users/images', {title : "Images", name: user.firstName, userProPic: user.images.profilePic});
    }
    catch (e) {
        if(e.status === 404 && e.errorMessage){
            return res.status(404).render('errors/userNotFound', {title: "User not Found", error: e.errorMessage});
        }
        else if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }
    }
});

let projectId = 'datespot-370921';
let keyFileName = 'myKey.json';

const storage = new Storage({
    projectId,
    keyFileName
});
const multer =  Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no files larger than 5mb (changeable)
    }
});

const bucket = storage.bucket('datespot_image_storage');
router.post('/onboarding/images', multer.array('images'),  async (req, res) => {
    // console.log(req.files);
    try {
        if (req.files) {
            console.log('Files found; trying to upload');
            // Get the uploaded files from the request body
            const files = req.files;

            // Create an array to hold the promises for each file upload
            const uploadPromises = [];

            // Loop through the uploaded files
            for (const file of files) {
                // Create a new Storage bucket file object
                const blob = bucket.file(file.originalname);

                // Create a promise for uploading the file to the bucket
                const uploadPromise = new Promise((resolve, reject) => {
                    // Create a write stream for the file
                    const blobStream = blob.createWriteStream();

                    // When the write stream finishes, resolve the promise
                    blobStream.on('finish', () => {
                        console.log(`Successfully uploaded ${file.originalname}`);
                        resolve();
                    });

                    // If there is an error, reject the promise
                    blobStream.on('error', err => {
                        reject(err);
                    });

                    // Start uploading the file to the bucket
                    blobStream.end(file.buffer);
                });

                // Add the promise to the array of promises
                uploadPromises.push(uploadPromise);
            }

            // Wait for all the files to finish uploading
            await Promise.all(uploadPromises);
            console.log('Successfully uploaded all files');

            // Send a GET request to get the images from Google Cloud
            const results = await bucket.getFiles();

            // Get the list of files from the results
            const getFiles = results[0];

            // Create an array to hold the URLs of the images
            const imageObjects = [];

            // Loop through the files in the bucket
            for (const file of getFiles) {
                console.log(file.name);

                // Add the URL to the array of image URLs
                imageObjects.push(file);
            }

            // Send the array of image URLs as the response
            res.send(imageObjects);
        }
    }
    catch (e) {
        console.log(e.toString());
    }
});


router.get('/dashboard', async(req,res) =>{
    try{
        if(req.session.user){
            try{
                await userData.validateOtherUserData(req.session.user.email);
            }
            catch(e){
                let id = await userData.getUserByEmail(req.session.user.email);
                await userData.removeUser(id._id);
                req.session.destroy();
                return res.redirect("/");
            }
            try {
                let user = await userData.getUserByEmail(req.session.user.email);
                res.render('dashboard/dashboard', {title: "Dashboard", name: user.firstName, userProPic: user.images.profilePic});
            }
            catch (e) {
                return res.status(e.status).render('errors/error', {title: "Error", error: e.toString()});
            }
        }
        else{
            return res.redirect("/");
        }
    }catch(e){
        if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }
    }
});

// match page
router.get('/dashboard/:id', async(req,res) =>{
    let userId;
    let matchId;
    let user;
    let match;
    try{
        if(req.session.user){
            try{
                await userData.validateOtherUserData(req.session.user.email);
            }catch(e){
                let user = await userData.getUserByEmail(req.session.user.email);
                await userData.removeUser(user._id);
                req.session.destroy();
                return res.redirect("/");
            }
        }
        else{
            return res.redirect("/");
        }
    }catch(e){
        if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }
    }
    try {
        userId = await getUserByEmail(req.session.user.email);
        userId = userId._id;
        userId = checkId(userId, 'User ID');
        user = await getUserById(userId);

        matchId = checkId(req.params.id, 'Match ID');
        match = await getUserById(matchId);

        let dateSpots = await getDateSpots(user.interests, match.interests,
            user.location.latitude, user.location.longitude, user.filters.maxDistance);


        res.render('dashboard/match', {
            match: match, name: user.firstName,
            userProPic: user.images.profilePic,
            dateSpots: dateSpots});
    }
    catch (e) {
        console.log(e);
    }
});

// get logout page
router.get('/logout', async(req,res) =>{
    try{
        if(req.session.user){
            let user = req.session.user.email;
            req.session.destroy();
            // res.render('users/loggedOut', {title: "Logged Out", user: user});
            res.redirect('/');
        }
        else{
            res.redirect("/");
        }
    }catch(e){
        return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
    }
});


// Get signed-in user
router.get('/user', async (req, res) => {
    try{
        let userId = null;
        if(req.session.user){
            helpers.checkEmail(req.session.user.email);
        }
        else{
            throw {errorMessage: "Error: Unable to verify user identity.", status: 403};
        }
        userId = await getUserByEmail(req.session.user.email);
        userId = userId._id;
        userId = helpers.checkId(userId, "User ID");
        const user = await userData.getUserById(userId);
        // res.render('users/userInfo', {title : "User Info", user : user});
        res.send(user);
    }catch(e){
        if(e.status === 404 && e.errorMessage){
            return res.status(404).render('errors/userNotFound', {title: "Not Found", error: e.errorMessage});
        }
        else if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }
    }
});

// Get user by ID
router.get('/user/:id', async (req, res) => {
    try {
        if(req.session.user){
            const compatibleUserId = checkId(req.params.id, 'Compatible User Id');
            const compatibleUser = await getUserById(compatibleUserId);
            res.send(compatibleUser);
        }
        else{
            throw {errorMessage: "Error: Unable to verify user identity.", status: 403};
        }
    }
    catch (e) {
        if(e.status === 404 && e.errorMessage){
            return res.status(404).render('errors/userNotFound', {title: "Not Found", error: e.errorMessage});
        }
        else if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }
    }
});

router.get('/compatibleUsers', async (req, res) => {
    try {
        if(req.session.user){
            const user = await userData.getUserByEmail(req.session.user.email);
            const compatibleUsers = await userData.getAllCompatibleUsers(user);
            res.json(compatibleUsers);
        }
        else{
            throw {errorMessage: "Error: Unable to verify user identity.", status: 403};
        }    
    }
    catch (e) {
        if(e.status === 404 && e.errorMessage){
            return res.status(404).render('errors/userNotFound', {title: "Not Found", error: e.errorMessage});
        }
        else if(e.status && e.errorMessage){
            return res.status(e.status).render('errors/error', {title: "Error", error: e.errorMessage});
        }
        else{
            return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
        }
    }
});


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