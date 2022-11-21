const express = require('express');
const { add, list_school_formations } = require('../controllers/formation.controller');
const router = express.Router();


router.post('/',add);

router.get('/schoolFormation',list_school_formations);



module.exports = router;