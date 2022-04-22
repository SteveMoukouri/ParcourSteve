const express = require('express');
const router = express.Router();
const Joi = require('joi');

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
        console.log("on affiche le resultat");

        res.status(200).json({
            texte: "Liste de " + query.limit + " metiers",
            ecoles: listMetier
        })
    } catch(error) {
        res.status(400).send(error.message);
    }

})

module.exports = router;