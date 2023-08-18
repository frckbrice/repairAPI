const allowedOrigin = require("./allowedOrigin");

const corsOptions = {
  origin: (origin, callback) => {
    // we add no origin in case of the test in thunder client or postman because they don't provide origin.
    if (allowedOrigin.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionSuccessStatus: 200,
};

module.exports = corsOptions;
