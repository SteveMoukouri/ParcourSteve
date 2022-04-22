const express = require('express');
const router = express.Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const NeedHelp = require('../mongodb-schemas/need_help');
const User = require('../mongodb-schemas/user');
const helpTool = require('../tools/need_help');


router.post('/create', async (req,res) =>{
    const schema = Joi.object({
        firstname: Joi.string(),
        lastname: Joi.string(),
        message: Joi.string().required(),
        job_id: Joi.objectId().required()
    });

    try {
        const body = await schema.validateAsync(req.body);
        const user = await User.findOne({username:req.headers.userId}).catch(error => {
            res.status(400).send(error.message);
        });

        if(user){
            const nouvelleDemande = NeedHelp({
                username:user.username,
                name:{
                    first:user.first,
                    last:user.last
                },
                date:new Date(),
                user_id: req.headers.userId,
                id_metier: body.job_id,
                message:body.message,
                helpers:[]
            })
            nouveauParcours.save((error,nouveauParcoursBDD) => {
                if(error){
                    res.status(400).send(error.message)
                }else{
                    res.status(200).json({
                        texte: "Ajouté !",
                        parcours: nouveauParcoursBDD
                    });
                }
            })
        }

    } catch(error) {
        res.status(400).send(error.message);
    }

})

module.exports = router;

