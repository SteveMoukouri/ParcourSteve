const Metier = require('../mongodb-schemas/metier');
const Global = require('../global')

module.exports = class JobTools {

    constructor() {}

    static list_job(limit = 100, page = 0, nom = '.*'){
        if(limit > 1000) { limit = 1000; }

        console.log("le nom vaut " + nom );
        nom = Global.replaceSpecialChars(nom);
        return new Promise( async (resolve,reject) => {
            const arrayJob = await Metier.find({'nom' : { $regex: '^(' + nom + ')', $options: 'i'}}).skip(limit*page).limit(limit).catch(error =>{
                reject(error);
            });
            //const value2 = value;
            const jobList = arrayJob.map((job, key) => {
                // console.log('value2', value2);
                return {
                    key: key,
                    nom: job.nom,
                    code_metier:job.code_metier,
                    secteur_activite: job.secteur_activite,
                    niveau_acces_minimum: job.niveau_access_minimum
                }
            });
            resolve (jobList);

        })
    }

}