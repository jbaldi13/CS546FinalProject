const express = require('express');
const axios = require('axios');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const helpers = require("../helpers");
const {checkId, checkFirstName, checkBirthday, checkInterests, checkGender, checkAbout, checkPronouns, checkShowOnProfile,
    checkLocation,
    checkFilters,
    checkImages,
    checkMatches
} = require("../helpers");
const {getUserById, updateUser, getUserByEmail} = require("../data/users");
const {response} = require("express");



// Get and post login page
router
  .route('/login')
  .get(async (req, res) => { 
    if(!req.session.user){
        res.render('users/login', {title: "Login", header: "Login"});
    }
    else{
        try{
            await userData.validateOtherUserData(req.session.user.email);
            res.redirect("/users/dashboard");
          }catch(e){
            if(e==="Error: General info for the user is invalid or undefined" ||
               e==="Error: Location is invalid or undefined" ||
               e==="Error: Filters for the user are invalid or undefined" ||
               e==="Error: Images for the user are invalid or undefined")
               {
                try{
                    id = await userData.getUserByEmail(req.session.user.email);
                    await userData.removeUser(id._id);
                    req.session.destroy();
                    res.render('users/login', {title: "Login", header: "Login"});
                }catch(e){
                    return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
                }
            }
            else{
                return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
            }
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
          return res.status(400).render("users/login", {title: "Login", error: e});
        }
      }
      catch(e){
        res.status(400).render("users/login", {title: "Login", error: e});
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
                if(e==="Error: General info for the user is invalid or undefined" ||
                   e==="Error: Location is invalid or undefined" ||
                   e==="Error: Filters for the user are invalid or undefined" ||
                   e==="Error: Images for the user are invalid or undefined")
                   {
                    try{
                        id = await userData.getUserByEmail(req.session.user.email);
                        await userData.removeUser(id._id);
                        req.session.destroy();
                        res.render('users/signup', {title: "Login", header: "Login"});
                    }catch(e){
                        return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
                    }
                }
                else{
                    return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
                }
              }
        }
    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
  })
  .post(async (req, res) => {
      try {
          let email = helpers.checkEmail(req.body.userEmail);
          let password = helpers.checkPassword(req.body.userPassword);
          let conPassword = helpers.checkPassword(req.body.conUserPassword);
  
          if(password !== conPassword){
              throw "Error: your passwords do not match";
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
  });

// get and patch main onboarding page
router
  .route('/onboarding')
  .get(async (req, res) => {
    try {
        res.render('users/onboarding', {title : "Create an Account"});

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }

  })
  .patch(async (req, res) => {
      const requestBody = req.body;
      // console.log(requestBody);
      let updatedObject = {};
      let userId = null;
      try{
        if(req.session.user){
            helpers.checkEmail(req.session.user.email);
        }
        else{
            return res.status(403).render('errors/error', {title: "Error", error: "Error: Unable to verify user identity."});
        }    
      }
      catch(e){
            return res.status(400).render('errors/error', {title: "Error", error: e.toString()});
      }
      try{
        userId = await getUserByEmail(req.session.user.email);
      }
      catch(e){
        return res.status(404).render('errors/error', {title: "Error", error: e.toString()});
      }
      userId = userId._id;
      try {

          userId = checkId(userId, 'User ID');
      }
      catch (e) {
          return res.status(400).render('errors/error', {title: "Error", error: e.toString()});
      }
      try {
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
              requestBody.interests = checkInterests(requestBody.interests);
          }
          if (requestBody.location) {
              checkLocation(requestBody.location);
          }
          if (requestBody.filters) {
              checkFilters(requestBody.filters);
          }
          if (requestBody.images) {
              checkImages(requestBody.images);
          }
          if (requestBody.matches) {
              checkMatches(requestBody.matches);
          }
      }
      catch (e) {
          return res.status(400).render('errors/error', {title: "Error", error: e.toString()});
      }
      try {
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
          if (requestBody.matches && JSON.stringify(requestBody.matches) !== JSON.stringify(oldUser.matches)) {
              updatedObject.matches = requestBody.matches;
          }
      }
      catch (e) {
          return res.status(404).render('errors/error', {title: "User not Found", error: e.toString()});
      }
      // console.log(updatedObject);
      if (Object.keys(updatedObject).length !== 0) {
          try {
              const updatedUser = await updateUser(
                  userId,
                  updatedObject
              );

              if (requestBody.firstName) {
                  res.redirect(`/users/onboarding/location`);
              }
              else {
                  res.send(updatedUser);
              }
          } catch (e) {
              return res.status(500).render('errors/error', {title: "Error", error: e.toString()});
          }
      } else {
          let errorMessage = "Error: 'No fields have been changed from their initial values, so no update has occurred";
          res.status(400).render('errors/error', {title: "Error", error: errorMessage});
      }
  });


// Create user after they sign up
router.post('/signup', async (req, res) => {
    try {
        let email = helpers.checkEmail(req.body.userEmail);
        let password = helpers.checkPassword(req.body.userPassword);
        let conPassword = helpers.checkPassword(req.body.conUserPassword);

        if(password !== conPassword){
            throw "Error: your passwords do not match";
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
        res.render('users/filters', {title : "Filters"});

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

// get onboarding/images page
router.get('/onboarding/images', async (req, res) => {
    try {
        res.render('users/images', {title : "Images"});

    }
    catch(e){
        res.status(500).render('errors/error', {title : "Error", error : e.toString()});
    }
});

router.get('/dashboard', async(req,res) =>{
    if(req.session.user){
        res.render('dashboard/dashboard', {title: "Dashboard"});
    }
    else{
        res.redirect("/");
    }
});

// get logout page
router.get('/logout', async(req,res) =>{
    if(req.session.user){
        let user = req.session.user.email;
        req.session.destroy();
        // res.render('users/loggedOut', {title: "Logged Out", user: user});
        res.redirect('/');
    }
    else{
        res.redirect("/");
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

// Get single user
router.get('/user', async (req, res) => {
    let userId = null;
    try{
        if(req.session.user){
            helpers.checkEmail(req.session.user.email);
        }
        else{
            return res.status(403).render('errors/error', {title: "Error", error: "Error: Unable to verify user identity."});
        }    
    }
    catch(e){
        return res.status(400).render('errors/error', {title: "Error", error: e.toString()});
    }
    try{
        userId = await getUserByEmail(req.session.user.email);
    }
    catch(e){
        return res.status(404).render('errors/error', {title: "Error", error: e.toString()});
    }
    userId = userId._id;
    try {
        userId = helpers.checkId(userId, "User ID");
    }
    catch (e) {
        return res.status(400).render('errors/error', {title : "Error", error : e.toString()});
    }
    try {
        const user = await userData.getUserById(userId);
        // res.render('users/userInfo', {title : "User Info", user : user});
        res.json(user);
    }
    catch (e) {
        return res.status(404).render('errors/userNotFound', {title : "Not Found", error : e.toString()});
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
            return res.status(403).render('errors/error', {title: "Error", error: "Error: Unable to verify user identity."});
        }    
    }
    catch (e) {
        return res.status(404).render('errors/userNotFound', {title : "Not Found", error : e.toString()});
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