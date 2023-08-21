const router = require("express").Router();
const note = require("../controllers/note.controller");

router
  .route("/")
  .get(note.getAllNotes)
  .post(note.createNote)
  .patch(note.updateNote)
  .delete(note.deleteNote);

router.get("/:id", note.getNote);

module.exports = router;
