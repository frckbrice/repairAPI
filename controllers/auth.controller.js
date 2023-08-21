const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

module.exports = {
  //@desc Login
  //@route POST /auth
  //@access Public
  login: asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const foundUser = await User.findOne({ username }).exec();

    if (!foundUser || !foundUser.active) {
      return res.status(401).json({ msg: "Not found or non active! Unauthorized" });
    }
    
    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      return res.status(401).json({ msg: "No matching password Unauthorized" });
    }
    
    // create access token
    const accessToken = jwt.sign(
      {
        userInfo: {
          username: foundUser.username,
          roles: foundUser.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10s" } // 10s only for development
    );

    // create a refresh token
    const refreshToken = jwt.sign(
      {
        username: foundUser.username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // create secure cookie with the refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true, //accessible only by web server
      secure: true, //https
      sameSite: "None", // cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookies expiry: set to match ...
    });

    // Send accessToken containing username and roles
    res.json({ accessToken });
  }),

  //@desc Refresh
  //@route Get /auth/refresh
  //@access Public - because access token has expired
  refresh: (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const refreshToken = cookies.jwt;

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      asyncHandler(async (err, decodedInfo) => {
        if (err) {
          return res.status(403).json({ msg: "FORBIDDEN" });
        }

        const foundUser = User.findOne({
          username: decodedInfo.username,
        }).exec();

        if (!foundUser) {
          res.status(401).json({ msg: "Unauthorized" });
        }

        const accessToken = jwt.sign(
          {
            userInfo: {
              username: foundUser.username,
              roles: foundUser.roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "10s" }
        );

        res.json({ accessToken });
      })
    );
  },

  //@desc Logout
  //@route POST /auth/logout
  //@access Public - just clear the cookie if exists
  logout: asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) {
      return res.sendStatus(201) // No content
    }

    res.clearCookie('jwt', {httpOnly:true, sameSite: 'None', secure: true });

    res.json({msg:'cookie cleared successfully'});
  }),
};
