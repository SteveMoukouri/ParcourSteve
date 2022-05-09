const sha1 = require("crypto-js/sha1");

const User = require('../mongodb-schemas/user');
const mongoose = require('mongoose');
const globalFunc = require('../global');

module.exports = class UserTools {

    constructor() {}

    static update(id_user,lastname,firstname,password,department,city,region,country){
        password = sha1(password).toString();
        return new Promise( async (resolve,reject) => {
            const updateUser = await Parcours.findByIdAndUpdate(mongoose.Types.ObjectId(id_user), {"name.first":firstname,"name.last":lastname,password:password,"adress.department":department,"adress.city":city,"adress.region":region,"adress.country":country}).catch(error => {
                reject (error);
            });
            
            if(updateUser){
                resolve (updateUser);
            }else{
                reject(new Error("Impossible de mettre à jour l'utilisateur"))
            }

        })
    }

}