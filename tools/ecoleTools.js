const Ecole = require('../mongodb-schemas/ecole');
const Global = require('../global')

module.exports = class EcoleTools {

    constructor() {}

    static list_Ecole(limit = 100, page = 0, nom = '.*', ville = '.*'){
        if(limit > 1000) { limit = 1000; }
        // if(!ville){
        //     ville = '';
        //     console.log(ville);
        // }
        // if(!nom){
        //     nom = '';
        //     console.log(nom);
        // }
        console.log("le nom vaut " + nom + " et la ville est " + ville);
        nom = Global.replaceSpecialChars(nom);
        ville = Global.replaceSpecialChars(ville);
        return new Promise( async (resolve,reject) => {
            const arrayEcole = await Ecole.find({'nom_recherche' : { $regex: '^(' + nom + ')', $options: 'i'}, 'adresse.ville' : { $regex: '^(' + ville + ')', $options: 'i'} }).skip(limit*page).limit(limit).catch(error =>{
                reject(error);
            });
            //const value2 = value;
            const ecoleList = arrayEcole.map((ecole, key) => {
                // console.log('value2', value2);
                return {
                    key: key,
                    nom: ecole.nom,
                    adresse: ecole.adresse
                }
            });
            resolve (ecoleList);

        })
    }

}