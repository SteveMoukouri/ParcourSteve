const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const Ecole = require('../mongodb-schemas/ecole');
const userTools = require('../services/user.service');
const Users = require("../mongodb-schemas/user");
const UserTools = require('../services/user.service');

module.exports = {
	hey: async (req, res) => {
		res.send(`Salut ${req.params.nom} ${req.params.prenom}`)
	},
	get: async (req, res) => {
		const user = await UserTools.get(req.params.username, req.headers.userId).catch(error =>{
			res.status(400).send(error.message);
		});
		if(user){
			user.password = undefined;
			res.status(200).json({
				message: "Voici le profile de l'utilisateur",
				user: user,
			})
		}
	},

	update: async (req,res) => {
		// const schema = Joi.object({
		// 	name: Joi.object({
		// 		first: Joi.string().required(),
		// 		last: Joi.string().required()
		// 	}),
		// 	address: Joi.object({
		// 		country: Joi.string().required(),
		// 		location: Joi.object({
		// 			coordinates: Joi.array().items(Joi.number()),
		// 			_id: Joi.objectId(),
		// 			type: Joi.string()
		// 		}),
		// 		city: Joi.string().required()
		// 	}),
		// 	public: Joi.boolean().required(),
		// 	_id: Joi.objectId(),
		// 	password: Joi.string().required(),
		// 	department: Joi.string().required(),
		// 	ciaddrty: Joi.object({}) Joi.string().required(),
		// 	region: Joi.string().required(),
			
		// 	twitter: Joi.string().regex(new RegExp("^twitter\.com\/.+")),
		// 	instagram: Joi.string().regex(new RegExp("^instagram\.com\/.+")),
		// 	facebook: Joi.string().regex(new RegExp("^facebook\.com\/.+")),
		// 	linkedin: Joi.string().regex(new RegExp("^linkedin\.com\/in\/.+")),
		// 	about: Joi.string().required()
		// });
	
		try {
			//const body = await schema.validateAsync(req.body);
			const userUpdate = await UserTools.update(req.headers.userId, 
				req.body.profile).catch(error => {
				res.status(400).send(error.message)
			});
			if(userUpdate){
				res.status(200).json({
					text: "L'utilisateur a bien été modifié",
					user : userUpdate
				});
			}
		  
		} catch(error) {
			res.status(400).send(error.message);
		}
	
	},

	list: async (req,res) => {
		const schema = Joi.object({
			limit: Joi.number().min(0).max(1000),
			page: Joi.number().min(0),
			username: Joi.string(),
		});
	
		try {
			const query = await schema.validateAsync(req.query);
			
			const listUser = await UserTools.list(query.limit, query.page, query.username).catch(error => {
				res.status(400).send(error.message)
			})
	
			res.status(200).json({
				texte: "Liste de " + query.limit + " Uutilisateurs",
				users: listUser
			})
		} catch(error) {
			res.status(400).send(error.message);
		}
	
	}
}