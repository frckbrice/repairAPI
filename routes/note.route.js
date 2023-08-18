const router = require("express").Router();
const note = require("../controllers/note.controller");

router.route("/").get().post().patch().delete();

module.exports = router;
