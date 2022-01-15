const mongoose = require("mongoose");

const etudiantSchema = new mongoose.Schema({
    numEtu : { type: Number, required: true, unique : true},
    nom:{ type: String, required: true},
    age:{type: Number},
    class: {type:String, required:true},
    
})

const Etudiant = mongoose.model("etudiant",etudiantSchema);

module.exports = Etudiant;