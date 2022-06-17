const mongoose = require("mongoose");
const noteSchema = require('./child/note');

const notationEcoleSchema = new mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    ecole_id:{type:mongoose.Schema.Types.ObjectId, ref:'ecole'},
    note: noteSchema
});

notationEcoleSchema.index({user_id:1, ecole_id:1}, { unique: true });

const NotationEcole = mongoose.model("notation_ecole", notationEcoleSchema);

module.exports = NotationEcole;