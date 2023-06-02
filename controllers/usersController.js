const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt') //used to encrypt passwords

//@desc Get all users
//@route Get /users
//@access Private

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean(); // the '-password' means to return everything expect the password field
    if(!users?.length){
        return res.status(400).json({mssg: 'No users found'});
    }
    res.json(users); 
})
 
//@desc Create new user
//@route POST /users
//@access Private

const createNewUser = asyncHandler(async (req, res) => {
    const {username , password , roles} = req.body;

    if (!username || !password || !Array.isArray(roles) || !roles.length) {
      return res.status(400).json({ mssg: "All fields are required" });
    }
    //checking to see if a user already uses that username 
    const duplicate = await User.findOne({username}).lean().exec();
    if(duplicate){
        return res.status(409).json({mssg : "Duplicate Username"});
    }

    //hash password 
    const hashPassword = await bcrypt.hash(password, 10) //the 10 is for 10 salt round, not sure what a salt round is

    const userObject = {username , password : hashPassword, roles};
    const user = await User.create(userObject);

    if(user){
        res.status(201).json({mssg : `user ${username} was created `});
    }
    else{
        res.status(400).json({mssg : "invalid user data received"});
    }

})

//@desc update a user
//@route PATCH /users
//@access Private

const updateUser = asyncHandler(async (req, res) => {
    const {id, username , password , roles , active} = req.body;

    if(!username  || !Array.isArray(roles) || !roles.length || !id || typeof(active) !== 'boolean'){
        return res.status(400).json({mssg : "All fields are required"});
    }
    const user = await User.findById(id).exec()//no lean this time because we need access to save & update methods

    if(!user){
        return res.status(400).json({mssg : "No user found"});
    }

    const duplicate = await User.findOne({username}).lean().exec();
    if(duplicate && duplicate?._id.toString() !== id){ //duplicate?._id.toString() !== id just makes sure that we are working with user we want to update
        return res.status(409).json({mssg : "Duplicate Username"});
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if(password){
         user.password = await bcrypt.hash(password, 10) 
    }

    const updatedUser = user.save();
    res.status(200).json({mssg : `updated ${updatedUser.username}`});

})

//@desc delete a user
//@route DELETE /users
//@access Private

const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.body;

    if(!id){
        return res.status(400).json({mssg : "Id required"});
    }
    //dont want to delete user if they have assigned notes
    const note = await Note.findOne({id}).lean().exec();
    if(note){
        return res.status(400).json({mssg : "User has assigned notes"});
    }

    const user = await User.findById(id).exec();
    if(!user){
        return res.status(400).json({mssg : "No user found"});
    }

    const result = await user.deleteOne();

    res.json(`Username ${result.username} with ID ${result._id} deleted`); 


    
})

module.exports = {deleteUser, getAllUsers, createNewUser, updateUser};