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
        address: Joi.object({
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
        const nouvelleEcole = new Ecole({
            nom: body.nom,
            public: body.public,
            address:{
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

            const ecole = await ecoleTools.list_Ecole(query.limit,query.page,location,query.min,query.max).catch(error => {
                res.status(400).send(error.message)
            });

            res.status(200).json({
                text: "La liste des ecoles est : ",
                ecoles : ecole
            });
        }
    } catch(error) {
        res.status(400).send(error.message);
    }

})

module.exports = router;