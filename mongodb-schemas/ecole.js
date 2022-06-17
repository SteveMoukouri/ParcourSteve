const mongoose = require("mongoose");
const pointSchema = require('./child/point');
const noteSchema = require('./child/note');

const ecoleSchema = new mongoose.Schema({
    nom: {type:String, required:true},
    nom_recherche: {type:String, required:true},
    public:{ type: Boolean, required: true},
    address:{
        departement: String,
        ville: String,
        region: String,
        pays: {type:String, default:"France"},
        location: pointSchema
    },
    site_internet: { type: String },
    code_uai:{ type: String, required: true, unique: true},
    note: noteSchema,
    score_annuel: Number
});

ecoleSchema.index( { 'address.location' : '2dsphere' } );

const Ecole = mongoose.model("ecole", ecoleSchema);

module.exports = Ecole;