const jwt = require('jsonwebtoken');

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if(!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({msg:'Unauthorized'})
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decodedInfo) => {
      if(err) return res.status(403).json({msg:'Forbidden'});
      req.user = decodedInfo.userInfo.username;
      req.roles = decodedInfo.userInfo.roles;
      next();
    }
  )
};

module.exports = verifyJwt;