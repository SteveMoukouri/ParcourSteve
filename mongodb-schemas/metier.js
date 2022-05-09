const mongoose = require("mongoose");

const metierSchema = new mongoose.Schema({
    nom: { type:String, required:true, unique:true },
    nom_recherche: {type: String, required : true},
    code_metier: { type:String, required:true },
    secteur_activite: [String],
    niveau_access_minimum: { type: Number, required: true }
});

metierSchema.index({nom: 'text'});
const Metier = mongoose.model("metier", metierSchema);

module.exports = Metier;