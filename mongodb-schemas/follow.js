const mongoose = require("mongoose");
const User = require('./user').schema;

const followSchema = new mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId, ref:'user', required :true, unique: true},
    follow: [User],
    nb_follower: {type:Number, default: 0 }
});

const Follow = mongoose.model("follow", followSchema);

module.exports = Follow;