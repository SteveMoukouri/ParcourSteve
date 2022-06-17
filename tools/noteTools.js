const mongoose = require('mongoose');

const Note = require("../mongodb-schemas/notation_ecole");
const Detail_note = require("../mongodb-schemas/child/note");
const User = require('../mongodb-schemas/user');
const Global = require('../global');


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
					note = new Note({
						user_id: id_user,
						ecole_id: id_ecole,
						note:detailNote
					})

					noteBDD = await note.save().catch(error => {
						reject(error);
					})

					resolve(noteBDD);
				}
			})
		}
}

				