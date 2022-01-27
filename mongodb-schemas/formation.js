const mongoose = require("mongoose");

const formationSchema = new mongoose.Schema({
    nom: {type:String, required:true},
    code_formation:{ type: String, required: true },
    id_ecole:{type:mongoose.Schema.Types.ObjectId, ref:'ecole'},
    id_metier:{type:mongoose.Schema.Types.ObjectId, ref:'metier'}
});

const Formation = mongoose.model("formation", formationSchema);

module.exports = Formation;