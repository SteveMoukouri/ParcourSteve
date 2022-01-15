const mongoose = require("mongoose");

const ecoleSchema = new mongoose.Schema({
    nom: {type:String, required:true},
    nom_recherche: {type:String, required:true},
    public:{ type: Boolean, required: true},
    adresse:{
        departement: String,
        ville: String,
        region: String,
        pays: {type:String, default:"France"},
        lat_lng: String
    },
    site_internet: { type: String },
    code_uai:{ type: String, required: true, unique: true},
    note:{type: Number, default: 0}
});

const Ecole = mongoose.model("ecole", ecoleSchema);

module.exports = Ecole;