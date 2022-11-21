const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const NeedHelp = require('../mongodb-schemas/need_help');
const User = require('../mongodb-schemas/user');
const helpTool = require('../services/need_help');

module.exports = {
	
	list: async (req,res) => {
		const schema = Joi.object({
			username: Joi.string(),
			limit: Joi.number(),
			page: Joi.number().min(0),
		})
		try {
			const query = await schema.validateAsync(req.query);
	
			const requestList = await helpTool.list_Request(query.limit,query.page,query.nom,query.username).catch(error => {
				res.status(400).send(error.message)
			});
	
			res.status(200).json({
				text: "La liste des demande d'aide est : ",
				requestList : requestList
			});
		}catch(error){
			res.status(400).send(error.message);
		}
	},

	add: async (req,res) =>{
		const schema = Joi.object({
			request_id: Joi.objectId().required()
		});
	
		try {
			const body = await schema.validateAsync(req.body);
			const update_request = await helpTool.addHelper(body.request_id, req.headers.userId).catch(error => {
				res.status(400).send(error.message)
			})
			if(update_request){
				res.status(200).json({
					text: "L' helper a bien été rajouté",
					formation : update_request
				})
			}
		  
		} catch(error) {
			res.status(400).send(error.message);
		}
	
	},

	create: async (req,res) =>{
		const schema = Joi.object({
			firstname: Joi.string(),
			lastname: Joi.string(),
			message: Joi.string().required(),
			job_id: Joi.objectId().required()
		});
	
		try {
			const body = await schema.validateAsync(req.body);
			const user = await User.findOne({_id:req.headers.userId}).catch(error => {
				res.status(400).send(error.message);
			});
			console.log(user);
	
			
			if(user){
				console.log("Je Rentre dans le IF ------- \n",body.firstname);
				const nouvelleDemande = new NeedHelp({
					username:user.username,
					name:{
						first:(body.firstname === undefined) ? user.first : body.firstname,
						last:(body.lastname === undefined) ? user.last : body.lastname
					},
					date:new Date(),
					user_id: req.headers.userId,
					id_metier: body.job_id,
					message:body.message,
					helpers:[]
				})
				console.log("Sauvegarde dans la bgg")
				nouvelleDemande.save((error,nouvelleDemandeBDD) => {
					if(error){
						res.status(400).send(error.message)
					}else{
						res.status(200).json({
							texte: "Ajouté !",
							parcours: nouvelleDemandeBDD
						});
					}
				})
			}
	
		} catch(error) {
			res.status(400).send(error.message);
		}
	
	}

}