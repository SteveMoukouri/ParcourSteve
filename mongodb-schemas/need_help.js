const mongoose = require("mongoose");

const needHelpSchema = new mongoose.Schema({
    username: {type:String, required: true},
    name: {
        first: String,
        last: String,
    },
    date:  Date,
    user_id:{type:mongoose.Schema.Types.ObjectId, ref:'user',required :true},
    id_metier:{type:mongoose.Schema.Types.ObjectId, ref:'metier'},
    message: {type:String , required: true},
    helpers: [{
        name: String,
        username: String,
        user_id: {type:mongoose.Schema.Types.ObjectId, ref:'user',required :true}
    }]
});

const NeedHelp = mongoose.model("need_help", needHelpSchema);

module.exports = NeedHelp;