const express = require('express');
const { add, addNoteParcours, getFavUserParcours, getRatingsParcours } = require('../controllers/note.controller');
const router = express.Router();


router.post('/add', add );

router.post('/addNoteParcours',addNoteParcours);

router.get('/favUserParcours/:id_user',getFavUserParcours);

router.get('/ratingsParcours',getRatingsParcours);

module.exports = router;
