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
const {response} = require("express");

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
          res.render('users/onboarding', {title : "Create an Account", name: user.firstName, imgSrc: '../public/images/temp_pro_pics/user_pro_pic.png'});
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


// Create user after they sign up
/*router.post('/signup', async (req, res) => {
    try {
        let email = helpers.checkEmail(req.body.userEmail);
        let password = helpers.checkPassword(req.body.userPassword);
        let conPassword = helpers.checkPassword(req.body.conUserPassword);

        if(password !== conPassword){
            throw {errorMessage: "Error: your passwords do not match", status: 400}
        }

        const newUser = await userData.createUser(email, password);
        if(newUser != null){
            const userId = newUser._id;
            req.session.user = {email: email};
            res.redirect(`/users/onboarding`);
        }
        else{
            return res.status(500).render('errors/error', {title : "Error", error : e.toString()});
        } 
    }
    catch(e){
        return res.render('users/signup', {title : "Create an Account", error: e});
    }
});*/


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
        res.render('users/filters', {title : "Filters", name: user.firstName, imgSrc: '../../public/images/temp_pro_pics/user_pro_pic.png'});
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
        res.render('users/images', {title : "Images", name: user.firstName, imgSrc: '../../public/images/temp_pro_pics/user_pro_pic.png'});
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
                res.render('dashboard/dashboard', {title: "Dashboard", name: user.firstName, imgSrc: '../public/images/temp_pro_pics/user_pro_pic.png'});
            }
            catch (e) {
                return res.status(e.status).render('errors/error', {title: "Error", error: e.toString()});
            }
        }
        else{
            res.redirect("/");
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

router.post('/dashboard/match', async(req,res) =>{
    let userId;
    const requestBody = req.body;
    let user;
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
            res.redirect("/");
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
        let dateSpots = await getDateSpots(user.interests, requestBody.matchInterests,
            user.location.latitude, user.location.longitude, user.filters.maxDistance);

        console.log(dateSpots);
        res.send(dateSpots);
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

// get filters page
router.route('/filters')
.get(async (req, res) => {
    try {
        let user = await userData.getUserByEmail(req.session.user.email);
        let genderInterest = user.filters.genderInterest.charAt(0).toUpperCase() + user.filters.genderInterest.slice(1);
        res.render('users/updateFilters', {title : "Filters", genderInterest: genderInterest, minAge: user.filters.minAge,
                                            maxAge: user.filters.maxAge, maxDistance: user.filters.maxDistance});
    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
})
.patch(async (req, res) => {
    const requestBody = req.body;
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
        if (requestBody.filters) {
            requestBody.filters = checkFilters(requestBody.filters);
        }

        const oldUser = await getUserById(userId);

        if (requestBody.filters && JSON.stringify(requestBody.filters) !== JSON.stringify(oldUser.filters)) {
            updatedObject.filters = requestBody.filters;
        }

            // console.log(updatedObject);
        if (Object.keys(updatedObject).length !== 0) {
            const updatedUser = await updateUser(
                userId,
                updatedObject
            );

            res.send(updatedUser);
            
        } else {
            let errorMessage = "Error: 'No fields have been changed from their initial values, so no update has occurred";
            throw {errorMessage: errorMessage, status: 400};
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


// get and post login
/*router
  .route('/login')
  .get(async (req, res) => { 
    res.render('users/login', {title: "Login", header: "Login"});
  })
  .post(async (req, res) => {
    try{
        let email = helpers.checkEmail(req.body.userEmail);
        let password = helpers.checkPassword(req.body.userPassword);
        let response = await userData.checkUser(email, password);
        if(response.authenticatedUser === true){
          //req.session.user = {email: email}
          res.redirect("/dashboard");
        }
        else{
          return res.status(400).render("users/login", {title: "Login", error: e});
        }
      }
      catch(e){
        res.status(400).render("users/login", {title: "Login", error: e});
      }
  });*/




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