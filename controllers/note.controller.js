const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");

module.exports = {
  //desc get all notes
  //route GET /notes
  //access Private
  getAllNotes: asyncHandler(async (req, res) => {
    // const notes = await Note.find().populate("user").select('-password').exec();
    // console.log(notes);
    // if (!notes?.length) {
    //   return res.status(400).json({ msg: "No notes found" });
    // }
    // res.json(notes);

    //We may have decided to add only username instead of all the information about the note's user.
    // Get all notes from MongoDB
    const notes = await Note.find().lean();

    // If no notes
    if (!notes?.length) {
      return res.status(400).json({ message: "No notes found" });
    }
    const notesWithUser = await Promise.all(
      notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec();
        return { ...note, username: user.username };
      })
    );

    res.json(notesWithUser);
  }),

  //desc create a note
  //route POST /notes
  //access Private
  createNote: asyncHandler(async (req, res) => {
    const { user, title, text } = req.body;

    if (!user || !title | !text) {
      return res.status(400).json({ msg: "All the fields are required" });
    }

    //check duplicates note's title
    const duplicates = await Note.findOne({ title })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicates) {
      return res.status(409).json({ msg: "Duplicate note title" });
    }
    console.log("after seond log");
    const note = new Note({
      user,
      title,
      text,
    });
    const nte = await note.save();
  
    if (nte) {
      res.status(201).json({ msg: `Note created successfully` });
    } else {
      res.status(400).json({ msg: "Invalid credentials received" });
    }
  }),

  //desc GET a note
  //route GET /notes
  //access Private
  getNote: asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ msg: "Id required" });
    }

    const note = await Note.findById(id).populate("user").exec();

    if (note) {
      res.status(201).json({ msg: `Note found successfully`, note });
    } else {
      res.status(400).json({ msg: "Invalid Id" });
    }
  }),

  //desc update a note
  //route PUT /notes
  //access Private
  updateNote: asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body;

    if (!id || !user || !title || !text || typeof completed !== "boolean") {
      return res
        .status(400)
        .json({ msg: "Bad credentials or all fields are not filed" });
    }

    const note = await Note.findById(id).exec();
    if (!note) {
      return res.status(404).json({ msg: "Note not found" });
    }

    // check for duplicates note titles
    const duplicate = await Note.findOne({ title })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    console.log("duplicate", duplicate);
    if (duplicate && duplicate?._id.toString() !== id.toString()) {
      console.log(duplicate);
      return res.status(409).json({ msg: "Duplicate note title" });
    }

    note.user = user;
    note.title = title;
    note.text = text;
    note.complete = completed;

    const updateNote = await note.save();

    res.json({ msg: `note ${updateNote.title} successfully updated` });
  }),

  //@desc delete a note
  //@route DELETE /notes
  //access Private
  deleteNote: asyncHandler(async (req, res) => {
    let { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID required" });
    }

    const note = await Note.findById(id).exec();
    if (!note) {
      return res.status(400).json({ message: `note with id ${id} not found` });
    }

    const deletedNote = await note.deleteOne();
    if (deletedNote) {
      console.log("deleted Note", deletedNote);
      const reply = `note ${deletedNote.title} with id ${deletedNote._id} successfully deleted`;

      res.json(reply);
    }
  }),

  //@desc delete a ll notes
  //@route DELETE /notes
  //access Private 64e004cb59a3aecd873d481c
  //* not yet implemented in frontend
  deleteAllNotesConditionally: asyncHandler(async (req, res) => {
    let { decision, role } = req.body;

    if (!Array.isArray(role) || typeof role === "undefined") {
      role = [role];
    }

    if (typeof decision !== "boolean" || !role.length) {
      return res.status(400).json({
        message: `Please Choose YES or NO and only the manager can take this decision`,
      });
    }

    if (disision === "yes" && role[0] === "manager") {
      const deletedObject = await Note.deleteMany();
      return res.status(200).json({
        message: "the note have been deleted successfully",
        deletedObject,
      });
    } else {
      // check if the is assigned to users
      const notes = await Note.find().populate("user").exec();

      if (!notes) {
        return res.status(201).json({ message: `No notes exist` });
      }

      if (notes.user.length) {
        return res
          .status(200)
          .json({ message: `These notes are assigned to users` });
      }
    }
  }),
};
