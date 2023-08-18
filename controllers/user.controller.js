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

    if (!users) {
      return res.status(400).json({ msg: "No users found" });
    }
    res.json(users);
  }),

  //@desc create new user
  //@route POST /users
  //access Private
  createUser: asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;

    if (!username || !password || !roles.length) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //check duplicate
    const duplicateUser = await User.findOne({ username }).lean().exec();
    if (duplicateUser) {
      return res.status(409).json({ message: "username already taken" });
    }
    // hash the password
    const hashPw = await bcrypt.hash(password, 10);
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

  //@desc update a user
  //@route PATCH /users
  //access Private
  updateUser: asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body;

    //confirm data
    if (
      !username ||
      !password ||
      !Array.isArray(roles) ||
      typeof active !== "boolean"
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(id).exec();
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    //find duplicate user
    const duplicateUser = await User.findOne({ username }).lean().exec();
    if (duplicateUser && duplicateUser?._id.toSting() !== id) {
      return res.status(409).json({ message: "Duplicate username" });
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.sava();
    res.json({ msg: `user successfully updated` });
  }),

  //@desc delete a user
  //@route DELETE /users
  //access Private
  deleteUser: asyncHandler(async (req, res) => {
    const {id} = req.body;

    if(!id) {
      return res.status(400).json({message:"User ID required"})
    }

    //check if the user is assigned a note
    const note = await Note.findOne({user: id}).lean().exec();
    if(note?.length) {
      return res.status(400).json({message:'Note already assigned to that user'})
    }

    const user = await User.findById(id).exec();
    if(!user) {
      return res.status(400).json({message:'user not found'})
    }

    const deletedUser = user.deleteOne();

    const reply = `username ${deletedUser.username} with id ${id} deleted`

    res.json(reply);

  }),
};
