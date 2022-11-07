const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.users;
const helpers = require("../helpers");
const path = require("path");

router.route("/").get(async (req, res) => {
    //code here for GET
    res.sendFile(path.resolve('static/homepage.html'));
});

router
    .route('/users')
    .post(async (req, res) => {
        const userData = req.body;
        let errors = []
        
        if(!userData.firstName){
            errors.push('No first name provided.')
        }
        if(!userData.email){
            errors.push('No email provided.')
        }
        if(!userData.location){
            errors.push('No location provided.')
        }
        if(!userData.dobDay){
            errors.push('No day provided.')
        }
        if(!userData.dobMonth){
            errors.push('No month provided.')
        }
        if(!userData.dobYear){
            errors.push('No year provided.')
        }
        if(!userData.gender){
            errors.push('No gender provided.')
        }
        if(!userData.sexualOrientation){
            errors.push('No orientation provided.')
        }
        
        if (errors.length > 0) {
            res.render('onboarding', {errors: errors, hasErrors: true, userData : userData, title: "Create an Account"})
            return;
        }
         
    
        
        try{
            const {firstName,
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
                eventSubcategories} = userData;
            const newUser = await usersData.createUser(firstName,
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
        }
        catch (e) {
            return res.status(500).render('error', {title : "Error", error : e.toString()});
        }
        try {
            const userList = await usersData.getAllUsers();
            res.render('allUsers', {title : "All Users", users : userList});
        }
        catch (e) {
            res.status(500).render('error', {title : "Error", error : e.toString()});
        }

    })
    .get(async (req, res) => {
        try {
            const userList = await usersData.getAllUsers();

            res.render('allUsers', {title : "All Users", users : userList});
        }
        catch (e) {
            res.status(500).render('error', {title : "Error", error : e.toString()});
        }

    });
router
    .route('/users/:userId')
    .get(async (req, res) => {
        try {
            req.params.userId = helpers.checkId(req.params.userId, "Id URL Param");
        }
        catch (e) {
            return res.status(400).render('error', {title : "Error", error : e.toString()});
        }
        try {
            const user = await usersData.getUserById(req.params.userId);
            res.render('userFound', {title : "User Info", user : user});
        }
        catch (e) {
            return res.status(404).render('userNotFound', {title : "Not Found", error : e.toString()});
        }
    })
    .delete(async (req, res) => {
        try {
            req.params.userId = helpers.checkId(req.params.userId, "Id URL Param");
        }
        catch (e) {
            return res.status(400).render('error', {title : "Error", error : e.toString()});
        }
        try {
            const user = await usersData.getUserById(req.params.userId);
            res.json(user);
        }
        catch (e) {
            return res.status(404).render('userNotFound', {title : "Not Found", error : e.toString()});
        }
        try {
            await usersData.removeUser(req.params.userId);
            res.status(200).json({"movieId": req.params.userId, "deleted": true});
        }
        catch (e) {
            res.status(500).render('error', {title : "Error", error : e.toString()});
        }
    })
    .put(async (req, res) => {
        const updatedUserData = req.body;
        try {
            req.params.userId = helpers.checkId(req.params.userId, "Id URL Param");
        }
        catch (e) {
            return res.status(400).render('error', {title : "Error", error : e.toString()});
        }
        try {
            await usersData.getUserById(req.params.userId);
        }
        catch (e) {
            return res.status(404).render('userNotFound', {title : "Not Found", error : e.toString()});
        }
        try {
            const updatedUser = await usersData.updateUser(
                req.params.userId,
                updatedUserData.firstName,
                updatedUserData.email,
                updatedUserData.password,
                updatedUserData.location,
                updatedUserData.dobDay,
                updatedUserData.dobMonth,
                updatedUserData.dobYear,
                updatedUserData.gender,
                updatedUserData.showGender,
                updatedUserData.sexualOrientation,
                updatedUserData.proPic,
                updatedUserData.otherPic1,
                updatedUserData.otherPic2,
                updatedUserData.otherPic3,
                updatedUserData.about,
                updatedUserData.matches,
                updatedUserData.placeSubcategories,
                updatedUserData.eventSubcategories
            );
            res.json(updatedUser);
        }
        catch (e) {
            res.status(500).render('error', {title : "Error", error : e.toString()});
        }
    });
    
router
    .route('/onboarding')
    .get(async (req, res) => {
        try {
            res.render('onboarding', {title : "Create an Account"});
        }
        catch(e){
            res.status(500).render('error', {title : "Error", error : e.toString()});
        }
    });
    


module.exports = router;