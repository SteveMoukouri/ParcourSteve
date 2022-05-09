const mongoose = require("mongoose");

const metierFormationSchema = new mongoose.Schema({
    nom: { type:String, required:true, unique:true },
    nom_recherche: { type:String, required:true, unique:true },
    id_metier:{type:mongoose.Schema.Types.ObjectId, ref:'metier'},
    formations: [{
        niveau_entree: Number,
        codes_formations:[
            {
                id: {type:mongoose.Schema.Types.ObjectId, ref:'formation'},
                id_ecole: {type:mongoose.Schema.Types.ObjectId, ref:'ecole'},
                ville: String
            }
        ]
    }]
});

const MetierFormation = mongoose.model("metierFormation", metierFormationSchema);

module.exports = MetierFormation;