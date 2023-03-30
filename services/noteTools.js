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

	static getRatingsParcours(id_parcours=undefined,job_id=undefined,filter=undefined,date=false){
		/* Obtenir les parcours les mieux notés */

		let sort_parameter = {};

		switch(filter) {
			case "cost":
				sort_parameter = {
					average_satisfaction_cout_formations:-1,
					average_satisfaction_generale: -1,
					average_satisfaction_domaine_formations:-1,
					average_satisfaction_localisation:-1
				}
				break;
			case null:
				sort_parameter = {
					average_satisfaction_generale: -1,
					average_satisfaction_cout_formations:-1,
					average_satisfaction_domaine_formations:-1,
					average_satisfaction_localisation:-1
				}
			default:
				sort_parameter = {
					average_satisfaction_generale: -1,
					average_satisfaction_cout_formations:-1,
					average_satisfaction_domaine_formations:-1,
					average_satisfaction_localisation:-1
				}
		}

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

					}
		
				},
				{
					$sort: sort_parameter
				}
			]).catch(error => {
				reject(error)
			})
			
			if(listNote){
				/* On modifie l'array de sortie pour avoir la date et 
				le nom du parcours ainsi que le metier associe*/

				let arrayParcours = [];
				await Global.asyncForEach(listNote,(async note => {
					const parcoursFull = await Parcours.findById(note._id).select({nom: 1, createdAt:1,id_metier:1 }).catch(error => {
						reject(error);
					})

					arrayParcours.push(parcoursFull);
				}))

				if(arrayParcours.length > 0){

					let listNotewithDate = listNote.map((note, key) => {

						const item2 = arrayParcours.find(parcours => {
							if(parcours._id.equals(mongoose.Types.ObjectId(note._id))){
								arrayParcours = arrayParcours.slice(1); //on retire le parcours deja present pour les iterations suivantes
								return true;
							} 

						});

						if(item2){
							return {
								key: key,
								id: note._id,
								nom: item2.nom,
								id_metier: item2.id_metier,
								createdAt: item2.createdAt,
								average_satisfaction_generale: note.average_satisfaction_generale,
								average_satisfaction_cout_formations: note.average_satisfaction_cout_formations,
								average_satisfaction_domaine_formations: note.average_satisfaction_domaine_formations,
								average_satisfaction_localisation: note.average_satisfaction_localisation,
	
							}
						}else{
							reject(new Error("Une erreur est survenue dans la liste des parcours"));
						}

					});

					if(listNotewithDate.length > 0){
						if(id_parcours){
							// Dans ce cas on veut les notes d'un parcours precis
							const result = listNotewithDate.find(ratings => {
								return ratings.id.equals(mongoose.Types.ObjectId(id_parcours));
							});
							if(result){
								resolve(result);
								return; // si on cherche la note d'un parcours precis on s arrete lorsqu'on le trouve
							}else{
								reject(new Error("Aucune note n a ete attribue à ce parcours"));
							}
						}

						if(date){
							// Dans ce cas l'utilisateur veut les parcours les plus recents
							listNotewithDate = listNotewithDate.sort((date1,date2) => date2.createdAt - date1.createdAt)
						}

						if(job_id){
							// Dans ce cas l utilisateur veut les parcours correspondant à un metier
							listNotewithDate = listNotewithDate.filter(parcours => {
								if(parcours.id_metier.equals(mongoose.Types.ObjectId(job_id))){
									return true;
								}
							});
							if(listNotewithDate.length > 0){
								resolve(listNotewithDate);
								return;

							}else{
								reject(new Error("Aucun parcours n a ete cree pour ce metier"));
							}
						}

						resolve(listNotewithDate);

					}else{
						reject(new Error("Une erreur est survenue lors de la recherche "));
					}

				}

			}else{
				reject(new Error("Aucun parcours noté à ce jour"));
			}
		})
	}
}

				