const mongoose = require("mongoose");

const metierSchema = new mongoose.Schema({
    nom: { type:String, required:true, unique:true },
    mots_cles: String,
    ecoles: [
        {type:mongoose.Schema.Types.ObjectId, ref:'ecole_new'}
    ]
});

const Metier = mongoose.model("metier", metierSchema);

module.exports = Metier;