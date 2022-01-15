const express = require('express');
const router = express.Router();
const Joi = require('joi');

router.get('/', (req, res) => {
    res.send("API works");
})

module.exports = router;