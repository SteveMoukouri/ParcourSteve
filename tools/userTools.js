const sha1 = require("crypto-js/sha1");

const User = require('../mongodb-schemas/user');
const mongoose = require('mongoose');
const globalFunc = require('../global');

module.exports = class UserTools {

    constructor() {}

    static update(id_user,password,department,city,region,country,
        public_profile,twitter,instagram,facebook,linkedin,about){
        password = sha1(password).toString();
        return new Promise( async (resolve,reject) => {
            const updateUser = await User.findByIdAndUpdate(mongoose.Types.ObjectId(id_user), 
            {password:password,"adress.department":department,"adress.city":city,
            "adress.region":region,"adress.country":country,public:public_profile,
            twitter:twitter,instagram:instagram,facebook:facebook,linkedin:linkedin,
            about:about},
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

}