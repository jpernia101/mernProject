const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt') 

const getAllNotes = asyncHandler(async(req,res) => {
    const notes = Note.find().select().lean();
    if(!notes){
        return res.status(400).json({mssg: "No notes were found"});
    }

    res.json(notes);

});

const createNote = asyncHandler(async(req,res) => {
    const {user, title , text} =  req.body;

    if(!user || !title || !text){
        return res.status(400).json({mssg: "All fields are required"});
    }

    const duplicate = Note.findOne({title}).lean().exec();

    if(duplicate){
        return res.status(409).json({mssg : "Duplicate Title"});
    }

    const noteObj = {user, title, text};
    const note = await Note.create(noteObj);

    if(note){
        res.status(201).json({mssg: "Note was created"});
    }
    else{
        {
            res.status(201).json({mssg: "Could not create note"});
        }
    }


});

const updateNote = asyncHandler(async(req,res) => {
    const {id, user, title , text, completed} =  req.body;

    if(!id || !user || !title || !text || typeof(completed) != 'boolean'){
        res.status(400).json("All fields are required");
    }

    const note = await Note.findById(id);
    if(!note){
        res.status(400).json("No note found with that Id");
    }

    const duplicate = await Note.findOne({title}).lean().exec();

    //this allows us to check if we have duplicate title and also gives us the freedom to still change the title
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.title = title;
    note.text = text;
    note.user = user;
    note.completed = completed;

    const updatedNote = await note.save();

    res.json(`'${updatedNote.title}' updated`)

});

const deleteNote = asyncHandler(async(req,res) => {
    const {id} = req.body;
    if(!id){
        res.status(400).json({mssg: "No Id was passed"});
    }

    const note = await Note.findById(id).exec();
    if(!note){
        res.status(400).json({mssg: "No note was found with given Id"}); 
    }

    const deleteNote = await note.deleteOne();

    res.json(`Note ${deleteNote.title} with ID ${deleteNote._id} deleted`); 

});

module.exports = {createNote,deleteNote,getAllNotes,updateNote};