const Metier = require('../mongodb-schemas/metier');
const Formation = require ('../mongodb-schemas/formation');
const Ecole = require('../mongodb-schemas/ecole');

const globalFunc = require('../global');

module.exports = class ParcoursFunc {
    constructor() {}
    
    static triFormation(niveau) {
        switch (niveau) {
            case "BAC + 1":
                return 0;
            case "NIV4":
                return 2;
            case "NIV5":
                return 3;
            case "NIV6":
                return 4;
            case "NIV7":
                return 5;
            case "NIV8":
                return 8;
            default:
                return 0;
                break;
        }
    }
    
    static createParcours(metier , niveau){
        metier = globalFunc.replaceSpecialChars(metier);

        return (new Promise (async (resolve,reject) => {
           const jobs = await Metier.find({ nom: { $regex: metier , $options: 'i'} })
            .select({"nom": 1, "niveau_access_minimum": 1})
            .limit(10)
            .catch(error => {
                reject(error);
            })

            // console.log(jobs);

            await globalFunc.asyncForEach(jobs, (async job => { 
                // const formations = await Formation.find({ id_metier: job._id}).catch(error => {
                //     reject(error);
                // })
                
                // let bac = [];
                // for (let i = niveau ; i <= 8 ; i++){
                //     bac[i]
                // }

                let docs = await Formation.aggregate([
                {
                    $match: { id_metier: job._id}
                }, {
                    $group: {
                        // Each `_id` must be unique, so if there are multiple
                        // documents with the same age, MongoDB will increment `count`.
                        _id: '$niveau_sortie',
                        forms: {$push : { nom : "$nom" , code_formation : "$code_formation", domaine:"$domaine"}} //noms: { $push : "$nom"  }
                    }
                }
                ]);
            //    console.log(formations)
                console.log(docs);
                console.log("----------------------------------- \n");
                let triFormation = [];
                let list_domaine = [];
                //On cherche les domaines en commun pour trouver les formations similaires
                if (docs) {
                    docs.forEach(formation => {
                        formation.forms.forEach(f => {
                            // console.log(f);
                            // console.log(f.domaine);
                            list_domaine.push(f.domaine);
                        })
                        console.log(list_domaine);

                        triFormation.push(formation.forms);
                    })
                }
                console.log("---------------- J AFFICHE LES DOMAINES------------------- \n")

                //console.log(triFormation);
                //console.log(list_domaine);
                let domaine_fin = list_domaine[0];
                console.log(domaine_fin);
                let domaine_fin2 = [];


                // On garde l'intersection entre les différents domaines
                list_domaine.forEach(secteur => {
                    domaine_fin2 =  secteur.filter(domaine_recherche => {
                        const domaine = domaine_fin.some(res_intermediaire => new RegExp(res_intermediaire).test(domaine_recherche));
                        return domaine;
                    });
                })
                console.log('domaine_fin2', domaine_fin2);
                console.log('domaine_fin final', domaine_fin);

                // const listFormations = await Formation.find({ domaine: { "$in" : domaine_fin }  }).select({'id_ecole':1, 'nom':1, "niveau_sortie": 1,"domaine":1}).catch(error => {
                //     console.log(error);
                // });
                // console.log(listFormations)

                console.log("----------------- FIN ----------------")

                //On recherche les formations qui ont les domaines indiqués et on les agrège par niveau

                const regex_domaine_fin2 = domaine_fin2.map(function (domaine) { return new RegExp(domaine.trim(), "i"); });

                let docs_form = await Formation.aggregate([
                    {
                        $match: { domaine: { $in : regex_domaine_fin2 }}
                    }, {
                        $group: {
                            _id: '$niveau_sortie',
                            forms: {$push : { id: "$_id", code_formation : "$code_formation"}}
                            // forms: {$push : { nom : "$nom" , code_formation : "$code_formation", domaine:"$domaine"}} //noms: { $push : "$nom"  }
                        }
                    }
                ]);

                console.log(docs_form);
                let res = [];
                const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
                let output = [];

                if(docs_form){
                    docs_form.forEach(doc => {
                        // console.log(doc.forms.map(form => form.code_formation));
                        res.push(doc.forms.map(form => { return { 'bac': doc._id, 'code': form.id} }));
                        console.log("------------ RES ------------------\n");
                        console.log(res);
                        console.log("------------ END RES ------------------\n");
                        output = cartesian.apply(this,res)
                        console.log("------------ OUTPUT ------------------\n");
                        console.log(output);

                        // for(let i = 0; i< doc.lentgth; i++){


                        // }
                    })
                }
                console.log("--------------- LA VRAIE FIN -------------------- \n")


               /* console.log('Resultat attendu',
                [
                    ["Formation de premier niveau", "Formation de second niveau"],
                    ["Formation de premier niveau", "Formation de second niveau mais une autre"]
                ]); */
            }))
        
        }))
    }
    

}