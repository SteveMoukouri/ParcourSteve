const Ecole = require('../mongodb-schemas/ecole');
const Global = require('../global')

module.exports = class EcoleTools {

    constructor() {}

    static list_Ecole(limit = 100, page = 0, nom = '.*', location, min_dist, max_dist){
        /* Cette methode renvois la liste des ecoles en fonction de la distance indiquée  */
        if(limit > 1000) { limit = 1000; }

        nom = Global.replaceSpecialChars(nom);

        return new Promise( async (resolve,reject) => {

            //On recherche les ecoles à proximite de la localisation situees entre min_dist et max_dist

            const ecoles_proximite = await Ecole.find(
                {
                  'address.location':
                    { $near:
                       {
                         $geometry: { type: "Point",  coordinates: location },
                         $minDistance: min_dist,
                         $maxDistance: max_dist
                       }
                    },
                    nom_recherche : { $regex: '^(' + nom + ')', $options: 'i'}
                }
            ).skip(limit*page).limit(limit).catch(error => {
                reject(error);
            })

            resolve (ecoles_proximite);

        })
    }

}