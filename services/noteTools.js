const mongoose = require('mongoose');

const Note = require("../mongodb-schemas/notation_ecole");
const Note_parcours = require("../mongodb-schemas/notation_parcours");
const Detail_note = require("../mongodb-schemas/child/note");
const Follow = require('../mongodb-schemas/follow');
const User = require('../mongodb-schemas/user');

const followTools = require('./follow');

const Global = require('../global');
const Parcours = require('../mongodb-schemas/parcours');
//const GlobalFunc = require('../global');


module.exports = class NoteTools {

    constructor() {}

    static addNote(id_ecole,id_user,satisfaction_generale,
		satisfaction_cours_et_prof=0,
		satisfaction_encadrement=0,
		satisfaction_locaux = 0,
		satisfaction_reseau_etudiant = 0,
		satisfaction_vie_associative = 0,
		satisfaction_ouverture_internationale = 0,
		satisfaction_relations_avec_les_entreprises = 0,
		satisfaction_preparation_vie_active = 0,
		satisfaction_qualite_services_dedie_aux_etudiants = 0,
		satisfaction_relations_entre_etudiants = 0,
		satisfaction_accompagnement_projet_personnel = 0){
			return new Promise(async(resolve,reject) => {

				const detailNote = {
					satisfaction_generale : satisfaction_generale,
					satisfaction_cours_et_prof : satisfaction_cours_et_prof,
					satisfaction_encadrement : satisfaction_encadrement,
					satisfaction_locaux : satisfaction_locaux,
					satisfaction_reseau_etudiant : satisfaction_reseau_etudiant,
					satisfaction_vie_associative : satisfaction_vie_associative,
					satisfaction_ouverture_internationale : satisfaction_ouverture_internationale,
					satisfaction_relations_avec_les_entreprises : satisfaction_relations_avec_les_entreprises,
					satisfaction_preparation_vie_active : satisfaction_preparation_vie_active,
					satisfaction_qualite_services_dedie_aux_etudiants : satisfaction_qualite_services_dedie_aux_etudiants,
					satisfaction_relations_entre_etudiants : satisfaction_relations_entre_etudiants,
					satisfaction_accompagnement_projet_personnel : satisfaction_accompagnement_projet_personnel
				}
				

				const actual_note = await Note.findOne({user_id: mongoose.Types.ObjectId(id_user),id_ecole: mongoose.Types.ObjectId(id_ecole)}).catch(error => {
					reject(error);
				});

				if(actual_note){
					const update_note = await Note.findOneAndUpdate({user_id: mongoose.Types.ObjectId(id_user),id_ecole: mongoose.Types.ObjectId(id_ecole)}, {note:detailNote}, {new:true}).catch(error => {
						reject (error);
					});
					resolve(update_note);
				}else{
					const note = new Note({
						user_id: id_user,
						ecole_id: id_ecole,
						note:detailNote
					})

					const noteBDD = await note.save().catch(error => {
						reject(error);
					})

					resolve(noteBDD);
				}
			})
		}
	
	static addNoteParcours(id_parcours,id_user,satisfaction_generale,
		satisfaction_cout_formations=0,
		satisfaction_localisation=0,
		satisfaction_domaine_formations=0){
			return new Promise(async(resolve,reject) => {

				const detailNote = {
					satisfaction_generale : satisfaction_generale,
					satisfaction_cout_formations : satisfaction_cout_formations,
					satisfaction_localisation : satisfaction_localisation,
					satisfaction_domaine_formations : satisfaction_domaine_formations
				}
				

				const actual_note = await Note_parcours.findOne({user_id: mongoose.Types.ObjectId(id_user),parcours_id: mongoose.Types.ObjectId(id_parcours)}).catch(error => {
					reject(error);
				});

				console.log("note actuel : \n",actual_note);

				if(actual_note){
					const update_note = await Note_parcours.findOneAndUpdate({user_id: mongoose.Types.ObjectId(id_user),parcours_id: mongoose.Types.ObjectId(id_parcours)}, {note:detailNote}, {new:true}).catch(error => {
						reject (error);
					});
					resolve(update_note);
				}else{
					const note = new Note_parcours({
						user_id: id_user,
						parcours_id: id_parcours,
						note:detailNote
					})

					const noteBDD = await note.save().catch(error => {
						reject(error);
					})

					resolve(noteBDD);
				}
			})
		}

		static getFavUserParcours(my_id,id_user){
			/* Obtenir les parcours favori d'un utilisateur */

			return new Promise(async (resolve,reject) => {

				const user_profile = await User.findById(id_user).catch(error => {
					reject(error);
				})

				if(!Global.isValidObjectId(id_user)){
					reject(new Error ("L'id utilisé est invalide !"))
				}

				if(mongoose.Types.ObjectId(my_id).equals(mongoose.Types.ObjectId(id_user)) || 
					followTools.isFollower(my_id,id_user) || user_profile.public){
						const list_fav_parcours = await Note_parcours.find({user_id:id_user}).sort({'note.satisfaction_generale':1,
						'note.satisfaction_cout_formations':-1,'note.satisfaction_localisation':-1,
						'note.satisfaction_domaine_formations':-1}).catch(error => {
								reject(error);
							})
					resolve(list_fav_parcours);
	
				}else {
					reject(new Error("Impossible d'acceder aux favoris"));
				}
			})
		}

		static getRatingsParcours(id_parcours=undefined){
			/* Obtenir les parcours les mieux notés */

			return new Promise(async (resolve,reject) => {
				const listNote = await Note_parcours.aggregate([
					/* On fait l'aggregation des différentes notes par parcours 
					   pour obtenir la moyenne par critère*/

					{
						$group: {
							_id: '$parcours_id',
							average_satisfaction_generale: { $avg: "$note.satisfaction_generale" },
							average_satisfaction_cout_formations: { $avg: "$note.satisfaction_cout_formations" },
							average_satisfaction_localisation: { $avg: "$note.satisfaction_localisation" },
							average_satisfaction_domaine_formations: { $avg: "$note.satisfaction_domaine_formations" }


							//formations: {$push : { id: "$_id", code_formation : "$code_formation", id_ecole : "$id_ecole"}}
							// forms: {$push : { nom : "$nom" , code_formation : "$code_formation", domaine:"$domaine"}} //noms: { $push : "$nom"  }
						}
			
					},
					{
						$sort: {
							average_satisfaction_generale: -1,
							average_satisfaction_cout_formations:-1,
							average_satisfaction_domaine_formations:-1,
							average_satisfaction_localisation:-1
						}
					}
				]).catch(error => {
					reject(error)
				})

				console.log(listNote);
				if(listNote){
					/* On modifie l'array de sortie pour avoir la date et 
					le nom du parcours*/

					let arrayParcours = [];
					await Global.asyncForEach(listNote,(async note => {
						const parcoursFull = await Parcours.findById(note._id).select({nom: 1, createdAt:1 }).catch(error => {
							reject(error);
						})

						arrayParcours.push(parcoursFull);
					}))

					if(arrayParcours.length > 0){

						const listNotewithDate = listNote.map((note, key) => {
							const item2 = arrayParcours.find(parcours => {
								parcours._id.equals(mongoose.Types.ObjectId(note._id));
							});

							if(item2){
								return {
									key: key,
									id: note._id,
									nom: item2.nom,
									createdAt: item2.createdAt,
									average_satisfaction_generale: note.average_satisfaction_generale,
									average_satisfaction_cout_formations: note.average_satisfaction_cout_formations,
									average_satisfaction_domaine_formations: note.average_satisfaction_domaine_formations,
									average_satisfaction_localisation: note.average_satisfaction_localisation,
		
								}
							}else{
								reject(new Error("Une erreur est survenue dans la liste des parcours"));
							}
							console.log("listNote vaut : \n",listNote);
	
						});
	
						if(id_parcours){
							const result = listNote.find(ratings => {
								return ratings._id.equals(mongoose.Types.ObjectId(id_parcours));
							});
							if(result){
								resolve(result);
							}else{
								reject(new Error("Aucune note n a ete attribue à ce parcours"));
							}
						}else{
							resolve(listNote)
						}
					}

				}else{
					reject(new Error("Aucun parcours noté à ce jour"))
				}


			})
		}

		static getRatingsParcours2(popular=true, date=false){
			
		}
}

				