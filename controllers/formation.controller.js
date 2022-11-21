const Joi = require('joi');
const GlobalFunc = require('../global');
Joi.objectId = require('joi-objectid')(Joi);

const formationTools = require('../services/formationTools')
const Formation = require("../mongodb-schemas/formation");

module.exports = {

	// list: async (req,res) =>{
	// 	const schema = Joi.object({
	// 		limit: Joi.number().min(0).max(1000),
	// 		page: Joi.number().min(0),
	// 	});
	
	// 	try {
	// 		const query = await schema.validateAsync(req.query);
			
	// 		const listFormation = await formationTools.list_all(query.limit, query.page, query.nom).catch(error => {
	// 			res.status(400).send(error.message)
	// 		})
	
	// 		res.status(200).json({
	// 			texte: "Liste de " + query.limit + " metiers",
	// 			ecoles: listFormation
	// 		})
	// 	} catch(error) {
	// 		res.status(400).send(error.message);
	// 	}
	
	// },

	list_school_formations: async(req,res) => {
		const schema = Joi.object({
			id_ecole: Joi.objectId().required(),
			limit: Joi.number().min(0).max(40),
	 		page: Joi.number().min(0),
		})
		try {
			const query = await schema.validateAsync(req.query);
			const listFormation = await formationTools.get_school_formations(query.id_ecole,query.limit, query.page).catch(error => {
				res.status(400).send(error.message);
			})

			if(listFormation){
				res.status(200).json({
					message:"Voici les formations associées",
					formations: listFormation
				})
			}else{
				res.status(400).send("Erreur dans le service formation");
			}

			
		} catch (error) {
			res.status(400).send(error.message);
		}

	},

	add: async (req,res) => {
		const schema = Joi.object({
			id_metier: Joi.objectId().required(),
			nom: Joi.string(),
			code_formation: Joi.string(),
			id_onisep: Joi.string(),
			code_rncp: Joi.string(),
			domaine: Joi.array().items(Joi.string()),
			type_formation: Joi.string(),
			nature_formation: Joi.string(),
			niveau_sortie: Joi.number(),
			duree_cycle_standard: Joi.string(),
			url_diplome: Joi.string(),
			cout_scolarite: Joi.string(),
			modalite_scolarite: Joi.string(),
			code_uai_ecole: Joi.string(),
			id_ecole:Joi.objectId().required(),
			id_metier: Joi.objectId().required(),
		})
		try {
			const body = await schema.validateAsync(req.body);
			const nouvelleFormation = formationTools.add(body.nom,body.code_formation,body.id_onisep,body.code_rncp,
				body.domaine,body.type_formation,body.nature_formation,
				body.niveau_sortie,body.duree_cycle_standard,body.url_diplome,
				body.cout_scolarite,body.modalite_scolarite,body.code_uai_ecole,
				body.id_ecole,body.id_metier)
	
			if(nouvelleFormation){
				res.status(200).json({
					message:"Formation ajoutée",
					formation:nouvelleFormation
				})
			}else{
				res.status(400).send("erreur lors de l'ajout de la formation")
			}
		} catch(error) {
			res.status(400).send(error.message);
		}
	}

}