const mongoose = require("mongoose");
const pointSchema = require('./child/point');

const metierFormationSchema = new mongoose.Schema({
    nom: { type:String, required:true, unique:true },
    nom_recherche: { type:String, required:true, unique:true },
    domaine_commun: [String],
    id_metier:{type:mongoose.Schema.Types.ObjectId, ref:'metier'},
    formations: [{
        niveau_entree: Number,
        codes_formations:[
            {
                id: {type:mongoose.Schema.Types.ObjectId, ref:'formation'},
                id_ecole: {type:mongoose.Schema.Types.ObjectId, ref:'ecole'},
                location: pointSchema
            }
        ]
    }]
});

metierFormationSchema.index( { 'formations.codes_formations.location' : '2dsphere' } );

const MetierFormation = mongoose.model("metierFormation", metierFormationSchema);

module.exports = MetierFormation;