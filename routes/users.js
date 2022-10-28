const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.users;
const {createUser} = require("../data/users");
const {checkId} = require("../helpers");

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
            const newUser = await createUser(password,
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
            res.json(newUser);
        }
        catch (e) {
            res.status(500).json({error: e.toString()});
        }
    })
    .get(async (req, res) => {
        try {
            const userList = await usersData.getAllUsers();

            res.json(userList);
        }
        catch (e) {
            res.status(500).json({error: e.toString()});
        }

    });
router
    .route('/:userId')
    .get(async (req, res) => {
        try {
            req.params.userId = checkId(req.params.userId, "Id URL Param");
        }
        catch (e) {
            return res.status(400).json({error: e.toString()});
        }
        try {
            const user = await usersData.getUserById(req.params.userId);
            res.json(user);
        }
        catch (e) {
            return res.status(404).json({error: e.toString()});
        }
    })
    .delete(async (req, res) => {
        try {
            req.params.userId = checkId(req.params.userId, "Id URL Param");
        }
        catch (e) {
            return res.status(400).json({error: e.toString()});
        }
        try {
            const user = await usersData.getUserById(req.params.userId);
            res.json(user);
        }
        catch (e) {
            return res.status(404).json({error: e.toString()});
        }
        try {
            await usersData.removeUser(req.params.userId);
            res.status(200).json({"movieId": req.params.userId, "deleted": true});
        }
        catch (e) {
            res.status(500).json(e);
        }
    })
    .put(async (req, res) => {
        const updatedUserData = req.body;
        try {
            req.params.userId = checkId(req.params.userId, "Id URL Param");
        }
        catch (e) {
            return res.status(400).json({error: e.toString()});
        }
        try {
            await usersData.getUserById(req.params.userId);
        }
        catch (e) {
            return res.status(404).json({error: e.toString()});
        }
        try {
            const updatedUser = await usersData.updateUser(
                req.params.userId,
                updatedUserData.password,
                updatedUserData.firstName,
                updatedUserData.location,
                updatedUserData.dobDay,
                updatedUserData.dobMonth,
                updatedUserData.dobYear,
                updatedUserData.showGender,
                updatedUserData.gender,
                updatedUserData.sexualOrientation,
                updatedUserData.email,
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
            res.status(500).json({error: e.toString()});
        }
    });



module.exports = router;