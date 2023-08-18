const router = require("express").Router();
const user = require("../controllers/user.controller");

router.route("/")
.get(user.getAllUsers)
.post(user.createUser)
.patch(user.updateUser)
.delete(user.deleteUser);

module.exports = router;
