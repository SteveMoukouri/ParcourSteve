const express = require('express');
const router = express.Router();
const Joi = require('joi');

const Ecole = require('../mongodb-schemas/ecole');
const ecoleTools = require('../tools/ecoleTools');

router.get('/', (req, res) => {
    res.send('API works');
});

module.exports = router;