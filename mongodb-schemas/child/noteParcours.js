const mongoose = require("mongoose");

const noteParcoursSchema = new mongoose.Schema({
    satisfaction_generale:{type: Number, default: 0},
    satisfaction_cout_formations:{type: Number, default: 0},
    satisfaction_localisation:{type: Number, default: 0},
    satisfaction_domaine_formations:{type: Number, default: 0},
});

//const Note = mongoose.model("note", noteSchema);

module.exports = noteParcoursSchema;