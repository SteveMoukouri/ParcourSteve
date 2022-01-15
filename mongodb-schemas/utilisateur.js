const mongoose = require('mongoose');
const Loisir = require("./enfants/loisir");

const utilisateurSchema = new mongoose.Schema({
    prenom: { type: String, required: true },
    nom: { type: String, required: true },
    age: { type: Number, required: false },
    loisir: [Loisir.schema]
});

const Utilisateur = mongoose.model('utilisateur', utilisateurSchema);

module.exports = Utilisateur;