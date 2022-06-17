const mongoose = require("mongoose");
const User = require('./user').schema;

const followSchema = new mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId, ref:'user', required :true, unique: true},
    follow: [User]   
});

const Follow = mongoose.model("follow", followSchema);

module.exports = Follow;