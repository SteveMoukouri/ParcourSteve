const express = require('express');
const router = express.Router();
const Joi = require('joi');

const Ecole = require('../mongodb-schemas/ecole');
const userTools = require('../tools/userTools');
const Users = require("../mongodb-schemas/user");
const UserTools = require('../tools/userTools');

router.get('/me', async (req, res) => {
    try {
        console.log("JE RENTRE DANS LE TRY \n");
        const user = await Users.findById(req.headers.userId).catch(error =>{
            res.status(400).send(error);
        })
        console.log("J AFFICHE le USER: \n ", user)
        if(user){
            res.status(200).json({
                text: "Voici votre profil",
                profil:user
            })
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/update', async (req,res) => {
    const schema = Joi.object({
        lastname: Joi.string().max(100).required(),
        firstname: Joi.string().max(100).required(),
        password: Joi.string().required(),
        department: Joi.string(),
        city: Joi.string(),
        region: Joi.string(),
        country: Joi.string()
    });

    try {
        const body = await schema.validateAsync(req.body);
        const userUpdate = await UserTools.update(req.headers.userId, body.lastaname,body.firstname,body.password,body.department,body.city,body.region,body.country).catch(error => {
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