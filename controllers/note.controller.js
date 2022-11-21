const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const NoteTools = require("../services/noteTools");

module.exports = {
	add : async (req,res) =>{
		const schema = Joi.object({
			id_ecole: Joi.objectId().required(),
			satisfaction_generale:Joi.number().min(0).max(5).required(),
			satisfaction_cours_et_prof:Joi.number().min(0).max(5),
			satisfaction_encadrement:Joi.number().min(0).max(5),
			satisfaction_locaux:Joi.number().min(0).max(5),
			satisfaction_reseau_etudiant:Joi.number().min(0).max(5),
			satisfaction_vie_associative:Joi.number().min(0).max(5),
			satisfaction_ouverture_internationale:Joi.number().min(0).max(5),
			satisfaction_relations_avec_les_entreprises:Joi.number().min(0).max(5),
			satisfaction_preparation_vie_active:Joi.number().min(0).max(5), // correlation cours / métier
			satisfaction_qualite_services_dedie_aux_etudiants:Joi.number().min(0).max(5),
			satisfaction_relations_entre_etudiants:Joi.number().min(0).max(5),
			satisfaction_accompagnement_projet_personnel:Joi.number().min(0).max(5)
		});
	
		try {
			const body = await schema.validateAsync(req.body);
			const note = await NoteTools.addNote(body.id_ecole,req.headers.userId, body.satisfaction_generale,
				body.satisfaction_cours_et_prof,
				body.satisfaction_encadrement,
				body.satisfaction_locaux,
				body.satisfaction_reseau_etudiant,
				body.satisfaction_vie_associative,
				body.satisfaction_ouverture_internationale,
				body.satisfaction_relations_avec_les_entreprises,
				body.satisfaction_preparation_vie_active,
				body.satisfaction_qualite_services_dedie_aux_etudiants,
				body.satisfaction_relations_entre_etudiants,
				body.satisfaction_accompagnement_projet_personnel).catch(error => {
				res.status(400).send(error.message)
			});
	
			if (note) {
				res.status(200).json({
					texte: "Votre note a bien ete ajoutee",
					note: note
				});
			}
		} catch(error) {
			res.status(400).send(error.message);
		}
	
	},

	addNoteParcours: async (req,res) => {
		const schema = Joi.object({
			id_parcours: Joi.objectId().required(),
			satisfaction_generale:Joi.number().min(0).max(5).required(),
			satisfaction_cout_formations:Joi.number().min(0).max(5),
			satisfaction_localisation:Joi.number().min(0).max(5),
			satisfaction_domaine_formations:Joi.number().min(0).max(5)
		});
		try {
			const body = await schema.validateAsync(req.body);
			const note = await NoteTools.addNoteParcours(body.id_parcours,req.headers.userId,
				body.satisfaction_generale,body.satisfaction_cout_formations,
				body.satisfaction_localisation,body.satisfaction_domaine_formations).catch(error => {
					console.log("L'erreur est ici 1 \n");
					res.status(400).send(error.message)
			});

			if (note) {
				res.status(200).json({
					texte: "Votre note a bien ete ajoutee",
					note: note
				});
			}
		}catch(error) {
			res.status(400).send(error.message);
		}	

	},

	getFavUserParcours: async (req,res) => {

		try {
			const listParcours = await NoteTools.getFavUserParcours(req.headers.userId,req.params.id_user).catch(error =>{
				res.status(400).send(error.message);
			});
			if(listParcours){
				res.status(200).json({
					texte:"Voici la liste des parcours les mieux notés de l'utilisateur",
					listParcours:listParcours
				})
			}
		} catch (error) {
			res.status(400).send(error.message);
		}
	},

	getRatingsParcours:async (req,res) => {

		const schema = Joi.object({
			id_parcours: Joi.objectId()
		})

		try {
			const query = await schema.validateAsync(req.query);
			const ratings = await NoteTools.getRatingsParcours(query.id_parcours).catch(error =>{
				res.status(400).send(error.message);
			});

			if(ratings){
				res.status(200).json({
					texte:"Voici la moyenne des notes par criteres",
					notes:ratings
				})
			}
		} catch (error) {
			res.status(400).send(error.message);
		}
	},

}