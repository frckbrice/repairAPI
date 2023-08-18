const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const noteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "user",
    },

    title: {
      type: String,
      require: [true, "A note must have a title"],
    },
    text: {
      type: String,
      require: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.plugin(AutoIncrement, {
  inc_field: 'ticket',
  id: 'ticketNums',
  start_seq: 500
})

module.exports = mongoose.model("note", noteSchema);
