const Metier = require('../mongodb-schemas/metier');
const Formation = require ('../mongodb-schemas/formation');
const Ecole = require('../mongodb-schemas/ecole');
const User = require('../mongodb-schemas/user');

const mongoose = require('mongoose');
const axios = require('axios')

const globalFunc = require('../global');
const fs = require('fs');
const MetierFormation = require('../mongodb-schemas/metier-formation');
const Parcours = require("../mongodb-schemas/parcours");

//const { updateOne } = require('../mongodb-schemas/metier');

module.exports = class ParcoursFunc {
    constructor() {}

    static triFormation(niveau_sortie,duree_cycle) {
        /* Cette methode renvoit le niveau d entree d une formation  */

        const sortie = Number(niveau_sortie.replace(/\D/g, ''));
        const cycle = Number(duree_cycle.replace(/\D/g, ''));
        if(sortie - cycle < 0) return 0;
        return sortie - cycle ;
    }

    static createParcours(idMetier,niveau,localisation){
        /* Cette methode genere un parcours automatique pour le metier indique  
            à partir d'un niveau et d'une localisation  */

        return (new Promise (async (resolve,reject) => {
            const metier_choisi = await MetierFormation.find({ id_metier: mongoose.Types.ObjectId(idMetier), 'formations.niveau_entree': { $gte: niveau}  }).catch(error => {
                reject(error);
            });
            console.log("J AFFICHE LE METIER / \n",metier_choisi);

            let formations = [];

            metier_choisi.forEach(job => {
                job.formations.forEach(formation => {
                    if (formation.niveau_entree >= niveau) {
                        let formationsForVille = formation.codes_formations;
                        // console.log('formationsForVille', formationsForVille);
                        formationsForVille = formationsForVille.filter(f => globalFunc.calcCrow(f.location.coordinates[1], f.location.coordinates[0], localisation[1], localisation[0]) <= 50);
                        
                        if(formationsForVille.length > 0) {
                            formations.push(formationsForVille);
                        }
                    }
                });
                console.log("----------------------- \n J'AFFICHE LES FORMATIONS \n",formations);
            });

            // const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
            // let output = [];
            // output = cartesian.apply(this,formations);
            // console.log("-------------------------\n J AFFICHE LES ARCOURS : \n",output);

            // const formationsFull = [];
            // await globalFunc.asyncForEach(formations, (async idFormation => {
            //     const formation = await Formation.findById(idFormation.id).catch(error => {
            //         console.log(error);
            //     });
            //     if (formation) {
            //         formationsFull.push(formation);
            //     }
            // }));

            // resolve(formationsFull);


            // console.log(docs_form);
            // let res = [];
            // const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
            // let output = [];

            // if(docs_form){
            //     docs_form.forEach(doc => {
            //         console.log(doc.forms);
            //         // console.log(doc.forms.map(form => form.code_formation));
            //         res.push(doc.forms.map(form => { return { 'bac': doc._id, 'code': form.id} }));
            //         console.log("------------ RES ------------------\n");
            //         console.log(res);
            //         console.log("------------ END RES ------------------\n");
            //         /*output = cartesian.apply(this,res)
            //         console.log("------------ OUTPUT ------------------\n");
            //         console.log(output);*/

            //         // for(let i = 0; i< doc.lentgth; i++){


            //         // }
            //     })
            // }

            // convert JSON object to string
            // const data = JSON.stringify(output, null, 4);

            // // write JSON string to a file
            // fs.writeFile('parcours.json', data, (err) => {
            //     if (err) {
            //         throw err;
            //     }
            //     console.log("JSON data is saved.");
            // });
            // console.log("--------------- LA VRAIE FIN -------------------- \n")

        }))
    }

    // Search metier
    static async searchParcours1(metier){
        /* Cette methode renvois la liste des metiers 
            pouvant correspondre à la demande de l utilisateur  */

        return new Promise(async (resolve, reject) => {
            const metiers = await MetierFormation.find({ nom_recherche: { $regex: metier , $options: 'i'} }).select({nom: 1, id_metier: 1 }).catch(error => {
                reject(error);
            });

            resolve(metiers);
        });
    }

    static async searchParcours2(idParcours,niveau,userSexe, list_profile=[],type_ecole=null, localisation,limit=100){

        /* Cette methode renvois la liste des formations pour un niveau donne 
            permettant d acceder au metier recherche 
            en fonction de notre localisation  */

        return new Promise(async (resolve, reject) => {
            const parcoursBDD = await Parcours.findById(idParcours).catch(error => {
                reject(error);
            });
            if(parcoursBDD) {
                const parcours = await MetierFormation.findOne({ id_metier: mongoose.Types.ObjectId(parcoursBDD.id_metier), 'formations.niveau_entree': { $gte: niveau}  }).catch(error => {
                    reject(error);
                });
                
                // On recherche les formations du niveau indique en lien avec le metier
                let formations = [];

                if(parcours){
                    if( type_ecole === "ingenieur"){
                        const params = {list_profile: list_profile};
        
                        const forma_list = await this.getBestFormation(params).catch(error => {
                            console.log(params)
                            reject(error)
                        });

                        let id_forma = []
                        if(forma_list != undefined){
                            id_forma = forma_list.formations.data.map( forma => {
                                return forma._id ;
                            })
                        }else{
                            reject(new Error(" List_profile est incorrect"))
                        }

                        parcours.formations.forEach(formation => {
                            if (formation.niveau_entree === niveau) {
                                let formationsForVille = formation.codes_formations;
        
                                // Si la formation se trouve à une distance "respectable" elle est ajoutee
                                const res = formationsForVille.filter(item =>{
        
                                    // console.log("test : ",id_forma.includes(item.id))
                                    return id_forma.includes((item.id).toString());
                                })
        
                                //if (parcours_.helpers.some(helper => (helper.user_id).equals(helperFull.user_id) )) {
        
                                formations = res.filter(f => globalFunc.calcCrow(f.location.coordinates[1], f.location.coordinates[0], localisation[1], localisation[0]) <= 50);
                            }
                        });
                    }else{                  
                        parcours.formations.forEach(formation => {
                            if (formation.niveau_entree === niveau) {
                                let formationsForVille = formation.codes_formations;
                                // Si la formation se trouve à une distance "respectable" elle est ajoutee
                                formations = formationsForVille.filter(f => globalFunc.calcCrow(f.location.coordinates[1], f.location.coordinates[0], localisation[1], localisation[0]) <= 50);
                            }
                        });
                    };
                }else{
                    reject(new Error("metier introuvable"));
                }

                
                //On renvoit la liste des formations qui respectent les criteres
                const formationsFull = [];
                let formationTotal = 0;
                await globalFunc.asyncForEach(formations, (async idFormation => {
                    const formation = await Formation.findById(idFormation.id).catch(error => {
                        console.log(error);
                    });
                    if (formation && formationTotal <= limit) {
                        formationTotal++;
                        formationsFull.push(formation);
                    }
                }));

                resolve(formationsFull);
            } else {
                reject(new Error('Parcours inconnu'));
            }

        });
     }

    static getBestFormation(params) {
        const json = JSON.stringify(params);
        const headers = {"Content-Type":"application/json"}
        return new Promise((resolve, reject) => {
          axios.post('http://localhost:9090/find',json,{headers:headers})
          .then(function (response) {
            if(response) {
                //const formations = response.data.results;
                resolve({formations:response});
            } else {
                reject(new Error('Aucune formation trouvée'));
            }
          })
          .catch(function (error) {
            reject(error);
          }); 
        })
    }


    static async addHelper(id_parcours,userId,helperId){

        /* Cette methode permet à l utilisateur de rajouter un collaborateur 
            pour l'aider dans la creation du parcours selectionne  */

        return new Promise (async (resolve,reject) => {
            const parcours_ = await Parcours.findOne({_id: mongoose.Types.ObjectId(id_parcours),user_id:userId}).catch(error => {
                reject(error);
            });

            if(parcours_){
                const helperUser = await User.findById(mongoose.Types.ObjectId(helperId)).catch(error => {
                    reject(error);
                })
                if(helperUser){
                    const helperFull = {
                        name: helperUser.name ,
                        username: helperUser.username,
                        user_id: helperUser._id
                    }
                    console.log(parcours_.helpers, helperFull);
                    if(parcours_.helpers === null) {
                        // On crée le tableau helpers
                        parcours_.helpers = [helperFull];
                    } else {
                        // on met à jour le tableau helpers
                        if (parcours_.helpers.some(helper => (helper.user_id).equals(helperFull.user_id) )) {
                            /* helpers contains the element we're looking for */
                            reject(new Error("Vous avez deja accepte cet utilisateur"))
    
                        }else {
                            parcours_.helpers.push(helperFull);
                        }
                    }

                    const parcours_res = await Parcours.findByIdAndUpdate(mongoose.Types.ObjectId(id_parcours), {helpers:parcours_.helpers,updatedAt:new Date()}).catch(error => {
                        reject (error);
                    });
                    resolve(parcours_res);
                }else{
                    reject(new Error("Cet utilisateur n'existe pas"));
                }
            }else{
                reject( new Error ("Ce parcours n'existe pas "));
            }
        })
    }

    static async updateParcours(id_parcours, userId, id_formation=null,index=null,replace=false,isPublic=false){

        /* Cette methode permet de mettre à jour un parcours  */

        return new Promise( async (resolve,reject) => {
            const parcours_ = await Parcours.findOne({
                _id: mongoose.Types.ObjectId(id_parcours),
                $or:[
                    {user_id: userId},
                    {'helpers.user_id':{$in:[userId]}}
                ]
            }).catch(error => {
                reject(error);
            });

            if(parcours_) {
                let del_value = replace ? 1:0 ;
                   
                if(index != null){
                    if(id_formation){
                        // cas où on ajoute une formation (si replace vaut true on supprime l'ancienne valeur)
                        const formationFull = await Formation.findById(mongoose.Types.ObjectId(id_formation)).catch(error => {
                            reject(error);
                        });
                        if(formationFull){
                            if(parcours_.formations === null){
                                //On initialise le tableau
                                parcours_.formation = [formationFull];
                            }

                            if(parcours_.formations[index] === null){
                                //On vérifie que l'index existe
                                index = parcours_.formations.length;
                            }

                            if(parcours_.formations.some(formation => (formation._id).equals(formationFull._id))){
                                //On vérifie si la formation est déja présente
                                reject(new Error("Vous avez déja rajouté cette formation"));
                            }else{
                                // On update le tableau en inserant la nouvelle valeur
                                parcours_.formations.splice(index,del_value,formationFull);
                            }
                        }else{
                            reject(new Error("la formation renseignée n'existe pas"));
                        }


                    }else{
                        // cas où on se contente de supprimer une valeur
                        parcours_.formations.splice(index,1);
                    }
                }else{
                    if(id_formation){
                        // cas où on se contente de rajouter la formation en fin de liste
                        const formationFull = await Formation.findById(mongoose.Types.ObjectId(id_formation)).catch(error => {
                            reject(error);
                        });

                        if(formationFull){
                            if(parcours_.formations === null){
                                //On initialise le tableau
                                parcours_.formation = [formationFull];
                            }

                            if(parcours_.formations.some(formation => (formation._id).equals(formationFull._id))){
                                //On vérifie si la formation est déja présente
                                reject(new Error("Vous avez déja rajouté cette formation"));
                            }else{
                                parcours_.formations.push(formationFull);
                            }
                        }
          
                    }else{
                        reject(new Error("Aucune formation renseigné"));
                    }
                }
    
                const parcours_res = await Parcours.findByIdAndUpdate(
                    mongoose.Types.ObjectId(id_parcours),
                    {
                        formations: parcours_.formations,
                        public: isPublic,
                        updatedAt: new Date()
                    },
                    {new: true}
                ).catch(error => {
                    reject (error);
                })
    
                resolve(parcours_res);

            } else {
                reject(new Error('Le parcours n\'existe pas'));
            }

        })

    }

    static list_Parcours(my_id,idUser = 'me',limit = 100, page = 0, nom = '.*'){

        /* Cette methode permet de lister ses parcours  */

        if(limit > 1000) { limit = 1000; }

        if(idUser == 'me'){
            idUser = my_id;
        }
        nom = globalFunc.replaceSpecialChars(nom);

        return new Promise( async (resolve,reject) => {

            const arrayParcours = await Parcours.find({'user_id' : mongoose.Types.ObjectId(idUser), 'nom': { $regex: '^(' + nom + ')', $options: 'i'}}).skip(limit*page).limit(limit).catch(error =>{
                reject(error);
            });

            let parcoursList;

            if(arrayParcours.length > 0) {
                if(!mongoose.Types.ObjectId(my_id).equals(mongoose.Types.ObjectId(idUser))){
                    parcoursList = arrayParcours.filter( parcours => {
                        parcours.public === true;
                    });
                }

                parcoursList = arrayParcours.map((parcours) => {
                    return {
                        id: parcours._id,
                        nom: parcours.nom,
                        formations: parcours.formations,
                        id_metier: parcours.id_metier
                    }
                });
                resolve (parcoursList);
            } else {
                reject(new Error('Aucun parcours trouvé'));
            }
        })
    }

    static deleteParcours(id_parcours,id_user){

        /* Cette methode permet de supprimer l'un de ses parcours  */

        return new Promise( async (resolve,reject) => {
            const deleted = await Parcours.deleteOne({_id: mongoose.Types.ObjectId(id_parcours), user_id: id_user}).catch(error => {
                reject(error);
            })
            if (deleted.deletedCount > 0) {
                resolve(true);
            } else {
                reject(new Error('Aucun parcours trouvé'));
            }
        })
    }

    static list_parcours_formations(id_parcours,id_user=null){
        console.log(id_user);
        return new Promise( async (resolve,reject) => {
            const find = { _id: mongoose.Types.ObjectId(id_parcours) };
            if(id_user) {
                find['$or'] = [
                    {user_id: mongoose.Types.ObjectId(id_user)},
                    {'helpers.user_id':{$in:[mongoose.Types.ObjectId(id_user)]}}
                ];
            } else {
                find['public'] = true;
            }
            console.log(find);
            
            const parcours = await Parcours.findOne(find).catch(error => {
                reject(error);
            })
            if(parcours) {
                resolve({ formations: parcours.formations, parcours_name: parcours.nom })
            } else {
                reject(new Error('Parcours inexistant'));
            }
        }) 

    }

    // static addParcours(id_user,nom,id_metier){

    //     /* Methode qui permet l'ajout d'un parcours dans la collection */

    //     return new Promise(async (resolve,reject) => {
    //         const parcours = new Parcours({
    //             nom: nom,
    //             user_id: id_user,
    //             formations: [],
    //             id_metier: id_metier,
    //             helpers: []
    //         })

    //         const parcoursBDD = await parcours.save().catch(error => {
    //             reject(error);
    //         })

    //         resolve(parcoursBDD);

    //     })

    // }

    static detail_formation(idFormation){
        return new Promise( async (resolve,reject) => {

            const formation = Formation.findById(idFormation).catch(error => {
                reject(error);
            });
            if (formation){
                resolve(formation);
            }else{
                reject(new Error("formation introuvable"));
            }
        })
    }

}