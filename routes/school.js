const express = require('express');
const router = express.Router();
const Joi = require('joi');

const Ecole = require('../mongodb-schemas/ecole');
const ecoleTools = require('../tools/ecoleTools');

router.get('/', (req, res) => {
    res.send('API works');
});

router.post('/add',async (req,res) => {
    const schema = Joi.object({
        nom: Joi.string().required().max(100),
        public: Joi.boolean().required(),
        adresse: Joi.object({
            departement: Joi.string().required(),
            ville: Joi.string().required(),
            region:  Joi.string().required(),
            pays: Joi.string().required(),
            lat_lng: Joi.string().required()
        }).required(),
//        numero_telephone: Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required(),
        site_internet: Joi.string(),
        type: Joi.string().required(),
//        type: Joi.string().valid('autre', 'mobile', 'fixe'),
        code_uai: Joi.string().required()
    })

    try {
        const body = await schema.validateAsync(req.body);
        const nouvelleEcole = Ecole({
            nom: body.nom,
            public: body.public,
            adresse:{
                departement: body.line1,
                ville: body.ville,
                region: body.region,
                pays: body.pays,
                lat_lng: body.lat_lng
            },
            site_internet: body.site_internet,
//            type: body.type,
            code_uai: body.code_uai
        });

        nouvelleEcole.save((error, nouvelleEcoleBDD) => {
            if (error) {
                res.status(400).send(error.message);
            } else {
                res.status(200).json({
                    texte: "Ajouté !",
                    ecole: nouvelleEcoleBDD
                });
            }
        })
    } 
    catch (error) {
        res.status(400).send(error.message);
    }
})
//error ou error.msg

router.get('/list', async (req,res) =>{
    const schema = Joi.object({
        limit: Joi.number().min(0).max(1000),
        page: Joi.number().min(0),
        nom: Joi.string(),
        ville: Joi.string()
    });

    try {
        const query = await schema.validateAsync(req.query);
        
        const listEcole = await ecoleTools.list_Ecole(query.limit, query.page, query.nom,query.ville).catch(error => {
            res.status(400).send(error.message)
        })
        console.log("on affiche le resultat");

        res.status(200).json({
            texte: "Liste de " + query.limit + " ecoles",
            ecoles: listEcole
        })
    } catch(error) {
        res.status(400).send(error.message);
    }

})

module.exports = router;