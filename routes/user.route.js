const router = require("express").Router();
const user = require("../controllers/user.controller");

// we apply the verifyjwt to all the routes here by using router.use()
const verifyJwt = require('../middlewares/verifyJwt');

router.use(verifyJwt);

router
  .route("/")
  .get(user.getAllUsers)
  .post(user.createUser)
  .patch(user.updateUser)
  .delete(user.deleteUser);

router
  .route('/:id')
  .get(user.getUser);

// router.post('/', user.createUser)

module.exports = router;
