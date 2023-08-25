const { logEvents } = require("./logger");

// this will override the default express error handler

const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}:${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    `errLog.log`
  );

  console.log('err.stack:', err.stack);

  const status = res.statusCode ? res.statusCode : 500;

  res.status(status);

  res.json({ message: err.message, isError: true });

  // next(err);
};

module.exports = errorHandler;
