const express = require('express');
const { list, add, create } = require('../controllers/need_help.controller');
const router = express.Router();


router.post('/create', create );

router.post('/addHelper',add);

router.get('/list',list);

module.exports = router;

