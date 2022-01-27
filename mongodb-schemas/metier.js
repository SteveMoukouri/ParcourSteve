const mongoose = require("mongoose");

const metierSchema = new mongoose.Schema({
    nom: { type:String, required:true, unique:true },
    code_metier: { type:String, required:true },
    secteur_activite: [String],
    niveau_access_minimum: { type: String, required: true }
});

const Metier = mongoose.model("metier", metierSchema);

module.exports = Metier;