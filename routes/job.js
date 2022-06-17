const express = require('express');
const router = express.Router();
const Joi = require('joi');
const GlobalFunc = require('../global');
Joi.objectId = require('joi-objectid')(Joi);


const Metier = require("../mongodb-schemas/metier");
const jobTools = require("../tools/jobTools")

router.get('/list', async (req,res) =>{
    const schema = Joi.object({
        limit: Joi.number().min(0).max(1000),
        page: Joi.number().min(0),
        nom: Joi.string(),
    });

    try {
        const query = await schema.validateAsync(req.query);
        
        const listMetier = await jobTools.list_job(query.limit, query.page, query.nom).catch(error => {
            res.status(400).send(error.message)
        })

        res.status(200).json({
            texte: "Liste de " + query.limit + " metiers",
            ecoles: listMetier
        })
    } catch(error) {
        res.status(400).send(error.message);
    }

})

router.get('/job_school',async (req,res) => {
    const schema = Joi.object({
        id_metier: Joi.objectId().required(),
        min: Joi.number().min(0),
        max: Joi.number(),
        lat: Joi.number().precision(8),
        lng:Joi.number().precision(8),
        address: Joi.string()
    })
    try {
        const query = await schema.validateAsync(req.query);

        let location = [];

        if(query.lat && query.lng) {
            location = [query.lng, query.lat];
        } else if (query.address) {
            const loc = await GlobalFunc.getLocation(query.address).catch(error => {
                res.status(400).send(error.message);
            });
            if(loc) {
                location = [loc.lng, loc.lat]
            }
        } else {
            res.status(400).send('Veuillez saisir une adresse ou lat/lng');
        }

        if(location.length === 2) {
            console.log(location);

            const ecole = await jobTools.find_school(query.id_metier,location,query.min,query.max).catch(error => {
                res.status(400).send(error.message)
            });

            res.status(200).json({
                text: "La liste des ecoles est : ",
                ecoles : ecole
            });
        }
    } catch(error) {
        if (error.details.length > 0 && error.details) {
            console.log(error.details[0].type);
            if (error.details[0].type === 'string.pattern.name') {
                console.log('hey')
                res.status(400).send("Erreur dans l'un des paramètres");
            } else {
                console.log('hi');
                res.status(400).send(error.message);
            }
        } else {
            res.status(400).send(error.message);
        }
    }
})

module.exports = router;