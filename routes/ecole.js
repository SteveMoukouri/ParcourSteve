const express = require('express');
const router = express.Router();
const Joi = require('joi');

const Ecole = require('../mongodb-schemas/ecole_new');
const globalFunc = require('../routes/fonctions/global');

router.post('/addEcole',async (req,res) => {
    const schema = Joi.object({
        nom: Joi.string().required().max(100),
        public: Joi.boolean().required(),
        adresse: Joi.object({
            line1: Joi.string().required(),
            line2: Joi.string().required(),
            code_postal: Joi.string().required(),
            ville: Joi.string().required(),
            region:  Joi.string().required(),
            pays: Joi.string().required(),
            lat_lng: Joi.string().required()
        }).required(),
        numero_telephone: Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required(),
        site_internet: Joi.string(),
        type: Joi.string().required(),
        age: Joi.number().integer().min(12).max(110).required(),
        type: Joi.string().valid('autre', 'mobile', 'fixe'),
        reseau_sociaux: Joi.object({
            facebook: Joi.string(),
            linkedin: Joi.string(),
            twitter: Joi.string(),
            instagram: Joi.string(),
            youtube: Joi.string()
        }),
        code_uai: Joi.string().required()
        // bde ? note?
        //diplome entree / fin ?
    })

    try {
        const body = await schema.validateAsync(req.body);
        const nouvelleEcole = Ecole({
            nom: body.nom,
            public: body.public,
            adresse:{
                line1: body.line1,
                line2: body.line2,
                code_postal: body.code_postal,
                ville: body.ville,
                region: body.region,
                pays: body.pays,
                lat_lng: body.lat_lng
            },
            numero_telephone: body.numero_telephone,
            site_internet: body.site_internet,
            type: body.type,
            reseaux_sociaux: {
                facebook: body.facebook,
                linkedin: body.linkedin,
                twitter: body.twitter,
                instagram: body.instagram,
                youtube: body.youtube
            },
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
router.get('/listEcole', async (req,res) =>{

    // const listEcole = await Ecole.find({}).limit(value).catch(error =>{
    //        res.status(400).send(error);
    //     });
    
    //     res.status(200).json({
    //         texte: "Voici une liste de 100 écoles",
    //         ecoles: listEcole
    //     }) 

    let value = parseInt(req.query.value);
    const listEcole = await globalFunc.list_Ecole(value,req.query.nom,req.query.ville).catch(error => {
        res.status(400).send(error.message)
    })
    console.log("on affiche le resultat");

    res.status(200).json({
        texte: "Liste de " + value + " ecoles",
        ecoles: listEcole
    })

})

module.exports = router;