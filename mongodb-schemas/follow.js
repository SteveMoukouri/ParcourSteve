const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId, ref:'user',required :true},
    follow: [
        {type:mongoose.Schema.Types.ObjectId, ref:'user'}
    ],
    
});

const Follow = mongoose.model("follow", followSchema);

module.exports = Follow;