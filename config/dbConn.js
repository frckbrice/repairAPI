const mongoose = require('mongoose');

const connectDB = () => {
  try {
     mongoose.connect(process.env.DATABASE_URI);
  } catch (error) {
    console.log(error)
  }
}

module.exports = connectDB;