const sha1 = require("crypto-js/sha1");

const User = require('../mongodb-schemas/user');
const mongoose = require('mongoose');
const globalFunc = require('../global');

module.exports = class UserTools {

    constructor() {}

    static update(id_user,profile){
        //profile.password = sha1(profile.password).toString();
        return new Promise( async (resolve,reject) => {
            
            const updateUser = await User.findByIdAndUpdate(mongoose.Types.ObjectId(id_user), 
            profile,
            {new: true}
            ).catch(error => {
                reject (error);
            });
            
            if(updateUser){
                resolve (updateUser);
            }else{
                reject(new Error("Impossible de mettre à jour l'utilisateur"))
            }

        })
    }

    static get(username,my_id){
        return new Promise( async (resolve,reject) => {
            
            if(username === 'me'){
                const my_profile = await User.findById(my_id).catch(error => {
                    reject(error);
                })
                console.log('my_profile', my_profile);
                if(my_profile){
                    resolve(my_profile);
                }else{
                    reject(new Error(" Erreur lors du chargement de votre profile !"))
                }

            }

            const user_profile = await User.findOne({username: username}).catch(error => {
                reject(error);
            })

            if(user_profile){
                
                if(mongoose.Types.ObjectId(my_id).equals(mongoose.Types.ObjectId(user_profile._id))){    
                    resolve(user_profile);
                }else{
    
                    if(user_profile.public){
                        resolve({
                            name: user_profile.name,
                            username: user_profile.username,
                            birthday: user_profile.birthday,
                            grade: user_profile.grade, //niveau scolaire
                            favorite_job: user_profile.favorite_job,
                            address: user_profile.address,
                            register_date: user_profile.register_date,
                            sexe: user_profile.sexe,
                            twitter: user_profile.twitter,
                            instagram: user_profile.instagram,
                            facebook: user_profile.facebook,
                            linkedin: user_profile.linkedin,
                            about: user_profile.about
                        })
                    }else {
                        reject(new Error("Ce profile est privé"))
                    }
                }

            }else{
                reject (new Error("Erreur dans le chargement du profile"))
            }
    
        })
    }

    static list(limit = 100, page = 0, username = '.*'){
        if(limit > 1000) { limit = 1000; }

        const nom = globalFunc.replaceSpecialChars(username);
        return new Promise( async (resolve,reject) => {

            const arrayUser = await User.find({'username' : { $regex: '^(' + nom + ')', $options: 'i'}, 'public':true}).skip(limit*page).limit(limit).catch(error =>{
                reject(error);
            });

            if (arrayUser.length > 0){
                const userList = arrayUser.map((user, key) => {
                    return {
                        key: key,
                        nom: user.name,
                        username:user.username,
                        email: user.email,
                        twitter: user.twitter,
                        instagram: user.instagram,
                        facebook: user.facebook,
                        linkedin: user.linkedin,
                        about:user.about
                    }
                });
                resolve (userList);
            }else{
                reject(new Error( " Profile introuvable "));
            }

        })
    }

}