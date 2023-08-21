const router = require("express").Router();
const note = require("../controllers/note.controller");

// we apply the verifyjwt to all the routes here by using router.use()
const verifyJwt = require('../middlewares/verifyJwt');

router.use(verifyJwt);

router
  .route("/")
  .get(note.getAllNotes)
  .post(note.createNote)
  .patch(note.updateNote)
  .delete(note.deleteNote);

router.get("/:id", note.getNote);

module.exports = router;
