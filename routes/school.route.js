const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { add, list, get } = require('../controllers/school.controller');

const Ecole = require('../mongodb-schemas/ecole');
const ecoleTools = require('../services/ecoleTools');

router.get('/get/:id', get );

router.post('/', add);
//error ou error.msg

router.get('/list', list );

module.exports = router;