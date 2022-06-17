const express = require('express');
const router = express.Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);


const followTools = require('../tools/follow');

router.post('/addFollow', async (req,res) =>{
    const schema = Joi.object({
        id_follow: Joi.objectId().required()
    });

    try {
        const body = await schema.validateAsync(req.body);
        const follows = await followTools.addFollow(req.headers.userId, body.id_follow).catch(error => {
            res.status(400).send(error.message)
        });

        if (follows) {
            res.status(200).json({
                texte: "Vous suivez bien cette utilisateur",
                follow: follows
            });
        }
    } catch(error) {
        res.status(400).send(error.message);
    }

})

router.get('/listFollow', async (req,res) =>{
    const schema = Joi.object({
        limit: Joi.number().min(0).max(1000),
        page: Joi.number().min(0),
    });

    try {
        const query = await schema.validateAsync(req.query);
        
        const listFollow = await followTools.list_Follow(query.limit, query.page, req.headers.userId).catch(error => {
            res.status(400).send(error.message)
        })

        res.status(200).json({
            texte: "Liste de " + query.limit + " utilisateurs suivis",
            follow: listFollow
        })
    } catch(error) {
        res.status(400).send(error.message);
    }

})

router.get('/listFollower', async (req,res) =>{
    const schema = Joi.object({
        limit: Joi.number().min(0).max(1000),
        page: Joi.number().min(0),
    });

    try {
        const query = await schema.validateAsync(req.query);
        
        const listFollower = await followTools.list_Follower(query.limit, query.page, req.headers.userId).catch(error => {
            res.status(400).send(error.message)
        })

        res.status(200).json({
            texte: "Liste de " + query.limit + " utilisateurs qui vous suivent",
            follower: listFollower
        })
    } catch(error) {
        res.status(400).send(error.message);
    }

})

module.exports = router;