const express = require('express');
const { add, list, list_Follow, list_Follower } = require('../controllers/follow.controller');
const router = express.Router();


router.post('/:idFollow', add);

router.get('/listFollow', list_Follow);

router.get('/listFollower', list_Follower );

module.exports = router;