const mongoose = require('mongoose');

const NeedHelp = require('../mongodb-schemas/need_help');
const User = require('../mongodb-schemas/user');


module.exports = class NeedHelpTools {

    constructor() {}

    static list_Request(limit = 100, page = 0, username = '.*'){
        if(limit > 1000) { limit = 1000; }

        return new Promise( async (resolve,reject) => {
            const arrayRequest = await NeedHelp.find({username : { $regex: '^(' + username + ')'}}).skip(limit*page).limit(limit).catch(error =>{
                reject(error);
            });
            //const value2 = value;
            console.log("------ ARRAY REQUEST ----- \n",arrayRequest);
            if(arrayRequest){
                const requestList = arrayRequest.map((request, key) => {
                    // console.log('value2', value2);
                    return {
                        key: key,
                        nom: request.nom,
                        message: request.message,
                        user_id:request.user_id,
                        id_metier:request.id_metier
                    }
                });
                resolve (requestList);
            }else{
                reject(new Error("La demande d'aide renseignee est introuvable"));
            }

        })
    }

    static addHelper(request_id,id_user){
        return new Promise(async (resolve,reject) => {
            const request = await NeedHelp.findById(mongoose.Types.ObjectId(request_id)).catch(error => {
                reject(error);
            })

            if(request){

                if(mongoose.Types.ObjectId(id_user).equals(mongoose.Types.ObjectId(request.user_id))){
                    reject(new Error("Il s'agit de votre demande"));
                }else{
                    const helperUser = await User.find({ _id: mongoose.Types.ObjectId(id_user) }).catch(error => {
                        reject(error);
                    })
                    if(helperUser){
                        const helperFull = helperUser.map(helper => {
                            return {
                                name: helper.name ,
                                username: helper.username,
                                user_id: helper._id
                            }
                        })
    
                        if (request.helpers.some(helper => (helper.user_id).equals(helperFull.user_id))) {
    
                            /* helpers contains the element we're looking for */
                            reject(new Error("Vous avez deja suggere votre aide"))
    
                        }else {
                            request.helpers.push(helperFull);
    
                        }
        
                        const request_final = await NeedHelp.updateOne({_id:mongoose.Types.ObjectId(request_id)},{helpers:request.helpers}).catch(error => {
                            reject (error);
                        })
                        resolve(request_final);
                    }else{
                        reject(new Error("Cet utilisateur n'existe pas"));
                    }
                }
            }else{
                reject(new Error("Cette demande d'aide n'existe pas"));
            }

        })

    }

}