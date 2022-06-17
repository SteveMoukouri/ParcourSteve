const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    satisfaction_generale:{type: Number, default: 0},
    satisfaction_cours_et_prof:{type: Number, default: 0},
    satisfaction_encadrement:{type: Number, default: 0},
    satisfaction_locaux:{type: Number, default: 0},
    satisfaction_reseau_etudiant:{type: Number, default: 0},
    satisfaction_vie_associative:{type: Number, default: 0},
    satisfaction_ouverture_internationale:{type: Number, default: 0},
    satisfaction_relations_avec_les_entreprises:{type: Number, default: 0},
    satisfaction_preparation_vie_active:{type: Number, default: 0}, // correlation cours / métier
    satisfaction_qualite_services_dedie_aux_etudiants:{type: Number, default: 0},
    satisfaction_relations_entre_etudiants:{type: Number, default: 0},
    satisfaction_accompagnement_projet_personnel:{type: Number, default: 0}
});

//const Note = mongoose.model("note", noteSchema);

module.exports = noteSchema;