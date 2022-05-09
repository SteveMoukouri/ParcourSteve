const express = require('express');
const router = express.Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

const Parcours = require("../mongodb-schemas/parcours");
const Metier = require("../mongodb-schemas/metier");
const parcoursTools = require("../tools/parcours");

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

router.get('/selectFormation',async (req,res) => {
    const schema = Joi.object({
        city: Joi.string(),
        grade: Joi.number().min(0).max(8),
        job_id: Joi.objectId().required(),
    })
    try {
        const query = await schema.validateAsync(req.query);

        const formations = await parcoursTools.searchParcours2(query.job_id,query.grade,query.city).catch(error => {
            res.status(400).send(error.message)
        });

        res.status(200).json({
            text: "Les Formations correspondantes :",
            formations : formations
        });
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
        replace: Joi.boolean()
    });

    try {
        const body = await schema.validateAsync(req.body);
        const parcours = await parcoursTools.updateParcours(body.id_parcours, req.headers.userId, body.id_formation,body.index,body.replace).catch(error => {
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

module.exports = router;