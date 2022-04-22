const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        first: { type: String, required: true },
        last: { type: String, required: true },
    },
    username: {type: String, required: true, unique: true },
    birthday: Date,
    password: {type: String, required: true},
    email: {type: String, required:true, unique: true },
    grade: Number, //niveau scolaire
    favorite_job: {type:mongoose.Schema.Types.ObjectId, ref:'metier'},
    address:{
        department: String,
        city: String,
        region: String,
        country: {type:String, default:"France"},
        lat_lng: String
    },
    register_date: { type: Date, required: true, default: Date.now }
});

const User = mongoose.model('user', userSchema);

module.exports = User;