const mongoose = require("mongoose");

const formationSchema = new mongoose.Schema({
    nom: {type:String, required:true},
    nom_recherche: {type: String, required : true},
    code_formation:{ type: String, required: true },
    id_onisep:{ type: String },
    code_rncp:{ type: String },
    domaine: [String],  //{ type: String, required: true },
    type_formation: {type:String, required:true},
    nature_formation: {type:String, required:true},
    niveau_sortie: {type:Number, required:true},
    niveau_entree:{type:Number, required:true},
    duree_cycle_standard: {type:String, required:true},
    url_diplome:{ type: String },
    cout_scolarite: {type: String},
    modalite_scolarite: { type: String },
    date_modif: { type: Date },
    code_uai_ecole:{ type: String },
    id_ecole:{type:mongoose.Schema.Types.ObjectId, ref:'ecole'},
    id_metier:{type:mongoose.Schema.Types.ObjectId, ref:'metier'}
});
formationSchema.index({domaine: 'text'});
const Formation = mongoose.model("formation", formationSchema);

module.exports = Formation;