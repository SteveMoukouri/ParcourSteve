const mongoose = require('mongoose');

const Formation = require('../mongodb-schemas/formation');
const Ecole = require('../mongodb-schemas/ecole');
const Metier = require('../mongodb-schemas/metier');

const ParcoursFunc = require('./parcours');
const Global = require('../global');


module.exports = class FormationTools {
	constructor() {}

	// static detail_formation(idFormation){
    //     return new Promise( async (resolve,reject) => {

    //         const formation = Formation.findById(idFormation).catch(error => {
    //             reject(error);
    //         });
    //         if (formation){
    //             resolve(formation);
    //         }else{
    //             reject(new Error("formation introuvable"));
    //         }
    //     })
    // } 

    static get_school_formations(idEcole,limit = 30, page=0){
		if(limit > 40) { limit = 40; }
        return new Promise( async (resolve,reject) => {

            const list_formation = await Formation.find({id_ecole:idEcole}).skip(limit*page).limit(limit).catch(error => {
                reject(error);
            });
            if (list_formation){
                resolve(list_formation);
            }else{
                reject(new Error("formation introuvable"));
            }
        })
    }

	// static list_all(limit = 100, page=0){
	// 	if(limit > 1000) { limit = 1000; }

	// 	return new Promise (async (resolve,reject) => {
	// 		const list_formation = Formation.find().skip(limit*page).limit(limit).catch(error => {
	// 			reject(error);
	// 		})
	// 		if(list_formation){
	// 			resolve(list_formation);
	// 		}else{
	// 			reject (new Error("Impossible de lister les formations"));
	// 		}
	// 	})
	// }

	static add (nom,code_formation,id_onisep,code_rncp,
		domaine,type_formation,nature_formation,niveau_sortie,
		duree_cycle_standard,url_diplome,
		cout_scolarite,modalite_scolarite,code_uai_ecole,
		id_ecole,id_metier){

			return new Promise( async (resolve,reject) => {

				const ecole = await Ecole.findById(id_ecole).catch(error => {
					reject (error);
				})
	
				const metier = await Metier.findById(id_metier).catch(error => {
					reject (error);
				})
	
				if(ecole && metier){
	
					const nouvelleFormation = new Formation({
						nom: nom,
						nom_recherche: Global.replaceSpecialChars(nom),
						code_formation: code_formation,
						id_onisep: id_onisep,
						code_rncp: code_rncp,
						domaine: domaine.split(/[,|]/),
						type_formation: type_formation,
						nature_formation: nature_formation,
						niveau_sortie: Number((niveau_sortie).replace(/\D/g, '')),
						niveau_entree: ParcoursFunc.triFormation(niveau_sortie, duree_cycle_standard),
						duree_cycle_standard: duree_cycle_standard,
						url_diplome: url_diplome,
						cout_scolarite: cout_scolarite,
						modalite_scolarite: modalite_scolarite,
						date_modif: moment(date_modif, 'DD/MM/YYYY').toDate(),
						code_uai_ecole: code_uai_ecole,
						id_ecole:id_ecole,
						id_metier: id_metier,
						note:{satisfaction_generale:0}
					})
	
					const nouvelleFormationBDD = await nouvelleFormation.save().catch(error => {
						console.error(error.message);
					});
	
					if(nouvelleFormationBDD){
	
						resolve(nouvelleFormationBDD)
					}else{
						reject(new Error("Erreur lors de la sauvegarde de la formation"));
					}
	
				}else{
					reject(new Error("L ecole ou le metier sont introuvable"))
				}
			})



		}	
}