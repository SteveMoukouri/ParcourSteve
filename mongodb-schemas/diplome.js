const mongoose = require("mongoose");

const diplomeSchema = new mongoose.Schema({
    nom: { type:String, required:true, unique:true },
    niveau: { type:Number, required:true},
    ecoles: [
        {type:mongoose.Schema.Types.ObjectId, ref:'ecole_new'}
    ],
    code_rncp:{type:String, required:true }
});

const Diplome = mongoose.model("diplome", diplomeSchema);

module.exports = Diplome;