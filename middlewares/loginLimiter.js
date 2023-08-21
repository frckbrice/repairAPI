const rateLimit = require('express-rate-limit');

const {logEvents} = require('./logger');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, //limit the number of IP to 5 login requests per 'window' per minute
  message: { message: 'Too many login attempts from this IP, please try again after a 60 seconds pause'},
  handler: (req, res, next, options) => { // handle what happer when the limit arrives
    logEvents(`Too many Requests: ${options.message.message}\t${req.method}\t${req.url }\t${req.headers.origin}`,'errLog.log');
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers

});

module.exports = loginLimiter;