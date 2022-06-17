const express = require('express');
const router = express.Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const Ecole = require('../mongodb-schemas/ecole');
const userTools = require('../tools/userTools');
const Users = require("../mongodb-schemas/user");
const UserTools = require('../tools/userTools');

router.get('/', async (req, res) => {
    const schema = Joi.object({
        username: Joi.string().required()
    });

    try {
        const query = await schema.validateAsync(req.query);
        const user = await UserTools.get(query.username, req.headers.userId).catch(error =>{
            res.status(400).send(error.message);
        });
        if(user){
            res.status(200).json({
                message: "Voici le profile de l'utilisateur",
                user: user,
            })
        }
    }catch(error){
        res.status(400).send(error.message);
    }
})

router.post('/update', async (req,res) => {
    const schema = Joi.object({
        password: Joi.string().required(),
        department: Joi.string().required(),
        city: Joi.string().required(),
        region: Joi.string().required(),
        country: Joi.string().required(),
        public: Joi.boolean().required(),
        twitter: Joi.string().regex(new RegExp("^twitter\.com\/.+")),
        instagram: Joi.string().regex(new RegExp("^instagram\.com\/.+")),
        facebook: Joi.string().regex(new RegExp("^facebook\.com\/.+")),
        linkedin: Joi.string().regex(new RegExp("^linkedin\.com\/in\/.+")),
        about: Joi.string().required()
    });

    try {
        const body = await schema.validateAsync(req.body);
        const userUpdate = await UserTools.update(req.headers.userId, 
            body.password,body.department,body.city,body.region,
            body.country,body.public,body.twitter,body.instagram,
            body.facebook,body.linkedin,body.about).catch(error => {
            res.status(400).send(error.message)
        })
        if(userUpdate){
            res.status(200).json({
                text: "L'utilisateur a bien été modifié",
                user : userUpdate
            })
        }
      
    } catch(error) {
        res.status(400).send(error.message);
    }

})

module.exports = router;