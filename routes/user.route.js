const express = require('express');
const router = express.Router();

const { get, update, hey, list } = require('../controllers/user.controller');

router.get('/list', list);
router.get('/hey/:nom/:prenom', hey);
router.get('/:username', get);
router.put('/', update);


module.exports = router;