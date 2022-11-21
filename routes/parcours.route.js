const express = require('express');
const { selectJob, selectFormation, create, update, list, addHelper, deleteParcours, parcoursFormation, detailFormation } = require('../controllers/parcours.controller');
const router = express.Router();


router.get('/selectJob', selectJob);

router.post('/selectFormation', selectFormation);

router.post('/create', create );

router.put('/:idParcours', update);

router.get('/list/:userID', list);

router.post('/addHelper', addHelper);

router.delete('/:idParcours', deleteParcours );

router.get('/formations',parcoursFormation);

router.get('/detailFormation/:idFormation',detailFormation);

module.exports = router;