const express = require('express');
const router = express.Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

const Parcours = require("../mongodb-schemas/parcours");
const Metier = require("../mongodb-schemas/metier");
const parcoursTools = require("../tools/parcours");

const Global = require("../global");

router.get('/selectJob', async (req,res) =>{
    console.log(req.headers.userId);
    const schema = Joi.object({
        nom: Joi.string()
    })

    try{
        const query = await schema.validateAsync(req.query);

        const job = await parcoursTools.searchParcours1(query.nom).catch( error => {
            res.status(400).send(error.message);
        })
        res.status(200).json({
            text: "Les metiers qui correspondent :",
            job: job
        })
    } catch (error){
        res.status(400).send(error.message);
    }

})

router.post('/selectFormation',async (req,res) => {
    const schema = Joi.object({
        grade: Joi.number().min(0).max(8),
        parcours_id: Joi.objectId().required(),
        lat: Joi.number().precision(8),
        lng:Joi.number().precision(8),
        address: Joi.string(),
        list_profile:Joi.array().items(Joi.string()),
        type_ecole:Joi.string(),
        limit:Joi.number().max(200)
    })
    try {
        const body = await schema.validateAsync(req.body);

        let location = [];

        if(body.lat && body.lng) {
            location = [body.lng, body.lat];
        } else if (body.address) {
            const loc = await Global.getLocation(body.address).catch(error => {
                res.status(400).send(error.message);
            });
            if(loc) {
                location = [loc.lng, loc.lat]
            }
        } else {
            res.status(400).send('Veuillez saisir une adresse ou lat/lng');
        }

        const formations = await parcoursTools.searchParcours2(body.parcours_id, body.grade, req.headers.userSexe, body.list_profile, body.type_ecole,location,body.limit).catch(error => {
            res.status(400).send(error.message)
        });

        if(formations){
            res.status(200).json({
                text: "Les Formations correspondantes :",
                formations : formations
            });
        }else{
            res.status(400).send("Un problème est survenu dans votre requete")
        }

    }catch(error){
        res.status(400).send(error.message);
    }
})

router.post('/create', async (req,res) =>{
    const schema = Joi.object({
        name: Joi.string().required(),
        job_id: Joi.objectId().required()
    });

    try {
        const body = await schema.validateAsync(req.body);
        let formations = [];

        const nouveauParcours = Parcours({
            nom:body.name,
            user_id: req.headers.userId,
            formations:formations,
            id_metier: body.job_id,
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
    } catch(error) {
        res.status(400).send(error.message);
    }

})


router.post('/update', async (req,res) =>{
    const schema = Joi.object({
        id_parcours: Joi.objectId().required(),
        id_formation: Joi.objectId(),
        index : Joi.number(),
        replace: Joi.boolean(),
        isPublic: Joi.boolean()
    });

    try {
        const body = await schema.validateAsync(req.body);
        const parcours = await parcoursTools.updateParcours(body.id_parcours, req.headers.userId, body.id_formation,body.index,body.replace,body.isPublic).catch(error => {
            res.status(400).send(error.message)
        })
        if(parcours){
            res.status(200).json({
                text: "Le parcours a bien été modifié",
                formation : parcours
            })
        }
      
    } catch(error) {
        res.status(400).send(error.message);
    }

})

router.get('/list',async (req,res) => {
    const schema = Joi.object({
        nom: Joi.string(),
        limit: Joi.number(),
        page: Joi.number().min(0),
    })
    try {
        const query = await schema.validateAsync(req.query);

        const parcours = await parcoursTools.list_Parcours(query.limit,query.page,query.nom,req.headers.userId).catch(error => {
            res.status(400).send(error.message)
        });

        res.status(200).json({
            text: "La liste des parcours est : ",
            parcours : parcours
        });
    }catch(error){
        res.status(400).send(error.message);
    }
})

router.post('/addHelper', async (req,res) =>{
    const schema = Joi.object({
        id_parcours: Joi.objectId().required(),
        helperId: Joi.objectId().required()
    });

    try {
        const body = await schema.validateAsync(req.body);
        const parcours = await parcoursTools.addHelper(body.id_parcours, req.headers.userId, body.helperId).catch(error => {
            res.status(400).send(error.message);
        })
        if(parcours){
            res.status(200).json({
                text: "Le collaborateur a bien été ajouté",
                parcours : parcours
            })
        }
      
    } catch(error) {
        res.status(400).send(error.message);
    }

})

router.delete('/delete', async (req,res) => {
    const schema = Joi.object({
        parcoursId: Joi.objectId().required()
    });
    try {
        const body = await schema.validateAsync(req.body);

        const done = await parcoursTools.deleteParcours(body.parcoursId,req.headers.userId).catch(error => {
            res.status(400).send(error.message)
        });

        if(done) {
            res.status(200).json({
                text: "Le parcours a bien été supprimé "
            });
        }
    }catch(error){
        res.status(400).send(error.message);
    }
})

router.get('/formations',async (req,res) => {
    const schema = Joi.object({
        parcoursId: Joi.objectId().required()
    });

    try {
        const query = await schema.validateAsync(req.query);
        const list_formations = await parcoursTools.list_parcours_formations(query.parcoursId, req.headers.userId).catch(error =>{
            res.status(400).send(error.message);
        });
        if(list_formations){
            res.status(200).json({
                message: "La liste des formations du parcours",
                formations: list_formations.formations,
                parcours_name: list_formations.parcours_name
            })
        }
    }catch(error){
        res.status(400).send(error.message);
    }
})

module.exports = router;