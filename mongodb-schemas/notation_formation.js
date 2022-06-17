const mongoose = require("mongoose");
const noteSchema = require('./child/note');

const notationFormationSchema = new mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    formation_id:{type:mongoose.Schema.Types.ObjectId, ref:'formation'},
    note: noteSchema
});

notationFormationSchema.index({user_id:1, formation_id:1}, { unique: true });

const NotationFormaton = mongoose.model("notation_formaton", notationFormationSchema);

module.exports = NotationFormaton;