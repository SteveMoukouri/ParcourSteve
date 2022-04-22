const express = require('express');
const router = express.Router();
const Joi = require('joi');
var sha1 = require("crypto-js/sha1");
const jwt = require('jsonwebtoken');
const moment = require('moment');

const User = require('../mongodb-schemas/user');
const ecoleTools = require('../tools/ecoleTools');

router.get('/', (req, res) => {
    res.send('API works');
});

router.post('/login', async (req, res) => {
    const schema = Joi.object({
        email_or_username: Joi.string().required(),
        password: Joi.string().required()
    });

    try {
        const body = await schema.validateAsync(req.body);

        const user = await User.findOne({ $or: [ { email: body.email_or_username }, { username: body.email_or_username } ], password: sha1(body.password).toString() })
        
        const token = jwt.sign({
            userId: user._id
        }, process.env.SECRETKEYTOKEN, { expiresIn: '60h' });

        res.status(200).json({
            token: token
        });
    } catch(error) {
        res.status(400).send(error.message);
    }
});

router.post('/register', async (req, res) => {
    const schema = Joi.object({
        lastname: Joi.string().max(100).required(),
        firstname: Joi.string().max(100).required(),
        username: Joi.string().max(20).required(),
        birthday: Joi.date(),
        password: Joi.string().required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr'] } }).required(),
        department: Joi.string(),
        city: Joi.string(),
        region: Joi.string(),
        country: Joi.string()
    });

    try {
        const body = await schema.validateAsync(req.body);

        const user = new User({
            name: {
                first: body.firstname,
                last: body.lastname,
            },
            username: body.username,
            birthday: moment(body.birthday, 'YYYY-MM-DD'),
            password: sha1(body.password).toString(),
            email: body.email
        });
        const newUser = await user.save().catch(error => {
            res.status(400).send(error.message);
        });
        if (newUser) {
            res.status(200).json(newUser);
        }
    } catch(error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;