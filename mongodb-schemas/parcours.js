const mongoose = require("mongoose");

const parcoursSchema = new mongoose.Schema({
    nom: {type:String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    user_id:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    formations: [{type:mongoose.Schema.Types.ObjectId, ref:'formation'}],
    id_metier:{type:mongoose.Schema.Types.ObjectId, ref:'metier'},
    helpers: [{
        name: String,
        username: String,
        user_id: {type:mongoose.Schema.Types.ObjectId, ref:'user',required :true}
    }]
});

const Parcours = mongoose.model("parcours", parcoursSchema);

module.exports = Parcours;