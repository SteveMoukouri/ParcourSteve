const mongoose = require('mongoose');

const Metier = require('../mongodb-schemas/metier');
const Ecole = require('../mongodb-schemas/ecole');
const MetierFormation = require('../mongodb-schemas/metier-formation');
const Global = require('../global');


module.exports = class JobTools {

    constructor() {}

    static list_job(limit = 100, page = 0, nom = '.*'){
    /* Cette methode renvois la liste des metiers */

        if(limit > 1000) { limit = 1000; }

        nom = Global.replaceSpecialChars(nom);
        return new Promise( async (resolve,reject) => {
            const arrayJob = await Metier.find({'nom_recherche' : { $regex: '^(' + nom + ')', $options: 'i'}}).skip(limit*page).limit(limit).catch(error =>{
                reject(error);
            });

            if (arrayJob.length > 0){
                const jobList = arrayJob.map((job, key) => {
                    return {
                        key: key,
                        nom: job.nom,
                        nom_recherche:job.nom_recherche,
                        code_metier:job.code_metier,
                        secteur_activite: job.secteur_activite,
                        niveau_acces_minimum: job.niveau_access_minimum,
                        id_metier:job._id
                    }
                });
                resolve (jobList);
            }else{
                reject(new Error( " Metier introuvable "));
            }

        })
    }

    static find_school(id_metier,localisation,min_dist=0,max_dist=5000){

        /* Cette methode renvois la liste des ecoles situe autour de la localisation
         qui permettent d'acceder au metier indique */


        return new Promise( async (resolve,reject) => {
            // On recherche le metier en question dans la collection
            const metier = await MetierFormation.findOne({id_metier:mongoose.Types.ObjectId(id_metier)}).select({"formations.codes_formations.id_ecole":1}).catch(error => {
                reject(error);
            });
            
            let code_ecoles = [];

            if(metier){
                // Si le metier existe on recupere l'id des ecoles via les formations
                metier.formations.forEach(groupe_ecole => {
                    code_ecoles = code_ecoles.concat(groupe_ecole.codes_formations);
                })
                // On cree une liste contenant l id des ecoles
                const code_ecoles_fin = code_ecoles.map(code_uai => {
                    return code_uai['id_ecole'];
                })

                //On recupere les ecoles à proximite de la localisation ..
                // .. dont l'id est lie à une formation permettant d'acceder au metier 
    
                const ecoles_proximite = await Ecole.find(
                    {
                      'address.location':
                        { $near:
                           {
                             $geometry: { type: "Point",  coordinates: localisation },
                             $minDistance: min_dist,
                             $maxDistance: max_dist
                           }
                        },
                        _id: { "$in" : code_ecoles_fin }
                    }
                ).catch(error => {
                    reject(error);
                })
    
                if(ecoles_proximite){
                    resolve(ecoles_proximite);
    
                }else{
                    reject(new Error("Nous n'avons trouve aucune ecole qui repondent à vos criteres"))
                }
            }else{
                reject(new Error("Nous n'avons pas trouvé ce metier"))
            }

        })
            
        
    }

}