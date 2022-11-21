const mongoose = require("mongoose");
const noteParcoursSchema = require('./child/noteParcours');

const notationParcoursSchema = new mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    parcours_id:{type:mongoose.Schema.Types.ObjectId, ref:'parcours'},
    note: noteParcoursSchema
});

notationParcoursSchema.index({user_id:1, parcours_id:1}, { unique: true });

const NotationParcours = mongoose.model("notation_parcours", notationParcoursSchema);

module.exports = NotationParcours;