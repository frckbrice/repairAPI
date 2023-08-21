const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

module.exports = {
  //@desc Get all user
  //@route Get /users
  //access Private
  getAllUsers: asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").lean();

    if (!users.length) {
      return res.status(400).json({ msg: "No users found" });
    }
    res.json(users);
  }),

  //@desc create new user
  //@route POST /users
  //access Private
  createUser: asyncHandler(async (req, res) => {
    let { username, password, roles } = req.body;

    // make role always an array
    if (!Array.isArray(roles) || typeof roles === "undefined") {
      roles = [roles];
    }

    if (!username || !password || !roles?.length) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //check duplicate user
    const duplicateUser = await User.findOne({ username }).lean().exec();
    if (duplicateUser) {
      return res.status(409).json({ message: `${username} already in use` });
    }
    // hash the password
    const hashPw = await bcrypt.hash(password, 10); //generate salt and encrypt
    const user = await User.create({
      username,
      password: hashPw,
      roles,
    });
    if (user) {
      res
        .status(201)
        .json({ msg: `the user ${username} has been created successfully` });
    } else {
      res.status(400).json({ msg: "Invalid credentials" });
    }
  }),

  //@desc get a user
  //@route GET /users
  //access Private
  getUser: asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID required" });
    }

    const [user, notes] = await Promise.all([
      User.findById(id).select("-password").exec(),
      Note.find({ user: id }, "usernames").exec(),
    ]);
    if (!user) {
      return res.status(400).json({ message: `user with id ${id} not found` });
    }

    if (notes.length > 0) {
      return res.json({
        msg: `This are the user and his assigned notes`,
        user,
        notes,
      });
    }
    ("User found ");
    ("User found ");

    res.json({ msg: "User found " });
  }),

  //@desc update a user
  //@route PATCH /users
  //access Private
  updateUser: asyncHandler(async (req, res) => {
    let { id, username, roles, active, password } = req.body;
    // make role always an array
    console.log(id, username, roles, active, password);
    if (!Array.isArray(roles) || typeof roles === "undefined") {
      roles = [roles];
    }
    console.log(Array.isArray(roles));
    //confirm data
    if (
      !username ||
      !roles.length ||
      typeof active !== "boolean"
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // first, check if the user exists
    const user = await User.findById(id).exec();
    if (!user) {
      return res.status(400).json({ message: "user doesn't exist" });
    }

    //find duplicate user
    const duplicateUser = await User.findOne({ username }).exec();
    
    if (duplicateUser && duplicateUser._id.toString() !== id.toString()) {
      console.log(duplicateUser.id);
      return res.status(409).json({ message: "Duplicate username" });
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    user.save();
    res.json({ msg: `user successfully updated` });
  }),

  //@desc delete a user
  //@route DELETE /users
  //access Private
  deleteUser: asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID required" });
    }

    //check if the user is assigned a note
    const note = await Note.find({ user: id }).lean().exec();
    console.log(note);
    if (note.length) {
      return res
        .status(400)
        .json({ message: `The user with id ${id} has been assigned notes` });
    }

    const user = await User.findById(id).exec();
    if (!user) {
      return res.status(400).json({ message: `user with id ${id} not found` });
    }

    const deletedUser = await user.deleteOne();
    if (deletedUser) {
      console.log(deletedUser);
      const reply = `username ${deletedUser.username} with id ${id} successfully deleted`;

      res.json(reply);
    }
  }),
};
