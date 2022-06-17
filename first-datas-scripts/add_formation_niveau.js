const Global = require("../global");
const MetierFormation = require("../mongodb-schemas/metier-formation");
const Metier = require("../mongodb-schemas/metier");
const Formation = require ("../mongodb-schemas/formation");
const Ecole = require ("../mongodb-schemas/ecole");
const mongoose = require('mongoose');

module.exports = (async () => {
    // Récupération de l'ensemble des métiers
    console.log("---- DEBUT SAUVEGARDE FORMATION PAR NIVEAUX ---- \n")
    let ecoles = {};
    const metiers = await Metier.find({}).catch(error => {
        console.log(error)
    })
    // Récupération des formations qui permettent d'accéder directement à un metier
    let  domaine_fin2 = []
    await Global.asyncForEach(metiers, (async metier => {
        const formations_sortie = await Formation.find({ id_metier: metier._id}).select({nom: 1, domaine:1 }).catch(error => {
            console.log(error);
        });
        
        //On cherche les domaines en commun pour trouver les formations similaires
        let list_domaine = [];
        if (formations_sortie) {
            formations_sortie.forEach(formation => {
                list_domaine.push(formation.domaine);
            })
        }

        // console.log(list_domaine, '\n\n');
        let domaine_fin = list_domaine[0];
        // console.log(domaine_fin);
        //let domaine_fin2 = [];
    
        // On garde l'intersection entre les différents domaines
        list_domaine.forEach(secteur => {
            domaine_fin2 =  secteur.filter(domaine_recherche => {
                const domaine = domaine_fin.some(res_intermediaire => new RegExp(res_intermediaire).test(domaine_recherche));
                return domaine;
            });
        })
        // console.log('domaine_fin2', domaine_fin2, '\n\n');
        // console.log('domaine_fin final', domaine_fin);
        // if (list_domaine.length > 0) process.exit();

        regex_domaine_fin2 = domaine_fin2.map(function (domaine) { return new RegExp(domaine.trim(), "i"); });
    
        let list_formations = await Formation.aggregate([
            {
                $match: { domaine: { $in : regex_domaine_fin2 }}
            },{
                $sort: {niveau_sortie: 1}
            }, 
            {
                $group: {
                    _id: '$niveau_entree',
                    formations: {$push : { id: "$_id", code_formation : "$code_formation", id_ecole : "$id_ecole"}}
                    // forms: {$push : { nom : "$nom" , code_formation : "$code_formation", domaine:"$domaine"}} //noms: { $push : "$nom"  }
                }
    
            },
            { 
                $sort: {_id: 1}
            }
        ])

        const list_formations_new = [];
        await Global.asyncForEach(list_formations, (async niveau => {
            
            const code_formations = [];
            await Global.asyncForEach(niveau.formations, (async forma => {
                let location = null;
                if(ecoles[forma.id_ecole]) {
                    location = ecoles[forma.id_ecole].location;
                } else {
                    const ecole = await Ecole.findById(forma.id_ecole).select({"address.location": 1}).catch(error => {
                        console.log(error);
                    })
                    ecoles[forma.id_ecole] = { location: ecole.address.location};
                    location = ecole.address.location;
                }
                code_formations.push({ 
                    id: mongoose.Types.ObjectId(forma.id),
                    id_ecole: mongoose.Types.ObjectId(forma.id_ecole),
                    location: location
                });
            }));

            list_formations_new.push({'niveau_entree': niveau._id,'codes_formations': code_formations});
        }));
        // list_formations.forEach(f => {
        //     console.log('formation arth', f);
        // });

        const nouveauFormationsParNiveau = MetierFormation({
            nom: metier.nom,
            nom_recherche: Global.replaceSpecialChars(metier.nom),
            domaine_commun: domaine_fin2,
            id_metier: metier._id,
            formations:list_formations_new
        })

        await nouveauFormationsParNiveau.save().catch(error => {
            console.error(error.message);
        })

        // console.log("------------ END RES ------------------\n");
    }))

    process.exit();
})

