const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { list, jobSchool } = require('../controllers/job.controller');

router.get('/list', list);

router.get('/job_school', jobSchool);

module.exports = router;