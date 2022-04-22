const Metier = require('../mongodb-schemas/metier');
const Formation = require ('../mongodb-schemas/formation');
const Ecole = require('../mongodb-schemas/ecole');
const mongoose = require('mongoose');

const globalFunc = require('../global');
const fs = require('fs');
const MetierFormation = require('../mongodb-schemas/metier-formation');
const Parcours = require("../mongodb-schemas/parcours");
const { updateOne } = require('../mongodb-schemas/metier');

module.exports = class ParcoursFunc {
    constructor() {}

    static triFormation(niveau_sortie,duree_cycle) {

        const sortie = Number(niveau_sortie.replace(/\D/g, ''));
        const cycle = Number(duree_cycle.replace(/\D/g, ''));
        if(sortie - cycle < 0) return 0;
        return sortie - cycle ;
    }

    static createParcours(idMetier,niveau,ville=null){

        return (new Promise (async (resolve,reject) => {
            const metier_choisi = await MetierFormation.find({ id_metier: mongoose.Types.ObjectId(idMetier), 'formations.niveau_entree': { $gte: niveau}  }).catch(error => {
                reject(error);
            });
            console.log("J AFFICHE LE METIER / \n",metier_choisi);

            let formations = [];
            let formationsForVille = [];

            metier_choisi.forEach(job => {
                job.formations.forEach(formation => {
                    if (formation.niveau_entree >= niveau) {
                        formationsForVille.push(formation.codes_formations);
                        if (ville) {
                            formations = formationsForVille.filter(f => f.ville === ville);
                        } else {
                            formations = formationsForVille;
                        }
                    }
                });
                //console.log("----------------------- \n J'AFFICHE LES FORMATIONS \n",formations);
            });

            const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
            let output = [];
            output = cartesian.apply(this,formations);
            console.log("-------------------------\n J AFFICHE LES ARCOURS : \n",output);

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
        return new Promise(async (resolve, reject) => {
            const metiers = await MetierFormation.find({ nom: { $regex: metier , $options: 'i'} }).select({nom: 1, id_metier: 1 }).catch(error => {
                reject(error);
            });

            resolve(metiers);
        });
    }

    static async searchParcours2(idMetier,niveau,ville=null){
        console.log(idMetier);
        return new Promise(async (resolve, reject) => {
            const parcours = await MetierFormation.find({ id_metier: mongoose.Types.ObjectId(idMetier), 'formations.niveau_entree': { $gte: niveau}  }).catch(error => {
                reject(error);
            });

            let formations = [];
            parcours.forEach(parcours_ => {
                parcours_.formations.forEach(formation => {
                    if (formation.niveau_entree === niveau) {
                        let formationsForVille = formation.codes_formations;
                        if (ville) {
                            formations = formationsForVille.filter(f => f.ville === ville);
                        } else {
                            formations = formationsForVille;
                        }
                    }
                });
            });

            const formationsFull = [];
            await globalFunc.asyncForEach(formations, (async idFormation => {
                const formation = await Formation.findById(idFormation.id).catch(error => {
                    console.log(error);
                });
                if (formation) {
                    formationsFull.push(formation);
                }
            }));

            resolve(formationsFull);
        });
    }

    static async updateParcours(id_parcours, userId, id_formation=null,index=null,inplace=false){
        return new Promise( async (resolve,reject) => {
            const parcours_ = await Parcours.findOne({_id: mongoose.Types.ObjectId(id_parcours), user_id: userId}).catch(error => {
                reject(error);
            });

            if(parcours_) {
                let del_value = inplace ? 1:0 ;
    
                
                if(index){
                    if(id_formation){
                        // cas où on ajoute une formation (si inplace vaut true on supprime l'ancienne valeur)
                        const formationFull = await Formation.findById(mongoose.Types.ObjectId(id_formation)).select({nom: 1, code_formation: 1,id_onisep: 1,code_rncp: 1,type_formation: 1,nature_formation: 1,niveau_sortie: 1,niveau_entree: 1,duree_cycle_standard: 1,url_diplome: 1,cout_scolarite: 1,modalite_scolarite: 1,code_uai_ecole: 1}).catch(error => {
                            reject(error);
                        });
                        parcours_.formations.splice(index,del_value,formationFull);
                        console.log("-------- parcours_ \n",parcours_.formations);
                    }else{
                        // cas où on se contente de supprimer une valeur
                        parcours_.formations.splice(index,1);
                    }
                }else{
                    if(id_formation){
                        // cas où on se contente de rajouter la formation en fin de liste
                        const formationFull = await Formation.findById(mongoose.Types.ObjectId(id_formation)).select({nom: 1, code_formation: 1,id_onisep: 1,code_rncp: 1,type_formation: 1,nature_formation: 1,niveau_sortie: 1,niveau_entree: 1,duree_cycle_standard: 1,url_diplome: 1,cout_scolarite: 1,modalite_scolarite: 1,code_uai_ecole: 1}).catch(error => {
                            reject(error);
                        });
                        parcours_.formations.push(formationFull);
                        console.log("-------- parcours_ \n",parcours_.formations);
                    }else{
                        reject(new Error("Aucune formation renseigné"));
                    }
                }
    
                const parcours_res = await Parcours.updateOne({_id:mongoose.Types.ObjectId(id_parcours)},{formations:parcours_.formations,updatedAt:new Date()}).catch(error => {
                    reject (error);
                })
    
                resolve(parcours_res);
    
                // const parcours = await Parcours.findByIdAndUpdate(mongoose.Types.ObjectId(id_parcours),).catch(error => {
                //     reject(error);
                // });
            } else {
                reject(new Error('Le parcours n\'existe pas'));
            }


        })

    }

    static list_Parcours(limit = 100, page = 0, nom = '.*', id_user){
        if(limit > 1000) { limit = 1000; }

        console.log("le nom vaut " + nom + " et l'utilisateur est " + id_user);
        nom = globalFunc.replaceSpecialChars(nom);
        return new Promise( async (resolve,reject) => {
            const arrayParcours = await Parcours.find({'user_id' : mongoose.Types.ObjectId(id_user), 'nom': { $regex: '^(' + nom + ')', $options: 'i'}}).skip(limit*page).limit(limit).catch(error =>{
                reject(error);
            });
            //const value2 = value;
            const parcoursList = arrayParcours.map((parcours, key) => {
                // console.log('value2', value2);
                return {
                    key: key,
                    nom: parcours.nom,
                    formations: parcours.formations,
                    id_metier: parcours.id_metier
                }
            });
            resolve (parcoursList);
        })
    }


}