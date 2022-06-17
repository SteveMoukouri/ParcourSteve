const mongoose = require('mongoose');
const pointSchema = require('./child/point');

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
        location: pointSchema
    },
    register_date: { type: Date, required: true, default: Date.now },
    sexe: String,
    public:{ type:Boolean, default:true },
    twitter: String,
    instagram: String,
    facebook: String,
    linkedin: String,
    about: String

});

userSchema.index( { 'address.location' : '2dsphere' } );

const User = mongoose.model('user', userSchema);

module.exports = User;