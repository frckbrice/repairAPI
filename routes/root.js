const router = require("express").Router();
const root = require("../controllers/index");

router.get("^/$|/index(.html)?", root.index);

module.exports = router;
