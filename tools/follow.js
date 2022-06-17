const mongoose = require('mongoose');

const Follow = require('../mongodb-schemas/follow');
const User = require('../mongodb-schemas/user');
const Global = require('../global');


module.exports = class FollowTools {

    constructor() {}

    static addFollow(id_user,id_follow){
        /* Cette methode permet d'ajouter (ou mettre à jour) la liste des utilisateurs que nous suivons  */
        return new Promise(async(resolve,reject) => {

            const userToFollow = await User.findById(id_follow).catch(error => {
                reject(error);
            });

            if(userToFollow){
                const myFollow = await Follow.findOne({user_id: mongoose.Types.ObjectId(id_user)}).catch(error => {
                    reject(error);
                });

                console.log("My follo : \n", myFollow);

                if(myFollow){
                    if(myFollow.follow.some( user => user._id.equals(id_follow) )){
                        console.log("follow : \n", myFollow.follow)
                        reject(new Error("Vous suivez deja cet utilisateur !"));
                    }else{
                        // On met à jour le document
                        const follow_res = myFollow.follow.push(userToFollow);
                        const follow_update = await Follow.findOneAndUpdate({user_id: mongoose.Types.ObjectId(id_user)}, {follow:follow_res}, {new:true}).catch(error => {
                            reject (error);
                        });
                        resolve(follow_update);
                    }
                    
                }else{
                    // On cree un nouveau document 

                    const follow_update = [userToFollow];

                    const newListFollow = new Follow({
                        user_id: mongoose.Types.ObjectId(id_user),
                        follow: follow_update
                    });

                    const newListFollowBDD = await newListFollow.save().catch(error => {
                        reject(error);
                    })

                    resolve(newListFollowBDD);
                }
            }else{
                reject(new Error("L utilisateur selectionne n existe pas"));
            }
        })
    }

    static list_Follow(limit = 100, page = 0, id_user){
        /* Cette methode renvois la liste utilisateurs que nous suivons  */
        if(limit > 1000) { limit = 1000; }


        return new Promise( async (resolve,reject) => {
            //On recherche la liste des utilisateurs suivis
            const arrayFollow = await Follow.findOne({user_id: mongoose.Types.ObjectId(id_user)}).select({"follow": 1}).skip(limit*page).limit(limit).catch(error =>{
                reject(error);
            });

            console.log("AFFICHAGE arrayFollow : \n", arrayFollow);

            if(arrayFollow){
                //On retourne la liste des utilisateurs suivis
                const followList = arrayFollow.follow.map((user, key) => {
                    return {
                        key: key,
                        nom: user.name,
                        address: user.address,
                        username:user.username,
                        grade: user.grade
                    }
                });
                console.log("----- followList : \n",followList);
                resolve (followList);

            }else{
                console.log("--- JE RENTRE DANS LE ELSE ---");
                reject(new Error(" Vous ne suivez personne"));
            }

        })
    }

    static list_Follower(limit = 100, page = 0, id_user){
        /* Cette methode renvois la liste utilisateurs qui nous suivent  */
        if(limit > 1000) { limit = 1000; }


        return new Promise( async (resolve,reject) => {
            const me = await User.findById(id_user);
            // On parcours la collection afin de trouver l'id des utilisateurs qui nous ont dans leur liste de follow 
            const arrayFollower = await Follow.find({follow:{$in:[me]}}).select({"user_id": 1}).skip(limit*page).limit(limit).catch(error =>{
                reject(error);
            });

            userFull = [];

            // A partir de la liste d'id on renvoit les utilisateurs complets

            if(arrayFollower){
                await Global.asyncForEach(arrayFollower, async follower_id => {
                    const user = await User.findById(follower_id);
                    userFull.push(user);
                })
                const followerList = userFull.map((follower,key) => {
                    return {
                        key: key,
                        nom: follower.name,
                        address: follower.address,
                        username:follower.username,
                        grade: follower.grade
                    }
                })
                resolve(followerList);
            }else{
                reject(new Error("Vous n'avez aucun follower"))
            }

        })
    }

}