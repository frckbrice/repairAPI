require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3500;

const { logger, logEvents } = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOption");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const { logEvent } = require("./middlewares/logger");

console.log(process.env.NODE_ENV);
connectDB(); // * connect  database here

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// app.use(express.static('public')); //= this also is going to work cause public is relative from index file.
app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));
app.use("/users", require("./routes/user.route"));
app.use("/notes", require("./routes/note.route"));

//for anything that is not found. this must after all the middlewares
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ msg: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// we use this middleware at the end of all others
app.use(errorHandler);

// app.listen(port, async () => {
//   console.log(`server is running on port ${port}`);
//   await mongoose
//     .connect(process.env.DATABASE_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => {
//       console.log("database successfully connected");
//     })
//     .catch((err) => {
//       console.log("Failed to connect to database", err);
//       logEvents(
//         `${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`,
//         "mongoErrLog.log"
//       );
//     });
// });

mongoose.connection.once("open", () => {
  console.log("database successfully connected");
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
